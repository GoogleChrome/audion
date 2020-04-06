/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audion.entryPoints.tracing');

goog.require('audion.entryPoints.ExtensionTag.FromTracing');
goog.require('audion.entryPoints.ExtensionTag.ToTracing');
goog.require('audion.messaging.MessageType');
goog.require('audion.messaging.NodePropertyType');


/**
 * The data type for the ID unique to each resource.
 * @typedef {number}
 * @private
 */
audion.entryPoints.Id_;


/**
 * Stores data on an AudioContext.
 * @typedef{{
 *   id: audion.entryPoints.Id_,
 * }}
 * @private
 */
audion.entryPoints.AudioContextData_;


/**
 * Stores data on an AudioNode ... as well as the AudioNode. We may later plan
 * to remove the reference to the audio node for AudioBufferSourceNodes so that
 * the buffers they refer to can be garbage-collected. That is why that field is
 * nullable.
 * @typedef{{
 *   id: audion.entryPoints.Id_,
 *   node: ?AudioNode
 * }}
 * @private
 */
audion.entryPoints.AudioNodeData_;


/**
 * Stores data on an AudioParam. This stores no reference to the AudioParam:
 * The param can be readily accessed via the AudioNode.
 * @typedef{{
 *   id: audion.entryPoints.Id_,
 *   audioNodeId: audion.entryPoints.Id_,
 *   propertyName: string
 * }}
 * @private
 */
audion.entryPoints.AudioParamData_;


/**
 * The name of a property (assigned to resources) for the resource ID.
 * @private @const {string}
 */
audion.entryPoints.resourceIdField_ = '__resource_id__';


/**
 * If we need a new ID for anything, we just increment this value. Every
 * BaseAudioContext, AudioNode, and AudioParam gets a unique ID.
 * @type {number}
 */
audion.entryPoints.nextAvailableId_ = 1;


/**
 * The keys of this object comprise a set of IDs of AudioNodes that the user is
 * interested in inspecting. We will periodically send back property-value data
 * on each AudioNode in this set until the node becomes unhighlighted. The
 * values of this object are all 1.
 * @private {!Object.<audion.entryPoints.Id_, number>}
 */
audion.entryPoints.highlightedAudioNodeIds_ = {};


/**
 * The requestAnimationFrameId for the rendering cycles used to report data on
 * the properties of a node back to the dev tools script. This value is used to
 * later cancel sending back the data. This value is null if no rAF is pending.
 * @private {?number}
 */
audion.entryPoints.reportDataAnimationFrameId_ = null;


/**
 * Maps IDs to data objects (see type defs above). Each resource (
 * AudioContext, AudioNode, and AudioParam) has its own ID.
 * @private {!Object.<audion.entryPoints.Id_, !Object>}
 */
audion.entryPoints.idToResource_ = {};


/**
 * Read-only properties present on all nodes.
 * @private @const {!Array.<string>}
 */
audion.entryPoints.readOnlyAudioNodeProperties_ =
    ['numberOfInputs', 'numberOfOutputs'];


/**
 * Modifiable (and non-enum) properties present on all nodes.
 * @private @const {!Array.<string>}
 */
audion.entryPoints.modifiableAudioNodeProperties_ = ['channelCount'];


/**
 * Properties present on all nodes.
 * @private @const {!Array.<string>}
 */
audion.entryPoints.enumAudioNodeProperties_ =
    ['channelCountMode', 'channelInterpretation'];


/**
 * Properties present on AudioBuffers.
 * @private @const {!Array.<string>}
 */
audion.entryPoints.enumAudioBufferProperties_ =
    ['sampleRate', 'length', 'duration', 'numberOfChannels'];


/**
 * If set to true, Web Audio Inspector no longer tracks web audio calls so that
 * AudioNodes can be GC-ed. This is desired when the user is not using developer
 * tools.
 */
audion.entryPoints.audioUpdatesAreMissing_ = false;


/**
 * A reference to a native function that performs the logic of
 * Function.prototype.bind([CONSTRUCTOR], arguments ...). We need this reference
 * because we rely on using that logic to construct various objects, but some
 * libraries such as prototype.js override the native bind and apply methods.
 * @private {!Function}
 */
audion.entryPoints.nativeBindApplyMethod_ = Function.prototype.apply.bind(
    Function.prototype.bind);


/**
 * @return {string} The target that postMessage should use to issue messages to
 *     this page.
 * @private
 */
audion.entryPoints.determinePostMessageTarget_ = function() {
   var origin = window.location.origin
   if (origin && origin.indexOf('file:') != 0) {
     // We try to use as specific an origin as possible. But also, as of this
     // writing, posting a message to a page at a file: URL requires that the
     // target origin argument be '*', so we accommodate that.
     return origin;
   }
   return '*';
};


/**
 * The target that postMessage uses to issue messages to this page. Those
 * messages could be picked up by the tracing code injected into the page via
 * the content script.
 * @private @const {string}
 */
audion.entryPoints.postMessageTarget_ =
    audion.entryPoints.determinePostMessageTarget_();


/**
 * Posts a message to the content script. Adds a tag to the message to
 * indicate that the message comes from this extension.
 * @param {!AudionMessage} messageToSend
 * @private
 */
audion.entryPoints.postToContentScript_ = function(messageToSend) {
  messageToSend.tag = audion.entryPoints.ExtensionTag.FromTracing;
  // Post the message to this window only. The content script will pick it up.
  window.postMessage(messageToSend, audion.entryPoints.postMessageTarget_);
}


/**
 * Counts the number of highlighted audio nodes (that we are interested in
 * periodically sending back data on).
 * @return {number}
 * @private
 */
audion.entryPoints.countHighlightedAudioNodes_ = function() {
  var count = 0;
  for (var nodeId in audion.entryPoints.highlightedAudioNodeIds_) {
    count++;
  }
  return count;
};


/**
 * Returns a string that it pretends is a number.
 * The Closure compiler thinks that every key in a for loop through an object is
 * a string, even if we typed the object to contain numbers. Casting the string
 * to a number doesn't work since a number technically is not a subtype of a
 * string, and I am loath to incur the latency of using parseInt.
 * @return {number}
 * @private
 * @suppress {checkTypes}
 */
audion.entryPoints.coerceStringToNumber_ = function(someString) {
  return someString;
};


/**
 * Adds AudioNode properties related to an AudioBuffer to a list.
 * @param {!Array.<!AudionPropertyValuePair>} propertyValues The list to append
 *     to. This list is destructively modified.
 * @param {?AudioBuffer} buffer The AudioBuffer to glean properties from if any.
 * @private
 */
audion.entryPoints.addBufferRelatedProperties_ = function(
    propertyValues, buffer) {
  if (buffer) {
    // Get info on the audio buffer.
    var bufferReadOnlyProperties =
        audion.entryPoints.enumAudioBufferProperties_;
    for (var i = 0; i < bufferReadOnlyProperties.length; i++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: bufferReadOnlyProperties[i],
        propertyType: audion.messaging.NodePropertyType.BUFFER_MUTABLE_NUMBER,
        value: buffer[bufferReadOnlyProperties[i]]
      }));
    }
  } else {
    propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
      property: 'buffer',
      propertyType: audion.messaging.NodePropertyType.BUFFER_READ_ONLY,
      value: 'N/A'
    }));
  }
};


/**
 * Assigns a read-only ID property to an object.
 * @param {!Object} resource
 * @param {audion.entryPoints.Id_} id
 * @private
 */
audion.entryPoints.assignIdProperty_ = function(resource, id) {
  Object.defineProperty(resource, audion.entryPoints.resourceIdField_, {
    value: id,
    writable: false
  });
};


/**
 * Determines the channel to use in the graph visualization based on a user
 * argument for either input or output channel. This function is necessary
 * because the values passed into those arguments are sometimes not numbers, and
 * in those cases, the Web Audio API behaves gracefully (defaults to 0), but the
 * extension throws an exception.
 * @param {*} channelValue Whatever the caller passed as the channel. This could
 *     be anything. Ideally, it's either a number or undefined.
 * @private
 */
audion.entryPoints.determineChannelValue_ = function(channelValue) {
  // Try converting value into a number if it is not one already. If it is a
  // string, this will convert as expected, ie "42" to 42. Otherwise, we default
  // to 0 as the Web Audio API does. For instance, unexpected objects passed as
  // a channel argument get converted to 0.
  return Number(channelValue) || 0;
};


/**
 * Instruments a newly created node and its AudioParams.
 * @param {!AudioNode} node
 * @private
 */
audion.entryPoints.instrumentNode_ = function(node) {
  if (audion.entryPoints.audioUpdatesAreMissing_) {
    // The user would have to refresh to use Web Audio Inspector anyway. Let
    // resources such as AudioNodes be GC-ed.
    return;
  }

  var nodeId = audion.entryPoints.nextAvailableId_++;
  audion.entryPoints.assignIdProperty_(node, nodeId);
  audion.entryPoints.idToResource_[nodeId] =
      /** @type {!audion.entryPoints.AudioNodeData_} */ ({
    id: nodeId,
    node: node
  });

  // Instrument AudioParams.
  var audioParamNames = [];
  for (var prop in node) {
    var audioParam = node[prop];
    if (audioParam instanceof AudioParam) {
      // Store the ID of the node the param belongs to. And the param name.
      var audioParamId = audion.entryPoints.nextAvailableId_++;
      audion.entryPoints.assignIdProperty_(audioParam, audioParamId);
      audion.entryPoints.idToResource_[audioParamId] =
          /** @type {!audion.entryPoints.AudioParamData_} */ ({
            id: audioParamId,
            audioNodeId: nodeId,
            propertyName: prop
          });
      audioParamNames.push(prop);
    }
  }

  // Notify extension about the addition of a new node.
  audion.entryPoints.postToContentScript_(
      /** @type {!AudionNodeCreatedMessage} */ ({
    type: audion.messaging.MessageType.NODE_CREATED,
    nodeId: nodeId,
    nodeType: node.constructor.name,
    numberOfInputs: node.numberOfInputs,
    numberOfOutputs: node.numberOfOutputs,
    audioParamNames: audioParamNames,
    isOffline: node.context instanceof OfflineAudioContext
    // TODO(chizeng): Include a stack trace for the creation of the node.
  }));
};


/**
 * Creates either an AudioContext or OfflineAudioContext.
 * @param {!Function} nativeConstructor
 * @param {!Array.<*>} argumentsList A list of argument params.
 * @param {boolean} isOffline Whether this context is an offline one.
 * @return {!BaseAudioContext} The constructed subclass.
 * @private
 */
audion.entryPoints.createBaseAudioContextSubclass_ = function(
    nativeConstructor, argumentsList, isOffline) {
  // Null is the context. We cannot append to Arguments because it's not a
  // list. We convert it to a list by slicing.
  var newContext = /** @type {!BaseAudioContext} */ (
      new (audion.entryPoints.nativeBindApplyMethod_(
          nativeConstructor, [null].concat(argumentsList))));

  if (audion.entryPoints.audioUpdatesAreMissing_) {
    // The user would have to refresh to use Web Audio Inspector anyway. Let
    // resources such as AudioNodes be GC-ed.
    return newContext;
  }

  var audioContextId = audion.entryPoints.nextAvailableId_++;
  audion.entryPoints.assignIdProperty_(newContext, audioContextId);
  audion.entryPoints.idToResource_[audioContextId] =
      /** @type {!audion.entryPoints.AudioContextData_} */ ({
        id: audioContextId
      });

  // Tell the extension that we have created a new AudioContext.
  audion.entryPoints.postToContentScript_(
      /** @type {!AudionContextCreatedMessage} */ ({
        type: audion.messaging.MessageType.CONTEXT_CREATED,
        contextId: audioContextId
      }));

  // Instrument the destination node.
  audion.entryPoints.instrumentNode_(newContext.destination);
  return newContext;
};


/**
 * Adds properties specific to the AudioNode type to a given list.
 * @param {!Array.<!AudionPropertyValuePair>} propertyValues The list to append
 *     to. This list is destructively modified.
 * @param {!AudioNode} node The AudioNode to glean properties from.
 * @private
 */
audion.entryPoints.addAudioNodeSpecificProperties_ = function(
    propertyValues, node) {
  var readOnlyProperties;
  var mutableBooleanProperties;
  var mutableNumberProperties;
  var mutableObjectProperties;
  var enumProperties;
  switch (node.constructor) {
    case AnalyserNode:
      readOnlyProperties = ['frequencyBinCount'];
      mutableNumberProperties =
          ['fftSize', 'minDecibels', 'maxDecibels', 'smoothingTimeConstant'];
      break;
    case AudioBufferSourceNode:
      node = /** @type {!AudioBufferSourceNode} */ (node);
      mutableBooleanProperties = ['loop'];
      mutableNumberProperties = ['loopStart', 'loopEnd'];
      audion.entryPoints.addBufferRelatedProperties_(
          propertyValues, node.buffer);
      break;
    case AudioDestinationNode:
      readOnlyProperties = ['maxChannelCount'];
      break;
    case BiquadFilterNode:
      enumProperties = ['type'];
      break;
    case ConvolverNode:
      node = /** @type {!ConvolverNode} */ (node);
      mutableBooleanProperties = ['normalize'];
      audion.entryPoints.addBufferRelatedProperties_(
          propertyValues, node.buffer);
      break;
    case DynamicsCompressorNode:
      readOnlyProperties = ['reduction'];
      break;
    case OscillatorNode:
      enumProperties = ['type'];
      break;
    case PannerNode:
      mutableNumberProperties = [
          'coneInnerAngle',
          'coneOuterAngle',
          'coneOuterGain',
          'maxDistance',
          'refDistance',
          'rolloffFactor'
        ];
      enumProperties = ['distanceModel', 'panningModel'];
      break;
    case ScriptProcessorNode:
      readOnlyProperties = ['bufferSize'];
      break;
    case WaveShaperNode:
      node = /** @type {!WaveShaperNode} */ (node);
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: 'curve__length',
        propertyType: audion.messaging.NodePropertyType.READ_ONLY,
        value: node.curve ? node.curve.length : 0
      }));
      enumProperties = ['oversample'];
      break;
  }

  if (readOnlyProperties) {
    for (var i = 0; i < readOnlyProperties.length; i++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: readOnlyProperties[i],
        propertyType: audion.messaging.NodePropertyType.READ_ONLY,
        value: node[readOnlyProperties[i]]
      }));
    }
  }
  if (mutableBooleanProperties) {
    for (var i = 0; i < mutableBooleanProperties.length; i++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: mutableBooleanProperties[i],
        propertyType: audion.messaging.NodePropertyType.MUTABLE_BOOLEAN,
        value: node[mutableBooleanProperties[i]]
      }));
    }
  }
  if (mutableNumberProperties) {
    for (var i = 0; i < mutableNumberProperties.length; i++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: mutableNumberProperties[i],
        propertyType: audion.messaging.NodePropertyType.MUTABLE_NUMBER,
        value: node[mutableNumberProperties[i]]
      }));
    }
  }
  if (enumProperties) {
    for (var i = 0; i < enumProperties.length; i++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: enumProperties[i],
        propertyType: audion.messaging.NodePropertyType.ENUM,
        value: node[enumProperties[i]]
      }));
    }
  }
};


/**
 * Scrapes data on properties of nodes being highlighted and sends that data
 * back to the background script (and then the dev tools script). This should be
 * run sparingly (maybe once every tens of ms) because scraping the data is
 * potentially expensive.
 * @private
 */
audion.entryPoints.sendBackNodeData_ = function() {
  // Requre another animation frame be scheduled for another round of
  // peridiocally sending data back to dev tools.
  audion.entryPoints.reportDataAnimationFrameId_ = null;

  var atLeast1MessageSent = false;
  for (var nodeId in audion.entryPoints.highlightedAudioNodeIds_) {
    // There is at least 1 node we are inspecting.
    atLeast1MessageSent = true;

    nodeId = audion.entryPoints.coerceStringToNumber_(nodeId);
    var nodeData = /** @type {!audion.entryPoints.AudioNodeData_} */ (
        audion.entryPoints.idToResource_[nodeId]);

    // Scrape data on the various properties of the node.
    var node = nodeData.node;
    var propertyValues = [];

    // TODO:(chizeng): Handle case in which nodeData.node is null because
    // we removed the reference to the node in order for buffer to be GCed.

    // Obtain info on AudioParams.
    for (var propertyName in node) {
      if (node[propertyName] instanceof AudioParam) {
        // Report the value of the audio param.
        propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
          property: propertyName,
          propertyType: audion.messaging.NodePropertyType.AUDIO_PARAM,
          value: node[propertyName].value
        }));
      }
    }

    // Report the context of this node.
    propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
      property: 'context type',
      propertyType: audion.messaging.NodePropertyType.READ_ONLY,
      value: node.context.constructor.name
    }));
    propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
      property: 'context ID',
      propertyType: audion.messaging.NodePropertyType.READ_ONLY,
      value: node.context[audion.entryPoints.resourceIdField_]
    }));

    // Obtain info on certain params present on all AudioNodes.
    var properties =
        audion.entryPoints.readOnlyAudioNodeProperties_;
    for (var p = 0; p < properties.length; p++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: properties[p],
        propertyType: audion.messaging.NodePropertyType.READ_ONLY,
        value: node[properties[p]]
      }));
    }
    properties = audion.entryPoints.modifiableAudioNodeProperties_;
    for (var p = 0; p < properties.length; p++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: properties[p],
        propertyType: audion.messaging.NodePropertyType.MUTABLE_NUMBER,
        value: node[properties[p]]
      }));
    }
    properties = audion.entryPoints.enumAudioNodeProperties_;
    for (var p = 0; p < properties.length; p++) {
      propertyValues.push(/** @type {!AudionPropertyValuePair} */ ({
        property: properties[p],
        propertyType: audion.messaging.NodePropertyType.ENUM,
        value: node[properties[p]]
      }));
    }

    // Obtain values specific to the type of AudioNode.
    audion.entryPoints.addAudioNodeSpecificProperties_(propertyValues, node);

    // Issue a message that contains data on this node.
    audion.entryPoints.postToContentScript_(
        /** @type {!AudionAudioNodePropertiesUpdateMessage} */ ({
      type: audion.messaging.MessageType.AUDIO_NODE_PROPERTIES_UPDATE,
      audioNodeId: nodeId,
      audioNodeType: nodeData.node.constructor.name,
      propertyValues: propertyValues
    }));
  }

  if (atLeast1MessageSent) {
    // Schedule another round to possibly send more data back.
    audion.entryPoints.initiateDataSendBackNodeDataCycle_();
  }
};


/**
 * Initiates the process of periodically sending back data on the properties of
 * audio nodes. Assumes that the set of highlighted nodes (to send back data on)
 * is initially non-empty. The process automatically stops when there are no
 * nodes to send back data on.
 * @private
 */
audion.entryPoints.initiateDataSendBackNodeDataCycle_ = function() {
  if (audion.entryPoints.reportDataAnimationFrameId_ ||
      audion.entryPoints.countHighlightedAudioNodes_() == 0) {
    // The process has already started. Or, we lack nodes to send info on.
    return;
  }

  // Start render cycle to send back data on nodes. Intentionally skip 2 frames.
  // Thus, we send back data on nodes every 3rd frame.
  audion.entryPoints.reportDataAnimationFrameId_ =
      goog.global.requestAnimationFrame(function() {
    audion.entryPoints.reportDataAnimationFrameId_ =
        goog.global.requestAnimationFrame(function() {
      audion.entryPoints.reportDataAnimationFrameId_ =
        goog.global.requestAnimationFrame(audion.entryPoints.sendBackNodeData_);
    })
  });
};


/**
 * Handles what happens when an audio node is highlighted (inspected by the
 * user).
 * @param {!AudionNodeHighlightedMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodeHighlighted_ = function(message) {
  audion.entryPoints.highlightedAudioNodeIds_[message.audioNodeId] = 1;

  // Start render cycle to send back data on nodes if that has not started.
  audion.entryPoints.initiateDataSendBackNodeDataCycle_();
};


/**
 * Handles what happens when an audio node is no longer highlighted (no longer
 * inspected by the user).
 * @param {!AudionNodeUnhighlightedMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodeUnhighlighted_ = function(message) {
  // Remove this node from the list of nodes that we periodically send back data
  // on. The cycle will auto-stop once there are no more highlighted nodes.
  delete audion.entryPoints.highlightedAudioNodeIds_[message.audioNodeId];
};


/**
 * Handles what happens when the background script realizes that this page would
 * need to be refreshed for the user to use Web Audio Inspector. Stops tracking
 * web audio updates so that nodes can be garbage collected.
 * @private
 */
audion.entryPoints.handleMissingAudioUpdates_ = function() {
  audion.entryPoints.audioUpdatesAreMissing_ = true;

  // Remove references to resources so they can be GC-ed.
  audion.entryPoints.idToResource_ = {};
  audion.entryPoints.highlightedAudioNodeIds_ = {};
};


/**
 * The entry point for tracing (ie detecting) web audio API calls. Suppress
 * type-checking for this function - it does crazy stuff with prototype
 * overrides that makes the compiler go AHHH!. Keep all logic within the scope
 * of this function - this is called as a closure.
 *
 * This JS runs once in every window or frame.
 *
 * @suppress {checkTypes}
 */
audion.entryPoints.tracing = function() {
  /**
   * Logs a message to the console for debugging.
   * @param {string} message
   */
  function logMessage(message) {
    window.console.log(message);
  }


  /**
   * Wraps a native function with a decorator function. That decorator function
   * takes a reference to the original native function and a list of arguments
   * used to call it.
   * @param {function(...*):*} originalNativeFunction A reference to the
   *     original native function we are overriding.
   * @param {function(function(...*):*, !Array.<*>):*} decorator The function
   *     that takes the original native function as the first argument and a
   *     a list of original arguments.
   * @return {function(...*):*} The wrapped / decorated function.
   */
  function wrapNativeFunction(originalNativeFunction, decorator) {
    return function() {
      return decorator.call(this, originalNativeFunction, arguments);
    };
  }

  // Keep a reference to the native AudioContext constructor. We later override
  //
  var nativeAudioContextConstructor = AudioContext;

  // We now trace connect and disconnects.

  /**
   * Wraps the web audio connect method.
   * @param {function(...*):*} nativeBoundConnect The native connect method.
   *     This is the apply method already bound to the connect method. We bind
   *     the apply method because other libraries may actually override the
   *     apply method.
   * @param {!Array.<*>} originalArguments The original arguments connect was
   *     called with.
   * @return {*} Whatever the connect method returns.
   * @this {!AudioNode}
   */
  function connectDecorator(nativeBoundConnect, originalArguments) {
    var result = nativeBoundConnect(this, originalArguments);

    if (audion.entryPoints.audioUpdatesAreMissing_) {
      // The user would have to refresh to use Web Audio Inspector anyway. Let
      // resources such as AudioNodes be GC-ed.
      return result;
    }

    // TODO: Figure out what happens if we connect with something falsy (or
    // nothing at all). Do we disconnect?
    if (originalArguments.length == 0 || !originalArguments[0]) {
      return result;
    }

    var otherThing = originalArguments[0];
    var otherThingId = otherThing[audion.entryPoints.resourceIdField_];

    // If no input / output is specified, default to 0.
    var fromChannel = audion.entryPoints.determineChannelValue_(
        originalArguments[1]);
    var toChannel = audion.entryPoints.determineChannelValue_(
        originalArguments[2]);
    if (otherThingId) {
      // Warn if we cannot identify what we are connecting from.
      var sourceResourceId = this[audion.entryPoints.resourceIdField_];
      if (!sourceResourceId) {
        console.warn(
            'Audion could not identify the object calling "connect": ', this);
      }

      // Notify the extension of a connection with either an AudioNode or an
      // AudioParam.
      if (otherThing instanceof AudioNode) {
        audion.entryPoints.postToContentScript_(
            /** type {!AudionNodeToNodeConnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_TO_NODE_CONNECTED,
              sourceNodeId: sourceResourceId,
              destinationNodeId: otherThingId,
              fromChannel: fromChannel,
              toChannel: toChannel
            }));
      } else if (otherThing instanceof AudioParam) {
        var audioParamData =
            /** @type {!audion.entryPoints.AudioParamData_} */ (
                audion.entryPoints.idToResource_[otherThingId]);
        audion.entryPoints.postToContentScript_(
            /** type {!AudionNodeToParamConnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED,
              sourceNodeId: sourceResourceId,
              destinationNodeId: audioParamData.audioNodeId,
              destinationParamName: audioParamData.propertyName,
              fromChannel: fromChannel
            }));
      }
    }
    return result;
  }
  /** @override */
  AudioNode.prototype.connect = wrapNativeFunction(
      Function.prototype.apply.bind(AudioNode.prototype.connect),
      connectDecorator);


  /**
   * Wraps the web audio disconnect method.
   * @param {function(...*):*} nativeBoundDisconnect The native disconnect
   *     method. This is the apply method already bound to the connect method.
   *     We bind the apply method because other libraries may actually override
   *     the apply method.
   * @param {!Array.<*>} originalArguments The original arguments disconnect was
   *     called with.
   * @return {*} Whatever the disconnect method returns.
   * @this {!AudioNode}
   */
  function disconnectDecorator(nativeBoundDisconnect, originalArguments) {
    var result = nativeBoundDisconnect(this, originalArguments);

    if (audion.entryPoints.audioUpdatesAreMissing_) {
      // The user would have to refresh to use Web Audio Inspector anyway. Let
      // resources such as AudioNodes be GC-ed.
      return result;
    }

    if (originalArguments.length == 0 || !originalArguments[0]) {
      // All edges emanating from this node gad been removed.
      audion.entryPoints.postToContentScript_(
          /** @type {!AudionAllDisconnectedMessage} */ ({
            type: audion.messaging.MessageType.ALL_DISCONNECTED,
            nodeId: this[audion.entryPoints.resourceIdField_]
          }));
      return result;
    }

    var otherThing = originalArguments[0];

    // Default to input / output 0.
    var fromChannel = audion.entryPoints.determineChannelValue_(
        originalArguments[1]);
    var toChannel = audion.entryPoints.determineChannelValue_(
        originalArguments[2]);

    var otherThingId = otherThing[audion.entryPoints.resourceIdField_];
    if (otherThingId) {
      // We disconnect from a specific AudioNode or an AudioParam.
      if (otherThing instanceof AudioNode) {
        audion.entryPoints.postToContentScript_(
            /** @type {!AudionNodeFromNodeDisconnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              disconnectedFromNodeId: otherThingId,
              fromChannel: fromChannel,
              toChannel: toChannel
            }));
      } else if (otherThing instanceof AudioParam) {
        var audioParamData =
            /** @type {!audion.entryPoints.AudioParamData_} */ (
                audion.entryPoints.idToResource_[otherThingId]);
        audion.entryPoints.postToContentScript_(
            /** @type {!AudionNodeFromParamDisconnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_FROM_PARAM_DISCONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              disconnectedFromNodeId: audioParamData.audioNodeId,
              audioParamName: audioParamData.propertyName,
              fromChannel: fromChannel
            }));
      }
    }
    return result;
  }
  /** @override */
  AudioNode.prototype.disconnect = wrapNativeFunction(
      Function.prototype.apply.bind(AudioNode.prototype.disconnect),
      disconnectDecorator);


  // We now trace when nodes are created.

  /**
   * Wraps the creation of new AudioNodes.
   * @param {function(...*):*} nativeApplyBoundToMethod This is the native JS
   *     apply method bound to the native create_ method. We bind the apply
   *     method because other libraries might actually override the native apply
   *     method.
   * @param {!Array.<*>} originalArguments
   * @return {!AudioNode}
   * @this {!AudioNode}
   */
  function newNodeDecorator(nativeApplyBoundToMethod, originalArguments) {
    var result = nativeApplyBoundToMethod(this, originalArguments);
    audion.entryPoints.instrumentNode_(result);
    return result;
  };


  /** @override */
  BaseAudioContext.prototype.createAnalyser = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createAnalyser),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createBiquadFilter = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createBiquadFilter),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createBufferSource = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createBufferSource),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createScriptProcessor = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createScriptProcessor),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createChannelMerger = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createChannelMerger),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createChannelSplitter = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createChannelSplitter),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createConvolver = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createConvolver),
  newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createDelay = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createDelay),
  newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createDynamicsCompressor = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createDynamicsCompressor),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createGain = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createGain),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createIIRFilter = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createIIRFilter),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createWaveShaper = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createWaveShaper),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createOscillator = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createOscillator),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createPanner = wrapNativeFunction(
      Function.prototype.apply.bind(BaseAudioContext.prototype.createPanner),
      newNodeDecorator);


  /** @override */
  BaseAudioContext.prototype.createStereoPanner = wrapNativeFunction(
      Function.prototype.apply.bind(
          BaseAudioContext.prototype.createStereoPanner),
      newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaElementSource = wrapNativeFunction(
      Function.prototype.apply.bind(
          AudioContext.prototype.createMediaElementSource),
      newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaStreamDestination = wrapNativeFunction(
      Function.prototype.apply.bind(
          AudioContext.prototype.createMediaStreamDestination),
      newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaStreamSource = wrapNativeFunction(
      Function.prototype.apply.bind(
          AudioContext.prototype.createMediaStreamSource),
      newNodeDecorator);

  // Instrument the AudioNode constructors. AudioNodes could be created from
  // either "create methods" or constructors.

  /**
   * Creates an AudioNode using a constructor. Instruments the AudioNode.
   * @param {!Function} originalConstructor
   * @return {!Array.<*>} argumentsList A *list* of arguments.
   */
  function createAudioNodeUsingConstructor(originalConstructor, argumentsList) {
    // Null is the context. We cannot append to Arguments because it's not a
    // list. We convert it to a list by slicing.
    var audioNode = /** @type {!AudioNode} */ (
        new (audion.entryPoints.nativeBindApplyMethod_(
            originalConstructor, [null].concat(argumentsList))));
    audion.entryPoints.instrumentNode_(audioNode)
    return audioNode;
  }
  if (typeof window['AnalyserNode'] == 'function') {
    var constructorName = 'AnalyserNode';
    var originalAnalyserNodeConstructor = AnalyserNode;
    AnalyserNode = function() {
      return createAudioNodeUsingConstructor(
          originalAnalyserNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    AnalyserNode['prototype'] = originalAnalyserNodeConstructor.prototype;
    AnalyserNode['prototype']['constructor'] = AnalyserNode;
  }
  if (typeof window['BiquadFilterNode'] == 'function') {
    var constructorName = 'BiquadFilterNode';
    var originalBiquadFilterNodeConstructor = BiquadFilterNode;
    BiquadFilterNode = function() {
      return createAudioNodeUsingConstructor(
          originalBiquadFilterNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    BiquadFilterNode['prototype'] =
        originalBiquadFilterNodeConstructor.prototype;
    BiquadFilterNode['prototype']['constructor'] = BiquadFilterNode;
  }
  if (typeof window['AudioBufferSourceNode'] == 'function') {
    var constructorName = 'AudioBufferSourceNode';
    var originalAudioBufferSourceNodeConstructor = AudioBufferSourceNode;
    AudioBufferSourceNode = function() {
      return createAudioNodeUsingConstructor(
          originalAudioBufferSourceNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    AudioBufferSourceNode['prototype'] =
        originalAudioBufferSourceNodeConstructor.prototype;
    AudioBufferSourceNode['prototype']['constructor'] = AudioBufferSourceNode;
  }
  if (typeof window['ScriptProcessorNode'] == 'function') {
    var constructorName = 'ScriptProcessorNode';
    var originalScriptProcessorNodeConstructor = ScriptProcessorNode;
    ScriptProcessorNode = function() {
      return createAudioNodeUsingConstructor(
          originalScriptProcessorNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    ScriptProcessorNode['prototype'] =
        originalScriptProcessorNodeConstructor.prototype;
    ScriptProcessorNode['prototype']['constructor'] = ScriptProcessorNode;
  }
  if (typeof window['ChannelMergerNode'] == 'function') {
    var constructorName = 'ChannelMergerNode';
    var originalChannelMergerNodeConstructor = ChannelMergerNode;
    ChannelMergerNode = function() {
      return createAudioNodeUsingConstructor(
          originalChannelMergerNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    ChannelMergerNode['prototype'] =
        originalChannelMergerNodeConstructor.prototype;
    ChannelMergerNode['prototype']['constructor'] = ChannelMergerNode;
  }
  if (typeof window['ChannelSplitterNode'] == 'function') {
    var constructorName = 'ChannelSplitterNode';
    var originalChannelSplitterNodeConstructor = ChannelSplitterNode;
    ChannelSplitterNode = function() {
      return createAudioNodeUsingConstructor(
          originalChannelSplitterNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    ChannelSplitterNode['prototype'] =
        originalChannelSplitterNodeConstructor.prototype;
    ChannelSplitterNode['prototype']['constructor'] = ChannelSplitterNode;
  }
  if (typeof window['ConvolverNode'] == 'function') {
    var constructorName = 'ConvolverNode';
    var originalConvolverNodeConstructor = ConvolverNode;
    ConvolverNode = function() {
      return createAudioNodeUsingConstructor(
          originalConvolverNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    ConvolverNode['prototype'] = originalConvolverNodeConstructor.prototype;
    ConvolverNode['prototype']['constructor'] = ConvolverNode;
  }
  if (typeof window['DelayNode'] == 'function') {
    var constructorName = 'DelayNode';
    var originalDelayNodeConstructor = DelayNode;
    DelayNode = function() {
      return createAudioNodeUsingConstructor(
          originalDelayNodeConstructor, Array.prototype.slice.call(arguments));
    };
    DelayNode['prototype'] = originalDelayNodeConstructor.prototype;
    DelayNode['prototype']['constructor'] = DelayNode;
  }
  if (typeof window['DynamicsCompressorNode'] == 'function') {
    var constructorName = 'DynamicsCompressorNode';
    var originalDynamicsCompressorNodeConstructor = DynamicsCompressorNode;
    DynamicsCompressorNode = function() {
      return createAudioNodeUsingConstructor(
          originalDynamicsCompressorNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    DynamicsCompressorNode['prototype'] =
        originalDynamicsCompressorNodeConstructor.prototype;
    DynamicsCompressorNode['prototype']['constructor'] = DynamicsCompressorNode;
  }
  if (typeof window['GainNode'] == 'function') {
    var constructorName = 'GainNode';
    var originalGainNodeConstructor = GainNode;
    GainNode = function() {
      return createAudioNodeUsingConstructor(
          originalGainNodeConstructor, Array.prototype.slice.call(arguments));
    };
    GainNode['prototype'] = originalGainNodeConstructor.prototype;
    GainNode['prototype']['constructor'] = GainNode;
  }
  if (typeof window['IIRFilterNode'] == 'function') {
    var constructorName = 'IIRFilterNode';
    var originalIIRFilterNodeConstructor = IIRFilterNode;
    IIRFilterNode = function() {
      return createAudioNodeUsingConstructor(
          originalIIRFilterNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    IIRFilterNode['prototype'] = originalIIRFilterNodeConstructor.prototype;
    IIRFilterNode['prototype']['constructor'] = IIRFilterNode;
  }
  if (typeof window['WaveShaperNode'] == 'function') {
    var constructorName = 'WaveShaperNode';
    var originalWaveShaperNodeConstructor = WaveShaperNode;
    WaveShaperNode = function() {
      return createAudioNodeUsingConstructor(
          originalWaveShaperNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    WaveShaperNode['prototype'] = originalWaveShaperNodeConstructor.prototype;
    WaveShaperNode['prototype']['constructor'] = WaveShaperNode;
  }
  if (typeof window['MediaElementAudioSourceNode'] == 'function') {
    var constructorName = 'MediaElementAudioSourceNode';
    var originalMediaElementAudioSourceNodeConstructor =
        MediaElementAudioSourceNode;
    MediaElementAudioSourceNode = function() {
      return createAudioNodeUsingConstructor(
          originalMediaElementAudioSourceNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    MediaElementAudioSourceNode['prototype'] =
        originalMediaElementAudioSourceNodeConstructor.prototype;
    MediaElementAudioSourceNode['prototype']['constructor'] =
        MediaElementAudioSourceNode;
  }
  if (typeof window['MediaStreamAudioDestinationNode'] == 'function') {
    var constructorName = 'MediaStreamAudioDestinationNode';
    var originalMediaStreamAudioDestinationNodeConstructor =
        MediaStreamAudioDestinationNode;
    MediaStreamAudioDestinationNode = function() {
      return createAudioNodeUsingConstructor(
          originalMediaStreamAudioDestinationNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    MediaStreamAudioDestinationNode['prototype'] =
        originalMediaStreamAudioDestinationNodeConstructor.prototype;
    MediaStreamAudioDestinationNode['prototype']['constructor'] =
        MediaStreamAudioDestinationNode;
  }
  if (typeof window['MediaStreamAudioSourceNode'] == 'function') {
    var constructorName = 'MediaStreamAudioSourceNode';
    var originalMediaStreamAudioSourceNodeConstructor =
        MediaStreamAudioSourceNode;
    MediaStreamAudioSourceNode = function() {
      return createAudioNodeUsingConstructor(
          originalMediaStreamAudioSourceNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    MediaStreamAudioSourceNode['prototype'] =
        originalMediaStreamAudioSourceNodeConstructor.prototype;
    MediaStreamAudioSourceNode['prototype']['constructor'] =
        MediaStreamAudioSourceNode;
  }
  if (typeof window['OscillatorNode'] == 'function') {
    var constructorName = 'OscillatorNode';
    var originalOscillatorNodeConstructor = OscillatorNode;
    OscillatorNode = function() {
      return createAudioNodeUsingConstructor(
          originalOscillatorNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    OscillatorNode['prototype'] =
        originalOscillatorNodeConstructor.prototype;
    OscillatorNode['prototype']['constructor'] = OscillatorNode;
  }
  if (typeof window['PannerNode'] == 'function') {
    var constructorName = 'PannerNode';
    var originalPannerNodeConstructor = PannerNode;
    PannerNode = function() {
      return createAudioNodeUsingConstructor(
          originalPannerNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    PannerNode['prototype'] = originalPannerNodeConstructor.prototype;
    PannerNode['prototype']['constructor'] = PannerNode;
  }
  if (typeof window['StereoPannerNode'] == 'function') {
    var constructorName = 'StereoPannerNode';
    var originalStereoPannerNodeConstructor = StereoPannerNode;
    StereoPannerNode = function() {
      return createAudioNodeUsingConstructor(
          originalStereoPannerNodeConstructor,
          Array.prototype.slice.call(arguments));
    };
    StereoPannerNode['prototype'] =
        originalStereoPannerNodeConstructor.prototype;
    StereoPannerNode['prototype']['constructor'] = StereoPannerNode;
  }

  // Instrument the native AudioContext constructor. Patch the prototype chain.
  AudioContext = function() {
    // We must pass a list (not an Arguments object), so we use the slice method
    // on the Array constructor's prototype to quickly convert to a list.
    return audion.entryPoints.createBaseAudioContextSubclass_(
        nativeAudioContextConstructor,
        Array.prototype.slice.call(arguments), false);
  };
  AudioContext.prototype = nativeAudioContextConstructor.prototype;
  AudioContext.prototype.constructor = AudioContext;

  // Do the same for OfflineAudioContext.
  var nativeOfflineAudioContextConstructor = OfflineAudioContext;
  OfflineAudioContext = function() {
    // We must pass a list (not an Arguments object), so we use the slice method
    // on the Array constructor's prototype to quickly convert to a list.
    return audion.entryPoints.createBaseAudioContextSubclass_(
        nativeOfflineAudioContextConstructor,
        Array.prototype.slice.call(arguments), true);
  };
  OfflineAudioContext.prototype =
      nativeOfflineAudioContextConstructor.prototype;
  OfflineAudioContext.prototype.constructor = OfflineAudioContext;

  // Listen to messages on the window that are related to the extension.
  // Listen to messages from the page. Relay them to the background script.
  window.addEventListener('message', function(event) {
    if (event.source != window) {
      // We are not interested in messages from other windows.
      return;
    }

    var message = /** @type {?AudionTaggedMessage} */ (event.data);
    if (!message ||
         message.tag != audion.entryPoints.ExtensionTag.ToTracing) {
      // This message is not relevant to this extension.
      return;
    }

    switch(message.type) {
      case audion.messaging.MessageType.AUDIO_NODE_HIGHLIGHTED:
        // User is interested in periodic info on properties of an audio node.
        audion.entryPoints.handleAudioNodeHighlighted_(
            /** @type {!AudionNodeHighlightedMessage} */ (message));
        break;
      case audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED:
        // User is no longer interested in inspecting a certain node.
        audion.entryPoints.handleAudioNodeUnhighlighted_(
            /** @type {!AudionNodeUnhighlightedMessage} */ (message));
        break;
      case audion.messaging.MessageType.MISSING_AUDIO_UPDATES:
        // The user will require a refresh from now on to use Web Audio
        // Inspector. Stop tracking web audio calls.
        audion.entryPoints.handleMissingAudioUpdates_();
        break;
    }
  });

  /**
   * A global method for the user (developer) to be able to fetch AudioNodes
   * from the console. The user gleans the ID from the graph visualization.
   * @param {number} audioNodeId The ID of the AudioNode assigned by this tool.
   * @return {?AudioNode} The AudioNode if there is one with the ID.
   */
  window['__node__'] = function(audioNodeId) {
    var resource = audion.entryPoints.idToResource_[audioNodeId];
    if (!resource) {
      // No such node with this ID.
      return null;
    }
    resource = /** @type {!audion.entryPoints.AudioNodeData_} */ (resource);
    if (!(resource.node instanceof AudioNode)) {
      // This is not an AudioNode. It could be an AudioContext. Or a param.
      return null;
    }
    return resource.node;
  };
};


audion.entryPoints.tracing();
