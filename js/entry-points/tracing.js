goog.provide('audion.entryPoints.tracing');

goog.require('audion.entryPoints.ExtensionTag');
goog.require('audion.messaging.MessageType');


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
 * Stores data on an AudioNode ... as well as the AudioNode.
 * @typedef{{
 *   id: audion.entryPoints.Id_,
 *   node: !AudioNode
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
 * Handles what happens when an audio node is highlighted (inspected by the
 * user).
 * @param {!AudionNodeHighlightedMessage} message
 * @private 
 */
audion.entryPoints.handleAudioNodeHighlighted_ = function(message) {
  audion.entryPoints.highlightedAudioNodeIds_['' + message.audioNodeId] = 1;

  // TODO(chizeng): Start render cycle to send back data on nodes.
};


/**
 * Handles what happens when an audio node is no longer highlighted (no longer
 * inspected by the user).
 * @param {!AudionNodeUnhighlightedMessage} message
 * @private 
 */
audion.entryPoints.handleAudioNodeHighlighted_ = function(message) {
  // Remove this node from the list of nodes that we periodically send back data
  // on.
  delete audion.entryPoints.highlightedAudioNodeIds_['' + message.audioNodeId];

  var highlightedNodesCount = 0;
  for (var nodeId in audion.entryPoints.highlightedAudioNodeIds_) {
    highlightedNodesCount++;
  }
  if (highlightedNodesCount == 0) {
    // TODO(chizeng): Stop the render cycle of issuing data on this node.
  }
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
   * Maps IDs to data objects (see type defs above). Each resource (
   * AudioContext, AudioNode, and AudioParam) has its own ID.
   * @private {!Object.<audion.entryPoints.Id_, !Object>}
   */
  var idToResource = {};


  /**
   * Logs a message to the console for debugging.
   * @param {string} message
   */
  function logMessage(message) {
    window.console.log(message);
  }


  /**
   * Posts a message to the content script. Adds a tag to the message to
   * indicate that the message comes from this extension.
   * @param {!AudionTaggedMessage} messageToSend
   */
  function postToContentScript(messageToSend) {
    messageToSend.tag = audion.entryPoints.ExtensionTag;
    // Post the message to this window only. The content script will pick it up.
    window.postMessage(messageToSend, window.location.origin || '*');
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
    idToResource[nodeId] = /** @type {!audion.entryPoints.AudioNodeData_} */ ({
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
        idToResource[audioParamId] =
            /** @type {!audion.entryPoints.AudioParamData_} */ ({
              id: audioParamId,
              audioNodeId: nodeId,
              propertyName: prop
            });
      }
    }

    // Notify extension about the addition of a new node.
    postToContentScript(/** @type {!AudionNodeCreatedMessage} */ ({
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
      // postToContentScript({
      //   type: 'add_edge',
      //   sourceId: nodeIds.get(this),
      //   destId: otherNodeId,
      //   // Undefined if we are not connecting with an AudioParam.
      //   audioParam: paramToType.get(originalArguments[0])
      // });
      if (otherThing instanceof AudioNode) {
        postToContentScript(/** type {!AudionNodeToNodeConnectedMessage} */ ({
          type: audion.messaging.MessageType.NODE_TO_NODE_CONNECTED,
          sourceNodeId: this[audion.entryPoints.resourceIdField_],
          destinationNodeId: otherThingId
        }));
      } else if (otherThing instanceof AudioParam) {
        var audioParamData =
            /** @type {!audion.entryPoints.AudioParamData_} */ (
                idToResource[otherThingId]);
        postToContentScript(/** type {!AudionNodeToParamConnectedMessage} */ ({
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
      postToContentScript(/** @type {!AudionAllDisconnectedMessage} */ ({
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
        postToContentScript(
            /** @type {!AudionNodeFromNodeDisconnectedMessage} */ ({
              type: audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED,
              sourceNodeId: this[audion.entryPoints.resourceIdField_],
              disconnectedFromNodeId: otherThingId
            }));
      } else if (otherThing instanceof AudioParam) {
        var audioParamData =
            /** @type {!audion.entryPoints.AudioParamData_} */ (
                idToResource[otherThingId]);
        postToContentScript(
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
    idToResource[audioContextId] =
        /** @type {!audion.entryPoints.AudioContextData_} */ ({
          id: audioContextId
        });

    // Tell the extension that we have created a new AudioContext.
    postToContentScript(/** @type {!AudionContextCreatedMessage} */ ({
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
    if (!message || message.tag != audion.entryPoints.ExtensionTag) {
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
        audion.entryPoints.handleAudioNodeUnHighlighted_(
            /** @type {!AudionNodeUnhighlightedMessage} */ (message));
        break;
    }
  });
};


audion.entryPoints.tracing();
