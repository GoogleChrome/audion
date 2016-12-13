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
 * @typedef {{
 *   frameId: number,
 *   audioNodeId: number
 * }}
 */
audion.entryPoints.AudioNodeEntry_;


/**
 * The currently highlighted audio node if any.
 * @private {?audion.entryPoints.AudioNodeEntry_}
 */
audion.entryPoints.highlightedAudioNode_ = null;


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
  'WaveShaper': '#8BC34A'
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

  // Request a redraw.
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles what happens whenever the panel is hidden.
 * @private
 */
audion.entryPoints.handlePanelHidden_ = function() {
  audion.entryPoints.panelShown_ = false;
};


/**
 * Posts a message to the background script.
 * @param {!AudionMessage} message
 * @private
 */
audion.entryPoints.postToBackgroundScript_ = function(message) {
  audion.entryPoints.backgroundPageConnection_.postMessage(message);
};


/**
 * Handles a request by the user to inspect a node.
 * @param {!AudionNodeHighlightedMessage} message
 * @private
 */
audion.entryPoints.handleNewAudioNodeHighlightedRequest_ = function(message) {
  var previousHighlightedNode = audion.entryPoints.highlightedAudioNode_;
  if (previousHighlightedNode) {
    // A node is currently highlighted.
    if (previousHighlightedNode.frameId == message.frameId &&
        previousHighlightedNode.audioNodeId == message.audioNodeId) {
      // This audio node is already highlighted.
      return;
    }

    // Un-highlight the previous node.
    audion.entryPoints.postToBackgroundScript_(
        /** @type {!AudionNodeUnhighlightedMessage} */ ({
      type: audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED,
      frameId: previousHighlightedNode.frameId,
      audioNodeId: previousHighlightedNode.audioNodeId,
      inspectedTabId: chrome.devtools.inspectedWindow.tabId
    }));
  }

  // Update the highlighted AudioNode to be the new one.
  audion.entryPoints.highlightedAudioNode_ =
      /** @type {?audion.entryPoints.AudioNodeEntry_} */ ({
    frameId: message.frameId,
    audioNodeId: message.audioNodeId
  });

  // Tell the content script to issue data on the new node.
  audion.entryPoints.postToBackgroundScript_(
      /** @type {!AudionNodeHighlightedMessage} */ ({
    type: audion.messaging.MessageType.AUDIO_NODE_HIGHLIGHTED,
    frameId: audion.entryPoints.highlightedAudioNode_.frameId,
    audioNodeId: audion.entryPoints.highlightedAudioNode_.audioNodeId,
    inspectedTabId: chrome.devtools.inspectedWindow.tabId
  }));
};


/**
 * Handles a request by the user to stop inspecting a node.
 * @param {!AudionNodeUnhighlightedMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodeUnhighlightedRequest_ = function(message) {
  var previousNodeEntry = audion.entryPoints.highlightedAudioNode_;
  if (!previousNodeEntry) {
    // No audio node highlighted anyway.
    return;
  }

  if (previousNodeEntry.frameId != message.frameId ||
      previousNodeEntry.audioNodeId != message.audioNodeId) {
    // This request to stop highlighting is no longer relevant.
    return;
  }

  // Un-highlight the node.
  audion.entryPoints.highlightedAudioNode_ = null;

  // Notify the content script so that it stops sending info on the node.
  audion.entryPoints.postToBackgroundScript_(
      /** @type {!AudionNodeUnhighlightedMessage} */ ({
    type: audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED,
    frameId: previousNodeEntry.frameId,
    audioNodeId: previousNodeEntry.audioNodeId
  }));
};


/**
 * Handles what happens when the 'Web Audio' panel opens for the first time
 * after the user opens Chrome dev tools.
 * @param {!AudionPanelWindow} panelWindow The window object of the panel.
 * @private
 */
audion.entryPoints.listenToMessagesFromPanel_ = function(panelWindow) {
  // Listen to messages from the page. Relay them to the background script.
  panelWindow.addEventListener('message', function(event) {
    if (event.source != panelWindow) {
      // We are not interested in messages from non-panel windows.
      return;
    }

    var message = /** @type {?AudionMessage} */ (event.data);
    switch(message.type) {
      case audion.messaging.MessageType.AUDIO_NODE_HIGHLIGHTED:
        audion.entryPoints.handleNewAudioNodeHighlightedRequest_(
            /** @type {!AudionNodeHighlightedMessage} */ (message));
        break;
      case audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED:
        audion.entryPoints.handleAudioNodeUnhighlightedRequest_(
            /** @type {!AudionNodeUnhighlightedMessage} */ (message));
        break;
    }
  });
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

  // Tell the panel to warn the user about missing audio updates.
  if (audion.entryPoints.audioUpdatesMissing_) {
    panelWindow.audionMissingAudioUpdates();
  }

  // Listen for messages from the panel window. These could reflect requests by
  // the user.
  audion.entryPoints.listenToMessagesFromPanel_(panelWindow);
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
 * be used to uniquely obtain the node representing an AudioParam.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {string} audioParamName
 * @return {string}
 * @private
 */
audion.entryPoints.computeVisualGraphNodeIdForAudioParam_ = function(
    frameId, nodeId, audioParamName) {
  // The frame ID and AudioNode ID uniquely identifies an AudioNode in the tab.
  // TODO(chizeng): Update this arg once we support multiple channels.
  return audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
      frameId, nodeId) + 'p$' + audioParamName;
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
 * Computes an ID (unique across all the frames of the inspected tab) that can
 * be used to uniquely obtain the dotted edge from an AudioParam to its
 * associated node. 
 * @param {number} frameId
 * @param {number} sourceAudioNodeId The AudioNode ID (not visual graph ID).
 * @param {number} destinationAudioNodeId
 * @param {string} audioParamName
 * @return {string}
 * @private
 */
audion.entryPoints.computeVisualGraphIdForAudioParamToNodeEdge_ = function(
    frameId, sourceAudioNodeId, destinationAudioNodeId, audioParamName) {
  return audion.entryPoints.computeVisualGraphIdForNodeToNodeEdge_(
      frameId, sourceAudioNodeId, destinationAudioNodeId) + '|fromParam$' +
          audioParamName;
};


/**
 * Computes an ID (unique across all the frames of the inspected tab) that can
 * be used to uniquely obtain the edge from an Audio Node to an AudioParam.
 * @param {number} frameId
 * @param {number} sourceAudioNodeId The AudioNode ID (not visual graph ID).
 * @param {number} destinationAudioNodeId
 * @param {string} audioParamName
 * @return {string}
 * @private
 */
audion.entryPoints.computeVisualGraphIdForNodeToAudioParamEdge_ = function(
    frameId, sourceAudioNodeId, destinationAudioNodeId, audioParamName) {
  return audion.entryPoints.computeVisualGraphIdForNodeToNodeEdge_(
      frameId, sourceAudioNodeId, destinationAudioNodeId) + '|toParam$' +
          audioParamName;
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
      audion.entryPoints.nodeTypeToColorMapping_[nodeType] || '#000';
  var nodeData = /** @type {!AudionVisualGraphData} */ ({
    underlyingType: audion.render.VisualGraphType.AUDIO_NODE,
    frameId: message.frameId,
    audioNodeId: message.nodeId,
    labelType: 'html',
    label: nodeType + ' ' + message.nodeId,
    style: 'cursor: pointer; stroke: none; fill: ' + nodeColor + ';',
    labelStyle: 'cursor: pointer; color: #fff; font-family: arial;',
    rx: 2,
    ry: 2
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
  var edgeData = /** @type {!AudionVisualGraphData} */ ({
    underlyingType: audion.render.VisualGraphType.NODE_TO_NODE_EDGE,
    lineInterpolate: 'basis',
    style: 'stroke-width: 2.5px; stroke: #90A4AE; fill: none;',
    arrowheadStyle: 'fill: #90A4AE; stroke: none;',
    width: 35,
    frameId: message.frameId,
    sourceAudioNodeId: message.sourceNodeId,
    destinationAudioNodeId: message.destinationNodeId
  });

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
audion.entryPoints.handlePageOfTabChanged_ = function() {
  // Reset the graph.
  audion.entryPoints.visualGraph_ = audion.entryPoints.createEmptyAudioGraph_();

  // Well, the tab just changed, so we can't be missing audio updates.
  audion.entryPoints.audioUpdatesMissing_ = false;

  // Tell the panel to reset to this empty graph.
  if (audion.entryPoints.panelWindow_) {
    audion.entryPoints.panelWindow_.resetUi(audion.entryPoints.visualGraph_);
  }
};


/**
 * Handles when a node connects to an AudioParam.
 * @param {!AudionNodeToParamConnectedMessage} message
 */
audion.entryPoints.handleNodeToParamConnected_ = function(message) {
  var sourceVisualNodeId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.sourceNodeId);

  // This is the visual node ID of the 
  var destinationAudioNodeVisualGraphId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.destinationNodeId);

  // If the visual node for the AudioParam exists, connect directly to it.
  var audioParamVisualNodeId =
      audion.entryPoints.computeVisualGraphNodeIdForAudioParam_(
          /** @type {number} */ (message.frameId),
          message.destinationNodeId,
          message.destinationParamName);
  if (!audion.entryPoints.visualGraph_.node(audioParamVisualNodeId)) {
    // If that visual node does not exist, create it.
    var nodeData = /** @type {!AudionVisualGraphData} */ ({
      underlyingType: audion.render.VisualGraphType.AUDIO_PARAM_NODE,
      frameId: message.frameId,
      labelType: 'html',
      label: message.destinationParamName,
      audioNodeGraphId: message.destinationNodeId,
      style: 'stroke: none; fill: #B0BEC5;',
      labelStyle: 'color: black; font-family: Arial; text-transform: uppercase;',
      rx: 20,
      ry: 20
    });
    // Add the node to the visual graph.
    audion.entryPoints.visualGraph_.setNode(audioParamVisualNodeId, nodeData);

    // Connect this AudioParam visual node with its associated AudioNode with
    // a dotted edge.
    // Update the graph with the new edge. Request a redraw.
    var dottedEdgeData = /** @type {!AudionVisualGraphData} */ ({
      underlyingType: audion.render.VisualGraphType.AUDIO_PARAM_TO_NODE_EDGE,
      lineInterpolate: 'linear',
      style: 'stroke-width: 2.5px; stroke-dasharray: 2.5, 2.5;' +
          'stroke: #B0BEC5; fill: none;',
      arrowheadStyle: 'fill: none; stroke: none;',
      width: 1,
      frameId: /** @type {number} */ (message.frameId),
      destinationAudioNodeId: message.destinationNodeId,
      audioParamName: message.destinationParamName
    });
    audion.entryPoints.visualGraph_.setEdge(
        audioParamVisualNodeId,
        destinationAudioNodeVisualGraphId,
        dottedEdgeData,
        // todo
        audion.entryPoints.computeVisualGraphIdForAudioParamToNodeEdge_(
            /** @type {number} */ (message.frameId),
            message.sourceNodeId,
            message.destinationNodeId,
            message.destinationParamName)
      );
  }

  // Make an edge between the source audio node and the audio param.
  var edgeData = /** @type {!AudionVisualGraphData} */ ({
    underlyingType: audion.render.VisualGraphType.NODE_TO_AUDIO_PARAM_EDGE,
    lineInterpolate: 'basis',
    style: 'stroke-width: 2.5px; stroke: #90A4AE; fill: none;',
    arrowheadStyle: 'fill: #90A4AE; stroke: none;',
    width: 35,
    frameId: message.frameId,
    sourceAudioNodeId: message.sourceNodeId,
    destinationAudioNodeId: message.destinationNodeId,
    audioParamName: message.destinationParamName
  });
  audion.entryPoints.visualGraph_.setEdge(
      sourceVisualNodeId,
      audioParamVisualNodeId,
      edgeData,
      // Compute a visual graph ID unique to the edge.
      // todo
      audion.entryPoints.computeVisualGraphIdForNodeToAudioParamEdge_(
          /** @type {number} */ (message.frameId),
          message.sourceNodeId,
          message.destinationNodeId,
          message.destinationParamName)
    );

  // Request a redraw due to a graph update.
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioNode.
 * @param {!AudionNodeFromNodeDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromNodeDisconnected_ = function(message) {
  audion.entryPoints.visualGraph_.removeEdge(
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.sourceNodeId),
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId),
          message.disconnectedFromNodeId),
      audion.entryPoints.computeVisualGraphIdForNodeToNodeEdge_(
          /** @type {number} */ (message.frameId),
          message.sourceNodeId,
          message.disconnectedFromNodeId)
  );
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from everything.
 * @param {!AudionAllDisconnectedMessage} message
 */
audion.entryPoints.handleAllDisconnected_ = function(message) {
  // Remove all edges emanating out of the source node.
  var edges = audion.entryPoints.visualGraph_.outEdges(
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.nodeId));
  for (var i = 0; i < edges.length; i++) {
    audion.entryPoints.visualGraph_.removeEdge(edges[i]);
  }
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioParam.
 * @param {!AudionNodeFromParamDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromParamDisconnected_ = function(message) {
  var visualIdOfAudioParamAudioNode =
      audion.entryPoints.computeVisualGraphNodeIdForAudioParam_(
          /** @type {number} */ (message.frameId),
          message.disconnectedFromNodeId, message.audioParamName);
  audion.entryPoints.visualGraph_.removeEdge(
      audion.entryPoints.computeVisualGraphNodeIdForAudioNode_(
          /** @type {number} */ (message.frameId), message.sourceNodeId),
      visualIdOfAudioParamAudioNode,
      audion.entryPoints.computeVisualGraphIdForAudioParamToNodeEdge_(
          /** @type {number} */ (message.frameId),
          message.sourceNodeId,
          message.disconnectedFromNodeId,
          message.audioParamName)
  );
  // If no AudioNodes connect to the AudioParam, just remove the visual node
  // that represents the AudioParam.
  var edges = audion.entryPoints.visualGraph_.inEdges(
      visualIdOfAudioParamAudioNode);
  if (edges && edges.length == 0) {
    // Indeed, remove the node.
    audion.entryPoints.visualGraph_.removeNode(visualIdOfAudioParamAudioNode);
  }
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles a message from the background script that contains information on a
 * node being inspected.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodePropertiesUpdate_ = function(message) {
  // Call the panel window method to take this update into account.
  if (!audion.entryPoints.panelWindow_) {
    // No panel window has ever opened yet. Since the user must have requested
    // that a certain node is highlighted, we really should never enter here ...
    return;
  }

  audion.entryPoints.panelWindow_.noteAudioNodePropertyUpdate(message);
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
      audion.entryPoints.handleNodeToParamConnected_(
          /** @type {!AudionNodeToParamConnectedMessage} */ (message));
      break;
    case audion.messaging.MessageType.ALL_DISCONNECTED:
      audion.entryPoints.handleAllDisconnected_(
          /** @type {!AudionAllDisconnectedMessage} */ (message));
      break;
    case audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED:
      audion.entryPoints.handleNodeFromNodeDisconnected_(
          /** @type {!AudionNodeFromNodeDisconnectedMessage} */ (message));
      break;
    case audion.messaging.MessageType.NODE_FROM_PARAM_DISCONNECTED:
      audion.entryPoints.handleNodeFromParamDisconnected_(
          /** @type {!AudionNodeFromParamDisconnectedMessage} */ (message));
      break;
    case audion.messaging.MessageType.MISSING_AUDIO_UPDATES:
      audion.entryPoints.handleMissingAudioUpdates_();
      break;
    case audion.messaging.MessageType.PAGE_OF_TAB_CHANGED:
      audion.entryPoints.handlePageOfTabChanged_();
      break;
    case audion.messaging.MessageType.AUDIO_NODE_PROPERTIES_UPDATE:
      audion.entryPoints.handleAudioNodePropertiesUpdate_(
          /** @type {!AudionAudioNodePropertiesUpdateMessage} */ (message));
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
