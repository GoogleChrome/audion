goog.provide('audion.entryPoints.devTools');

goog.require('audion.messaging.ConnectionType');
goog.require('audion.messaging.MessageType');
goog.require('audion.render.VisualGraphType');


/**
 * The window of the panel page. Initialized when the panel appears.
 * @private {?AudionPanelWindow}
 */
audion.entryPoints.panelWindow_ = null;


/**
 * Whether the panel is currently shown.
 * @private {boolean}
 */
audion.entryPoints.panelShown_ = false;


/**
 * Whether the extension is missing audio updates that occurred before dev tools
 * opened.
 * @private {boolean}
 */
audion.entryPoints.audioUpdatesMissing_ = false;


/**
 * A mapping from AudioNode type to the color that we should use to visualize
 * it.
 * @private @const {!Object.<string, string>}
 */
audion.entryPoints.nodeTypeToColorMapping_ = {
  'Analyser': '#607D88',
  'AudioBufferSource': '#4CAF50',
  'AudioDestination': '#37474F',
  'BiquadFilter': '#8BC34A',
  'ChannelMerger': '#607D8B',
  'ChannelSplitter': '#607D8B',
  'Convolver': '#8BC34A',
  'Delay': '#8BC34A',
  'DynamicsCompressor': '#8BC34A',
  'Gain': '#607D8B',
  'IIRFilter': '#8BC34A',
  'MediaElementAudioSource': '#4CAF50',
  'MediaStreamAudioDestination': '#37474F',
  'MediaStreamAudioSource': '#4CAF50',
  'Oscillator': '#4CAF50',
  'Panner': '#8BC34A',
  'ScriptProcessor': '#607D88',
  'SpatialPanner': '#8BC34A',
  'StereoPanner': '#8BC34A',
  'WaveShaper': '#8BC34A',

  // TODO(chizeng): Remove.
  'AudioParam': '#B0BEC5'
};


/**
 * Connects with the background page so that it can relay web audio updates to
 * this panel. Make sure to keep the keys strings to prevent obfuscation.
 * @private {!Port}
 */
audion.entryPoints.backgroundPageConnection_ = chrome.runtime.connect({
  'name': audion.messaging.ConnectionType.INIT_DEV_PANEL
});


/**
 * Creates an empty audio graph.
 * @return {!dagreD3.graphlib.Graph}
 * @private
 */
audion.entryPoints.createEmptyAudioGraph_ = function() {
  // Make sure to use quoted strings (string literals) for the object keys below
  // to prevent obfuscation.
  return new dagreD3.graphlib.Graph({
        'compound': true,
        'multigraph': true
      })
      .setGraph({
        'nodesep': 28,
        'rankdir': 'LR',
        'ranksep': 28,
        'marginx': 14,
        'marginy': 14
      })
      .setDefaultEdgeLabel(function () { return {}; });
};


/**
 * The visual graph. This may contain more nodes than the audio graph because
 * each channel and audio param might have its own visualized node. Each audio
 * node does correspond to a single node in the visual graph, however.
 * @private {!dagreD3.graphlib.Graph}
 */
audion.entryPoints.visualGraph_ = audion.entryPoints.createEmptyAudioGraph_();


/**
 * Handles what happens whenever the panel is shown (user tabs into it).
 * @param {!AudionPanelWindow} localPanelWindow The window of the panel page
 *     embedded in dev tools.
 * @private
 */
audion.entryPoints.handlePanelShown_ = function(localPanelWindow) {
  // Store a reference to the panel window every time it opens.
  audion.entryPoints.panelWindow_ = localPanelWindow;
  audion.entryPoints.panelShown_ = true;

  // TODO(chizeng): Request a redraw.
};


/**
 * Handles what happens whenever the panel is hidden.
 */
audion.entryPoints.handlePanelHidden_ = function() {
  audion.entryPoints.panelShown_ = false;
};


/**
 * Handles what happens when the 'Web Audio' panel opens for the first time
 * after the user opens Chrome dev tools.
 * @param {!AudionPanelWindow} panelWindow The window object of the panel.
 * @private
 */
audion.entryPoints.handlePanelOpenForFirstTime_ = function(panelWindow) {
  // TODO(chizeng): Listen for messages from the panel. For instance, we may at
  // some point want to update the active node.

  // TODO(chizeng): Tell the panel to warn the user about missing audio updates.
  if (audion.entryPoints.audioUpdatesMissing_) {
    panelWindow.audionMissingAudioUpdates();
  }
};


/**
 * Handles what happens when the Web Audio panel is created.
 * @param {!ExtensionPanel} extensionPanel The created panel.
 * @private
 */
audion.entryPoints.handlePanelCreated_ = function(extensionPanel) {
  extensionPanel.onShown.addListener(audion.entryPoints.handlePanelShown_);
  extensionPanel.onHidden.addListener(audion.entryPoints.handlePanelHidden_);

  var callback = function(localPanelWindow) {
    // Run a callback on the first time that the panel is shown. And then remove
    // the listener (It is only to be run once.).
    audion.entryPoints.handlePanelOpenForFirstTime_(localPanelWindow);
    extensionPanel.onShown.removeListener(callback);
  };
  extensionPanel.onShown.addListener(callback);
};


/**
 * Requests the panel to redraw the UI (after say a web audio update) only if
 * the panel is shown.
 * @private
 */
audion.entryPoints.requestPanelRedraw_ = function() {
  if (audion.entryPoints.panelShown_) {
    audion.entryPoints.panelWindow_.requestRedraw(
        audion.entryPoints.visualGraph_);
  }
};


/**
 * Computes an ID (unique across all the frames of the inspected tab) that can
 * be used to uniquely obtain the node representing an AudioNode from the visual
 * graph (which differs from the web audio graph).
 * @param {number} frameId
 * @param {number} nodeId
 * @return {string}
 * @private
 */
audion.entryPoints.computeVisualGraphNodeIdForAudioNode_ = function(
    frameId, nodeId) {
  // The frame ID and AudioNode ID uniquely identifies an AudioNode in the tab.
  return 'node$' + frameId + '$' + nodeId;
};


/**
 * Computes an ID (unique across all the frames of the inspected tab) that can
 * be used to uniquely obtain the node representing an AudioNode from the visual
 * graph (which differs from the web audio graph.
 * @param {number} frameId
 * @param {number} sourceAudioNodeId The AudioNode ID (not visual graph ID).
 * @param {number} destinationAudioNodeId
 * @return {string}
 * @private
 */
audion.entryPoints.computeVisualGraphIdForNodeToNodeEdge_ = function(
    frameId, sourceAudioNodeId, destinationAudioNodeId) {
  return 'edge|' + frameId + '|' + sourceAudioNodeId + '|' +
      destinationAudioNodeId;
};


/**
 * Handles the creation of an AudioNode (that might not be part of a graph yet).
 * @param {!AudionNodeCreatedMessage} message
 * @private
 */
audion.entryPoints.handleNodeCreated_ = function(message) {
  // Create an object that encapuslates information for the node.
  // TODO(chizeng): See if you can use linked CSS for styling instead.
  var nodeType = message.nodeType;
  var suffix = 'Node';
  if (nodeType.slice(-4) == suffix) {
    // Remove "Node" from the type of the node.
    nodeType = nodeType.substr(0, nodeType.length - suffix.length);
  }
  var nodeColor =
      audion.entryPoints.nodeTypeToColorMapping_[message.nodeType] || '#000';
  var nodeData = /** @type {!AudionVisualGraphData} */ ({
    underlyingType: audion.render.VisualGraphType.AUDIO_NODE,
    frameId: message.frameId,
    labelType: 'html',
    label: message.nodeType + ' ' + message.nodeId,
    style: 'stroke: none; fill: ' + nodeColor + ';',
    labelStyle: 'color: #fff; font-family: arial;',
    rx: 2,
    ry: 2,
    audioNodeGraphId: message.nodeId
  });

  // Obtain an ID for the visual node.
  var visualGraphNodeId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.nodeId);

  // Add the node to the visual graph.
  audion.entryPoints.visualGraph_.setNode(visualGraphNodeId, nodeData);
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode connects with another AudioNode.
 * @param {!AudionNodeToNodeConnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeToNodeConnected_ = function(message) {
  var edgeData = {
    underlyingType: audion.render.VisualGraphType.NODE_TO_NODE_EDGE,
    lineInterpolate: 'basis',
    style: 'stroke-width: 2.5px; stroke: #90A4AE; fill: none;',
    arrowheadStyle: 'fill: #90A4AE; stroke: none;',
    width: 35,
    frameId: message.frameId,
    sourceAudioNodeId: message.sourceNodeId,
    destinationAudioNodeId: message.destinationNodeId
  };

  // Compute the visual graph IDs of the nodes.
  var sourceNodeVisualGraphId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.sourceNodeId);
  var destinationNodeVisualGraphId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.destinationNodeId);

  // Update the graph with the new edge. Request a redraw.
  audion.entryPoints.visualGraph_.setEdge(
          sourceNodeVisualGraphId,
          destinationNodeVisualGraphId,
          edgeData,
          // Compute a visual graph ID unique to the edge.
          audion.entryPoints.computeVisualGraphIdForNodeToNodeEdge_(
              /** @type {number} */ (message.frameId),
              message.sourceNodeId,
              message.destinationNodeId)
        );
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles the case in which we discover that we are missing audio updates that
 * occurred before dev tools opened.
 * @private
 */
audion.entryPoints.handleMissingAudioUpdates_ = function() {
  audion.entryPoints.audioUpdatesMissing_ = true;
};


/**
 * Handles the case in which the tab URL changes. We have to reset.
 * @private
 */
audion.entryPoints.handelPageOfTabChanged_ = function() {
  // Reset the graph.
  audion.entryPoints.visualGraph_ = audion.entryPoints.createEmptyAudioGraph_();

  // Well, the tab just changed, so we can't be missing audio updates.
  audion.entryPoints.audioUpdatesMissing_ = false;

  // TODO(chizeng): Tell the panel to reset to this empty graph.
};


/**
 * Handles a message from the background script.
 * @param {!AudionMessageFromFrame} message
 * @private
 */
audion.entryPoints.handleMessageFromBackground_ = function(message) {
  switch(message.type) {
    case audion.messaging.MessageType.NODE_CREATED:
      audion.entryPoints.handleNodeCreated_(
          /** @type {!AudionNodeCreatedMessage} */ (message));
      break;
    case audion.messaging.MessageType.NODE_TO_NODE_CONNECTED:
      audion.entryPoints.handleNodeToNodeConnected_(
          /** @type {!AudionNodeToNodeConnectedMessage} */ (message));
      break;
    case audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED:
      // TODO
      break;
    case audion.messaging.MessageType.ALL_DISCONNECTED:
      // TODO
      break;
    case audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED:
      // TODO
      break;
    case audion.messaging.MessageType.NODE_FROM_PARAM_DISCONNECTED:
      // TODO
      break;
    case audion.messaging.MessageType.MISSING_AUDIO_UPDATES:
      audion.entryPoints.handleMissingAudioUpdates_();
      break;
    case audion.messaging.MessageType.PAGE_OF_TAB_CHANGED:
      audion.entryPoints.handelPageOfTabChanged_();
      break;
  }
};


/**
 * Listen for messages from the background script. This includes audio updates.
 * @private
 */
audion.entryPoints.listenToMessagesFromBackground_ = function() {
  audion.entryPoints.backgroundPageConnection_.onMessage.addListener(
      audion.entryPoints.handleMessageFromBackground_);
};


/**
 * Notifies the background script that the dev tools script is ready to receive
 * messages.
 * @private
 */
audion.entryPoints.noteListenersReady_ = function() {
  // We have to explicitly include the tab ID because the port in the background
  // script that connects to dev tools actually lacks a tab ID.
  audion.entryPoints.backgroundPageConnection_.postMessage(
      /** @type {!AudionListenersReadyFromDevToolsScriptMessage} */ ({
        type: audion.messaging.MessageType.LISTENERS_READY,
        inspectedTabId: chrome.devtools.inspectedWindow.tabId
      }));
};


/**
 * The entry point for the dev tools script.
 */
audion.entryPoints.devTools = function() {
  chrome.devtools.panels.create(
      'Web Audio',
      'images/devToolsIcon.png',
      'panel.html',
      audion.entryPoints.handlePanelCreated_);

  audion.entryPoints.listenToMessagesFromBackground_();
  audion.entryPoints.noteListenersReady_();
};


audion.entryPoints.devTools();
