/**
 * This script runs when the dev panel opens. It creates a Web Audio panel. It
 * owns (keeps up to date) the audio graph and controls the UI based on updates.
 */


/**
 * Creates an empty audio graph.
 * @return {!dagreD3.graphlib.Graph}
 */
function createEmptyAudioGraph() {
  return new dagreD3.graphlib.Graph({
        compound: true,
        multigraph: true
      })
      .setGraph(getGraphOptions())
      .setDefaultEdgeLabel(function () { return {}; });
};


/**
 * The updated audio graph.
 * @type {!Object}
 */
var audioGraph = createEmptyAudioGraph();


/**
 * An type of object that stores data about an AudioNode.
 * @typedef {{
 *   type: string, // The type of the AudioNode.
 *   audioNodeId: string, // An ID unique to the AudioNode within its frame.
 *   creationLineNumber: number, // The line at which the node was made.
 *   creationUrl: string // The URL at which the node was made.
 * }}
 */
var AudioNodeData;


/**
 * A mapping from graph node ID (unique to the AudioNode across all frames) to
 * data on the AudioNode it refers to.
 * @type {!Object<string, !AudioNodeData>}
 */
var audioNodes = {};


/**
 * The graph node ID (unique to the AudioNode across all frames) of the active
 * AudioNode (the one being inspected at the moment). Empty if none.
 * @type {string}
 */
var activeAudioNodeGraphId = '';


/**
 * Whether web audio updates occurred before this dev tools instance opened.
 * @type {boolean}
 */
var missingUpdates = false;


/**
 * The window of the panel. Non-null if the panel had shown at least once.
 * @type {?Window}
 */
var panelWindow = null;


/**
 * Whether the panel is currently shown.
 * @type {boolean}
 */
var panelShown = false;


// Connect with the background page so that it can relay web audio updates to
// this panel.
var backgroundPageConnection = chrome.runtime.connect({
  'name': 'init_dev_panel'
});


/**
 * Posts a message to the panel window. Assumes that it is open.
 * @param {!Object} message The message to post.
 */
function postToPanelWindow(message) {
  panelWindow.postMessage(message, panelWindow.location.origin || '*');
}


/**
 * If the panel window is open, requests the panel to redraw the audio graph,
 * which is stored within the audioGraph global variable within the panel JS
 * namespace. Does nothing if the panel window is hidden.
 */
function requestGraphRedraw() {
  if (panelShown) {
    postToPanelWindow({
      'type': 'redraw_graph'
    });
  }
}


/**
 * Handles what happens when the tab changes URL location.
 * @param {!Object} message The message indicating the change in page.
 */
function handleTabPageChange(message) {
  // Clear all audio graphs.
  audioGraph = createEmptyAudioGraph();
  if (panelWindow) {
    // Update the panel's audio graph reference to this new, reset one.
    panelWindow.audioGraph = audioGraph;

    // Tell the panel that the page had been reset.
    postToPanelWindow({
      'type': 'page_changed'
    });
  }
  requestGraphRedraw();
};


/**
 * Computes a unique ID for a node.
 * @param {string} frameId The ID of a frame.
 * @param {number} nodeId The ID of the node. Unique within the space of the
 *     frame.
 * @param {stirng=} opt_audioParam The audio param if this node is for an
 *     AudioParam.
 * @return {string} An ID unique to the node throughout the extension.
 */
function computeNodeId(frameId, nodeId, opt_audioParam) {
  return String(frameId + '$' + nodeId + '$' + (opt_audioParam || ''));
}


/**
 * Handles the creation of a new context.
 * @param {!Object} message The message indicating the update.
 */
function handleNewContext(message) {
  // TODO: ... do something. :)
};


/**
 * Handles the creation of a new node.
 * @param {!Object} message The message indicating the update.
 */
function handleAddNode(message) {
  // TODO: Track the node's params.

  // Remove 'Node' from the label.
  var nodeName = message.nodeType;
  if (nodeName.indexOf('Node') == nodeName.length - 4) {
    nodeName = nodeName.substring(0, nodeName.length - 4);
  }

  var graphNodeId = computeNodeId(message.frameId, message.nodeId);
  audioNodes[graphNodeId] = {
    type: nodeName,
    audioNodeId: message.nodeId,
    creationLineNumber: message.creationLineNumber,
    creationUrl: message.creationUrl
  };
  audioGraph.setNode(
      graphNodeId, getNodeOptions(nodeName, message.nodeId, graphNodeId));

  requestGraphRedraw();
};


/**
 * Computes an ID unique to the edge within the d3-dagre audio graph.
 * @param {string} sourceGraphNodeId The ID of the source node. Unique within
 *     the graph. Node: This differs from the integer node ID from the frame.
 * @param {string} destGraphNodeId The ID of the destination node. Unique within
 *     the graph. Node: This differs from the integer node ID from the frame.
 * @return {string} An ID unique to this edge.
 */
function computeEdgeId(sourceGraphNodeId, destGraphNodeId) {
  return sourceGraphNodeId + '|' + destGraphNodeId;
}


/**
 * Handles the addition of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleAddEdge(message) {
  var sourceNodeId = computeNodeId(message.frameId, message.sourceId);
  if (!audioGraph.node(sourceNodeId)) {
    // The source node is not tracked. Perhaps that node was made before dev
    // tools opened.
    return;
  }

  var destNodeId = computeNodeId(message.frameId, message.destId);
  if (!audioGraph.node(destNodeId)) {
    // The node the edge points to is not tracked. Perhaps that node was made
    // before dev tools opened.
    return;
  }

  if (message.audioParam) {
    // If this edge connects to an AudioParam, create a node for the AudioParam
    // if that node does not exist yet.
    var audioNodeId = destNodeId;
    destNodeId = computeNodeId(
        message.frameId, message.destId, message.audioParam);
    if (!audioGraph.node(destNodeId)) {
      audioGraph.setNode(
          destNodeId,
          getNodeOptions(
              audioNodes[audioNodeId].type,
              message.destId,
              audioNodeId,
              message.audioParam));
      // Connect this new node (for the newfound AudioParam) to its AudioNode.
      audioGraph.setEdge(
          destNodeId,
          audioNodeId,
          getEdgeOptions('PARAM_TO_NODE'),
          // Compute an ID unique to the edge.
          computeEdgeId(destNodeId, audioNodeId)
        );
    }
  }

  audioGraph.setEdge(
      sourceNodeId,
      destNodeId,
      getEdgeOptions(),
      // Compute an ID unique to the edge.
      computeEdgeId(sourceNodeId, destNodeId)
    );
  requestGraphRedraw();
};


/**
 * Handles the removal of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleRemoveEdge(message) {
  if (message.destId) {
    // Remove a specific edge.
    var sourceNodeId = computeNodeId(message.frameId, message.sourceId);
    if (!audioGraph.node(sourceNodeId)) {
      return;
    }
    var destNodeId = computeNodeId(message.frameId, message.destId);
    if (!audioGraph.node(destNodeId)) {
      return;
    }
    audioGraph.removeEdge(
        sourceNodeId,
        destNodeId,
        computeEdgeId(sourceNodeId, destNodeId)
      );
  } else {
    // Remove all edges emanating out of the source node.
    var edges = audioGraph.outEdges(
        computeNodeId(message.frameId, message.sourceId));
    for (var i = 0; i < edges.length; i++) {
      audioGraph.removeEdge(edges[i]);
    }
  }
  requestGraphRedraw();
};


/**
 * Note that the dev tools instance is missing some prior web audio updates.
 */
function handleMissingUpdates(message) {
  missingUpdates = true;
}


backgroundPageConnection.onMessage.addListener(function(message) {
  switch (message['type']) {
    case 'page_changed':
      // The tab's location changed. Reset the stored audio graph.
      handleTabPageChange(message);
      break;
    case 'new_context':
      // A new AudioContext has been created.
      handleNewContext(message);
      break;
    case 'add_node':
      // A node has been added to the audio graph.
      handleAddNode(message);
      break;
    case 'add_edge':
      // An edge has been added to the audio graph.
      handleAddEdge(message);
      break;
    case 'remove_edge':
      // An edge has been removed from the audio graph.
      handleRemoveEdge(message);
      break;
    case 'missing_updates':
      // This dev tools instance has missed some prior audio graph updates. The
      // visualized audio graph may be incomplete. The user may want to refresh.
      handleMissingUpdates(message);
      break;
  }
});


// Indicate to the background page that the dev panel can now receive messages.
backgroundPageConnection.postMessage({
    'type': 'listeners_ready',
    'inspectedTabId': chrome.devtools.inspectedWindow.tabId
  });


/**
 * Handles a request to update the active AudioNode (to inspect in the pane).
 * @param {!Object} message The message indicating the update.
 */
function handleUpdateActiveAudioNode(message) {
  if (!message.graphNodeId) {
    // The panel requests that the current active AudioNode be cleared.
    if (activeAudioNodeGraphId) {
      // The current active AudioNode has not been cleared yet.
      activeAudioNodeGraphId = '';
      // Tell the panel that we have successfully cleared the active AudioNode.
      postToPanelWindow({
        type: 'active_audio_node_updated'
      });
    }
    return;
  }

  // The graph node that triggered the request for changing the active
  // AudioNode. This might not map to an AudioNode yet. For instance, it might
  // map to a node representing an AudioParam or channel.
  var graphNode = audioGraph.node(message.graphNodeId);
  // audioNodeGraphId is the ID of the AudioNode unique throughout all frames.
  if (graphNode.audioNodeGraphId == activeAudioNodeGraphId) {
    // This AudioNode is already the active one.
    return;
  }
  var audioNodeData = audioNodes[graphNode.audioNodeGraphId];
  activeAudioNodeGraphId = graphNode.audioNodeGraphId;
  postToPanelWindow({
    type: 'active_audio_node_updated',
    audioNodeData: audioNodeData
  });
}


/**
 * Handles what happens when the 'Web Audio' panel opens for the first time
 * after the user opens Chrome dev tools.
 * @param {!Window} panelWindow The window object of the panel.
 */
function handlePanelOpenForFirstTime(localPanelWindow) {
  // Listen to messages from the panel.
  localPanelWindow.addEventListener('message', function(event) {
    var message = event.data
    switch (message['type']) {
      case 'update_active_audio_node':
        // The user requests the active AudioNode be updated.
        handleUpdateActiveAudioNode(message);
        break;
    }
  });

  if (missingUpdates) {
    // Tell the panel to warn the user about missing audio updates that occurred
    // before the dev tools instance was opened.
    postToPanelWindow({
      'type': 'missing_updates'
    });
  }
}


/**
 * Handles what happens whenever the panel is shown (user tabs into it).
 */
function handlePanelShown(localPanelWindow) {
  // Store a reference to the panel window every time it opens.
  panelWindow = localPanelWindow;
  panelShown = true;

  // Store a reference in the panel window (global to panel) to the audio graph
  // in this (dev tools) global namespace.
  panelWindow.audioGraph = audioGraph;

  // Request a redraw when the panel is shown.
  // TODO: Only do this when necessary.
  requestGraphRedraw();
}


/**
 * Handles what happens whenever the panel is hidden.
 */
function handlePanelHidden() {
  panelShown = false;
}


/**
 * Handles what happens when the Web Audio panel is created.
 * @param {!ExtensionPanel} extensionPanel The created panel.
 */
function handlePanelCreated(extensionPanel) {
  extensionPanel.onShown.addListener(handlePanelShown);
  extensionPanel.onHidden.addListener(handlePanelHidden);

  var callback = function(localPanelWindow) {
    // Run a callback on the first time that the panel is shown.
    handlePanelOpenForFirstTime(localPanelWindow);
    extensionPanel.onShown.removeListener(callback);
  };
  extensionPanel.onShown.addListener(callback);
}


/**
 * Produces a graph option object.
 * @return {Object} An object for the graph layout style.
 */
function getGraphOptions() {
  return {
    nodesep: 28,
    rankdir: 'LR',
    ranksep: 28,
    marginx: 14,
    marginy: 14
  };
}


/**
 * The fill color for AudioParam nodes.
 * @type @const {string}
 */
var AUDIO_PARAM_NODE_COLOR = '#B0BEC5';


// A color scheme for various AudioNodes.
var NODE_COLOR = {
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
  'AudioParam': '#B0BEC5'
};


/**
 * Produces a node option object with an argument of the node label.
 * @param {string} nodeName A name (type) of the AudioNode.
 * @param {string} nodeId ID of the AudioNode. Unique within the frame.
 * @param {string} audioNodeGraphId ID the AudioNode unique across all frames.
 *     If this node is for a channel or an AudioParam, this graph ID is that of
 *     the relevant AudioNode. Used to determine which AudioNode to make active.
 * @param {string=} opt_audioParam The audio param. Applicable if this node
 *     is for an AudioParam (not an AudioNode).
 * @return {Object} A node option object filled with the style properties and
 *                  the label.
 */
function getNodeOptions(nodeName, nodeId, audioNodeGraphId, opt_audioParam) {
  if (opt_audioParam) {
    // Use the options for a graph node for an AudioParam.
    return {
        labelType: 'html',
        label: opt_audioParam,
        style: 'stroke: none; fill: ' + AUDIO_PARAM_NODE_COLOR,
        labelStyle: 'color: black; font-family: Arial; text-transform: uppercase;',
        rx: 20,
        ry: 20,
        audioNodeGraphId: audioNodeGraphId
      };
  }
  // Use the options for a graph node for an AudioNode.
  return {
    labelType: 'html',
    label: '<span>' + nodeName + ' ' + nodeId + '</span>',
    style: 'stroke: none; fill: ' + NODE_COLOR[nodeName] + ';',
    labelStyle: 'color: white; font-family: Arial;',
    rx: 2,
    ry: 2,
    audioNodeGraphId: audioNodeGraphId
  };
}


/**
 * Produces a edge option object for styling.
 * @param {string=} opt_edgeType One of 'NODE_TO_NODE', 'PARAM_TO_NODE',
 *     'NODE_TO_CHANNEL', or 'CHANNEL_TO_NODE'. Defaults to 'NODE_TO_NODE'.
 * @return {Object} A node option object filled with the style properties.
 */
function getEdgeOptions(opt_edgeType) {
  if (opt_edgeType) {
    switch (opt_edgeType) {
      case 'PARAM_TO_NODE':
        return {
          lineInterpolate: 'linear',
          style: 'stroke-width: 2.5px; stroke-dasharray: 2.5, 2.5; stroke: #B0BEC5; fill: none;',
          arrowheadStyle: 'fill: none; stroke: none;',
          width: 1
        };
    }
  }
  return {
    lineInterpolate: 'basis',
    style: 'stroke-width: 2.5px; stroke: #90A4AE; fill: none;',
    arrowheadStyle: 'fill: #90A4AE; stroke: none;',
    width: 35
  };
}


/**
 * Produces a edge option object for styling between an AudioNode to an
 * AudioParam.
 * @return {Object} A node option object filled with the style properties.
 */
function getParamEdgeOptions() {
  // TODO: create the options for the connection from an AudioNode to an
  // AudioParam.
  return {};
}


chrome.devtools.panels.create(
    'Web Audio',
    // TODO: Think of an icon ... where does this icon even appear?!
    'images/temporaryIcon48.png',
    'panel.html',
    handlePanelCreated);
