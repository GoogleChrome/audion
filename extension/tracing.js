/**
 * This script instruments (lets us track) web audio calls in a frame. It is
 * run at the beginning of the frame. It runs in the context of the web page; we
 * wrap all logic in a closure to avoid namespace collisions...
 *
 * except of course those stemming from us overriding web audio calls.
 */


(function() {
  /**
   * If we need a new ID for anything, we just increment this value.
   * @type {number}
   */
  var nextAvailableId = 1;


  /**
   * A mapping from AudioContext to its ID (unique within this frame).
   * @type {!WeakMap.<!AudioContext, number>}
   */
  var contextIds = new WeakMap();


  /**
   * A mapping from resource (such as node object) to ID. AudioNodes map to
   * their IDs. AudioParams map to the IDs of their AudioNodes.
   *
   * WeakMap keys are weakly referenced: These keys get GC-ed if the node is
   * GC-ed.
   * @type {!WeakMap.<*, number>}
   */
  var nodeIds = new WeakMap();


  /**
   * A mapping from AudioParam to its type (gain, etc). This string is actually
   * not stored on the AudioParam by default.
   * @type {!WeakMap.<!AudioParam, string>}
   */
  var paramToType = new WeakMap();


  /**
   * Posts a message to the content script. Adds a tag to the message to
   * indicate that the message comes from this extension.
   * @param {!Object} messageToSend
   */
  function postToContentScript(messageToSend) {
    messageToSend['tag'] = 'webAudioExtension';
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
   * @return {function} {function(...*):*} The wrapped / decorated function.
   */
  function wrapNativeFunction(originalNativeFunction, decorator) {
    return function() {
      return decorator.call(this, originalNativeFunction, arguments);
    };
  }


  /**
   * Wraps the web audio connect method.
   * @param {function(...*):*} nativeConnect The native connect method.
   * @param {!Array.<*>} originalArguments The original arguments connect was
   *     called with.
   * @return {*} Whatever the connect method returns.
   */
  function connectDecorator(nativeConnect, originalArguments) {
    var result = nativeConnect.apply(this, originalArguments);

    // TODO: Figure out what happens if we connect with something falsy (or
    // nothing at all). Do we disconnect?
    if (originalArguments.length == 0 || !originalArguments[0]) {
      return result;
    }

    var otherNodeId = nodeIds.get(originalArguments[0]);
    if (otherNodeId) {
      // We connect with either an AudioNode or an AudioParam.
      postToContentScript({
        type: 'add_edge',
        sourceId: nodeIds.get(this),
        destId: otherNodeId,
        // Undefined if we are not connecting with an AudioParam.
        audioParam: paramToType.get(originalArguments[0])
      });
    }
    return result;
  }


  /**
   * Wraps the web audio disconnect method.
   * @param {function(...*):*} nativeDisconnect The native disconnect method.
   * @param {!Array.<*>} originalArguments The original arguments disconnect was
   *     called with.
   * @return {*} Whatever the disconnect method returns.
   */
  function disconnectDecorator(nativeDisconnect, originalArguments) {
    var result = nativeDisconnect.apply(this, originalArguments);

    if (originalArguments.length == 0 || !originalArguments[0]) {
      // Remove all edges emanating from this node.
      postToContentScript({
          type: 'remove_edge',
          sourceId: nodeIds.get(this)
        });
      return result;
    }

    var otherNodeId = nodeIds.get(originalArguments[0]);
    if (otherNodeId) {
      // We disconnect from a specific AudioNode or an AudioParam.
      postToContentScript({
        type: 'remove_edge',
        sourceId: nodeIds.get(this),
        destId: otherNodeId,
        audioParam: paramToType.get(originalArguments[0])
      });
    }
    return result;
  }


  /** @type {RegExp} */
  var anonymousLineRegex = /.+\<anonymous\>:\d+:\d+\)$/;

  /** @type {RegExp} */
  var userLineRegex = /.+\((.+):(\d+):\d+\)$/;


  /**
   * Instruments a newly created node and its AudioParams.
   * @param {!AudioNode} node
   */
  function instrumentNode(node) {
    var nodeId = nextAvailableId++;
    nodeIds.set(node, nodeId);
    for (var prop in node) {
      if (node[prop] instanceof AudioParam) {
        // Store the ID of the node the param belongs to. And the param name.
        nodeIds.set(node[prop], nodeId);
        paramToType.set(node[prop], prop);
      }
    }

    // Get the URL and line number at which this node was created.
    var creationUrl;
    var creationLineNumber;
    var functionsCalled = new Error().stack.split('at');
    for (var i = 0; i < functionsCalled.length; i++) {
      functionsCalled[i] = functionsCalled[i].trim();
      if (functionsCalled[i].match(anonymousLineRegex)) {
        continue
      } else {
        var match = functionsCalled[i].match(userLineRegex);
        if (match && match.length == 3) {
          // We found the URL and line number of creation.
          creationUrl = match[1];
          creationLineNumber = match[2];
          break;
        }
      }
    }

    postToContentScript({
      type: 'add_node',
      nodeId: nodeId,
      nodeType: node.constructor.name,
      creationLineNumber: creationLineNumber,
      creationUrl: creationUrl
    });
  }


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


  var nativeAudioContextConstructor = AudioContext;
  /**
   * Wraps the construction of an AudioContext. We do not use
   * {@code wrapNativeFunction} for this since we cannot use {@code apply} to
   * call a constructor.
   * @param {function(...*):*} nativeConstructor
   * @return {!AudioContext}
   */
  function wrappedAudioContextConstructor() {
    var newContext = new nativeAudioContextConstructor();
    contextIds[newContext] = nextAvailableId++;
    // Note that we have created a new AudioContext.
    postToContentScript({
        type: 'new_context',
        contextId: contextIds[newContext]
      });
    // Instrument the destination node while we're at it.
    instrumentNode(newContext.destination);
    return newContext;
  };


  /** @override */
  AudioNode.prototype.connect = wrapNativeFunction(
      AudioNode.prototype.connect, connectDecorator);


  /** @override */
  AudioNode.prototype.disconnect = wrapNativeFunction(
      AudioNode.prototype.disconnect, disconnectDecorator);


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
  AudioContext = wrappedAudioContextConstructor;
  AudioContext.prototype = nativeAudioContextConstructor.prototype;
  AudioContext.prototype.constructor = AudioContext;
})();
