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
 *   id: audion.entryPoints.Id_
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
 * Enum properties present on all nodes.
 * @private @const {!Array.<string>}
 */
audion.entryPoints.enumAudioNodeProperties_ =
    ['channelCountMode', 'channelInterpretation'];


/**
 * Posts a message to the content script. Adds a tag to the message to
 * indicate that the message comes from this extension.
 * @param {!AudionMessage} messageToSend
 * @private
 */
audion.entryPoints.postToContentScript_ = function(messageToSend) {
  messageToSend.tag = audion.entryPoints.ExtensionTag.FromTracing;
  // Post the message to this window only. The content script will pick it up.
  window.postMessage(messageToSend, window.location.origin || '*');
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

  // Start render cycle to send back data on nodes. Intentionally skip a frame.
  audion.entryPoints.reportDataAnimationFrameId_ =
      goog.global.requestAnimationFrame(function() {
    audion.entryPoints.reportDataAnimationFrameId_ =
      goog.global.requestAnimationFrame(function() {
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
            property: 'context (id)',
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

          // TODO(chizeng): Issue property values specific to the node.

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
    });
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
   * If we need a new ID for anything, we just increment this value. Every
   * AudioContext, AudioNode, and AudioParam gets a unique ID.
   * @type {number}
   */
  var nextAvailableId = 1;


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


  /**
   * Assigns a read-only ID property to an object.
   * @param {!Object} resource
   * @param {audion.entryPoints.Id_} id
   */
  function assignIdProperty(resource, id) {
    Object.defineProperty(resource, audion.entryPoints.resourceIdField_, {
      value: id,
      writable: false
    });
  }


  /**
   * Instruments a newly created node and its AudioParams.
   * @param {!AudioNode} node
   */
  function instrumentNode(node) {
    var nodeId = nextAvailableId++;
    assignIdProperty(node, nodeId);
    audion.entryPoints.idToResource_[nodeId] =
        /** @type {!audion.entryPoints.AudioNodeData_} */ ({
      id: nodeId,
      node: node
    });

    // Instrument AudioParams.
    for (var prop in node) {
      var audioParam = node[prop];
      if (audioParam instanceof AudioParam) {
        // Store the ID of the node the param belongs to. And the param name.
        var audioParamId = nextAvailableId++;
        assignIdProperty(audioParam, audioParamId);
        audion.entryPoints.idToResource_[audioParamId] =
            /** @type {!audion.entryPoints.AudioParamData_} */ ({
              id: audioParamId,
              audioNodeId: nodeId,
              propertyName: prop
            });
      }
    }

    // Notify extension about the addition of a new node.
    audion.entryPoints.postToContentScript_(
        /** @type {!AudionNodeCreatedMessage} */ ({
      type: audion.messaging.MessageType.NODE_CREATED,
      nodeId: nodeId,
      nodeType: node.constructor.name
      // TODO(chizeng): Include a stack trace for the creation of the node.
    }));
  }

  // Keep a reference to the native AudioContext constructor. We later override
  //
  var nativeAudioContextConstructor = AudioContext;

  // We now trace connect and disconnects.

  /**
   * Wraps the web audio connect method.
   * @param {function(...*):*} nativeConnect The native connect method.
   * @param {!Array.<*>} originalArguments The original arguments connect was
   *     called with.
   * @return {*} Whatever the connect method returns.
   * @this {!AudioNode}
   */
  function connectDecorator(nativeConnect, originalArguments) {
    var result = nativeConnect.apply(this, originalArguments);

    // TODO: Figure out what happens if we connect with something falsy (or
    // nothing at all). Do we disconnect?
    if (originalArguments.length == 0 || !originalArguments[0]) {
      return result;
    }

    var otherThing = originalArguments[0];
    var otherThingId = otherThing[audion.entryPoints.resourceIdField_];
    if (otherThingId) {
      // Notify the extension of a connection with either an AudioNode or an
      // AudioParam.
      if (otherThing instanceof AudioNode) {
        audion.entryPoints.postToContentScript_(
            /** type {!AudionNodeToNodeConnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_TO_NODE_CONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              destinationNodeId: otherThingId
            }));
      } else if (otherThing instanceof AudioParam) {
        var audioParamData =
            /** @type {!audion.entryPoints.AudioParamData_} */ (
                audion.entryPoints.idToResource_[otherThingId]);
        audion.entryPoints.postToContentScript_(
            /** type {!AudionNodeToParamConnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              destinationNodeId: audioParamData.audioNodeId,
              destinationParamName: audioParamData.propertyName
            }));
      }
    }
    return result;
  }
  /** @override */
  AudioNode.prototype.connect = wrapNativeFunction(
      AudioNode.prototype.connect, connectDecorator);


  /**
   * Wraps the web audio disconnect method.
   * @param {function(...*):*} nativeDisconnect The native disconnect method.
   * @param {!Array.<*>} originalArguments The original arguments disconnect was
   *     called with.
   * @return {*} Whatever the disconnect method returns.
   * @this {!AudioNode}
   */
  function disconnectDecorator(nativeDisconnect, originalArguments) {
    var result = nativeDisconnect.apply(this, originalArguments);

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
    var otherThingId = otherThing[audion.entryPoints.resourceIdField_];
    if (otherThingId) {
      // We disconnect from a specific AudioNode or an AudioParam.
      if (otherThing instanceof AudioNode) {
        audion.entryPoints.postToContentScript_(
            /** @type {!AudionNodeFromNodeDisconnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              disconnectedFromNodeId: otherThingId
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
              audioParamName: audioParamData.propertyName
            }));
      }
    }
    return result;
  }
  /** @override */
  AudioNode.prototype.disconnect = wrapNativeFunction(
      AudioNode.prototype.disconnect, disconnectDecorator);


  // We now trace when nodes are created.

  /**
   * Wraps the creation of new AudioNodes.
   * @param {function(...*):*} nativeMethod
   * @param {!Array.<*>} originalArguments
   * @return {!AudioNode}
   * @this {!AudioNode}
   */
  function newNodeDecorator(nativeMethod, originalArguments) {
    var result = nativeMethod.apply(this, originalArguments);
    instrumentNode(result);
    return result;
  };


  /** @override */
  AudioContext.prototype.createAnalyser = wrapNativeFunction(
      AudioContext.prototype.createAnalyser, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createBiquadFilter = wrapNativeFunction(
      AudioContext.prototype.createBiquadFilter, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createBufferSource = wrapNativeFunction(
      AudioContext.prototype.createBufferSource, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createChannelMerger = wrapNativeFunction(
      AudioContext.prototype.createChannelMerger, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createChannelSplitter = wrapNativeFunction(
      AudioContext.prototype.createChannelSplitter, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createConvolver = wrapNativeFunction(
      AudioContext.prototype.createConvolver, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createDelay = wrapNativeFunction(
      AudioContext.prototype.createDelay, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createDynamicsCompressor = wrapNativeFunction(
      AudioContext.prototype.createDynamicsCompressor, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createGain = wrapNativeFunction(
      AudioContext.prototype.createGain, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createIIRFilter = wrapNativeFunction(
      AudioContext.prototype.createIIRFilter, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaElementSource = wrapNativeFunction(
      AudioContext.prototype.createMediaElementSource, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaStreamDestination = wrapNativeFunction(
      AudioContext.prototype.createMediaStreamDestination, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createMediaStreamSource = wrapNativeFunction(
      AudioContext.prototype.createMediaStreamSource, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createOscillator = wrapNativeFunction(
      AudioContext.prototype.createOscillator, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createPanner = wrapNativeFunction(
      AudioContext.prototype.createPanner, newNodeDecorator);


  /** @override */
  AudioContext.prototype.createStereoPanner = wrapNativeFunction(
      AudioContext.prototype.createStereoPanner, newNodeDecorator);

  // Instrument the native AudioContext constructor. Patch the prototype chain.
  AudioContext = function() {
    var newContext = new nativeAudioContextConstructor();
    var audioContextId = nextAvailableId++;
    assignIdProperty(newContext, audioContextId);
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
    instrumentNode(newContext.destination);
    return newContext;
  };
  AudioContext.prototype = nativeAudioContextConstructor.prototype;
  AudioContext.prototype.constructor = AudioContext;

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
    }
  });
};


audion.entryPoints.tracing();
