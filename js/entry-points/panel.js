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
goog.provide('audion.entryPoints.panel');

goog.require('audion.messaging.MessageType');
goog.require('audion.messaging.Util');


/**
 * The element that contains all graph logic.
 * @private {!Element}
 */
audion.entryPoints.graphContainer_ = /** @type {!Element} */ (
    document.getElementById('graph'));


/**
 * The element that is the loading screen. This is normally hidden.
 * @private {!Element}
 */
audion.entryPoints.loadingScreen_ = /** @type {!Element} */ (
    document.getElementById('loading-screen'));


/**
 * The hidden element we render text into to gauge the width of the text.
 * @private {!Element}
 */
audion.entryPoints.textSandbox_ = /** @type {!Element} */ (
    document.getElementById('text-sandbox'));


/**
 * The last recorded graph to render if any.
 * @private {!joint.dia.Graph}
 */
audion.entryPoints.graph_ = new joint.dia.Graph();


/**
 * Whether a redraw is pending. Used to prevent superfluous redraws.
 * @private {boolean}
 */
audion.entryPoints.isRedrawPending_ = false;


/**
 * A mapping between graph node ID to a mapping between edge ID to link. Used
 * for link deletion.
 * @private {!Object.<string, !Object.<!joint.dia.Link>>}
 */
audion.entryPoints.linkMapping_ = {};


/**
 * Whether to resize when the graph does a layout. We may want to keep doing
 * layouts so long as the user does not interact.
 * @private {boolean}
 */
audion.entryPoints.shouldRescaleOnRelayout_ = true;


/**
 * The ID of the settimeout for showing the loading screen (after some time
 * frame of inactivity). If any such settimeout is pending.
 * @private {?number}
 */
audion.entryPoints.loadingTimeoutId_ = null;


/**
 * A mapping from AudioNode type to the color that we should use to visualize
 * it.
 * @private @const {!Object.<string, string>}
 */
audion.entryPoints.nodeTypeToColorMapping_ = {
  'Analyser': '#607D88',
  'AudioBufferSource': '#4CAF50',
  'AudioDestination': '#37474F',
  'BiquadFilter': '#4F7942',
  'ChannelMerger': '#607D8B',
  'ChannelSplitter': '#607D8B',
  'Convolver': '#4F7942',
  'Delay': '#4F7942',
  'DynamicsCompressor': '#4F7942',
  'Gain': '#607D8B',
  'IIRFilter': '#4F7942',
  'MediaElementAudioSource': '#4CAF50',
  'MediaStreamAudioDestination': '#37474F',
  'MediaStreamAudioSource': '#4CAF50',
  'Oscillator': '#4CAF50',
  'Panner': '#4F7942',
  'ScriptProcessor': '#607D88',
  'SpatialPanner': '#4F7942',
  'StereoPanner': '#4F7942',
  'WaveShaper': '#4F7942'
};


/**
 * Creates a paper.
 * @param {!Element} graphContainer The DOM element that is the graph.
 * @param {?joint.dia.Graph} graph The graph to use.
 * @return {!joint.dia.Paper}
 * @private
 */
audion.entryPoints.createPaper_ = function(graphContainer, graph) {
  return new joint.dia.Paper({
    'el': graphContainer,
    'width': graphContainer.offsetWidth,
    'height': graphContainer.offsetHeight,
    'model': graph,
    'snapLinks': {
      'radius': Infinity,
    },
    'linkPinning': false
  });
};


/**
 * The paper on which to render the graph.
 * @private {!joint.dia.Paper}
 */
audion.entryPoints.paper_ = audion.entryPoints.createPaper_(
    audion.entryPoints.graphContainer_, audion.entryPoints.graph_);


/**
 * Computes the label for a node.
 * @param {number} frameId
 * @param {number} nodeId
 * @return {string}
 * @private
 */
audion.entryPoints.computeNodeGraphId_ = function(frameId, nodeId) {
  return 'f' + frameId + 'n' + nodeId;
};


/**
 * Computes the label for an input port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {number} portIndex
 * @return {string}
 * @private
 */
audion.entryPoints.inPortLabel_ = function(frameId, nodeId, portIndex) {
  return audion.entryPoints.computeNodeGraphId_(frameId, nodeId) +
      'input' + portIndex;
};


/**
 * Computes the label for an output port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {number} portIndex
 * @return {string}
 * @private
 */
audion.entryPoints.outPortLabel_ = function(frameId, nodeId, portIndex) {
  return audion.entryPoints.computeNodeGraphId_(frameId, nodeId) +
      'output' + portIndex;
};


/**
 * Computes the label for an AudioParam port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {string} name The name of the AudioParam.
 * @return {string}
 * @private
 */
audion.entryPoints.audioParamPortLabel_ = function(frameId, nodeId, name) {
  return audion.entryPoints.computeNodeGraphId_(frameId, nodeId) +
      '$param$' + name;
};


/**
 * Computes the label for an edge between 2 ports.
 * @param {string} sourcePortLabel
 * @param {string} destinationPortLabel
 * @return {string}
 * @private
 */
audion.entryPoints.computeEdgeLabel_ = function(
    sourcePortLabel, destinationPortLabel) {
  return sourcePortLabel + '|' + destinationPortLabel;
};


/**
 * Handles the creation of a new link.
 * @private
 */
audion.entryPoints.handleLinkCreated_ = function(link) {
  var sourceId = link.get('source').id;
  if (!sourceId || !link.get('target').id) {
    return;
  }

  // This source node lacks a mapping from link ID to link. Create it.
  if (!audion.entryPoints.linkMapping_[sourceId]) {
    audion.entryPoints.linkMapping_[sourceId] = {};
  }
  audion.entryPoints.linkMapping_[sourceId][link.id] = link;
};


/**
 * Handles the creation of an AudioNode (that might not be part of a graph yet).
 * @param {!AudionNodeCreatedMessage} message
 * @private
 */
audion.entryPoints.handleNodeCreated_ = function(message) {
  // Strip the node suffix. It is redundant.
  var suffix = 'Node';
  var nodeType = message.nodeType
  if (nodeType.slice(-4) == suffix) {
    // Remove "Node" from the type of the node.
    nodeType = nodeType.substr(0, nodeType.length - suffix.length);
  }

  var frameId = /** @type {number} */ (message.frameId);
  var nodeLabel = nodeType + ' ' + message.nodeId;

  // Create labels for in ports.
  var ports = [];
  for (var i = 0; i < message.numberOfInputs; i++) {
    ports.push({
      'id': audion.entryPoints.inPortLabel_(frameId, message.nodeId, i),
      'group': 'in'
    });
  }

  // Create labels for out ports.
  for (var i = 0; i < message.numberOfOutputs; i++) {
    ports.push({
      'id': audion.entryPoints.outPortLabel_(frameId, message.nodeId, i),
      'group': 'out'
    });
  }

  // Create labels for audio param ports.
  for (var i = 0; i < message.audioParamNames.length; i++) {
    ports.push({
      'id': audion.entryPoints.audioParamPortLabel_(
          frameId, message.nodeId, message.audioParamNames[i]),
      'group': 'param'
    });
  }

  // Determine the would-be length of the text.
  audion.entryPoints.textSandbox_.textContent = nodeLabel;

  // The width should be wide enough for both text and ports.
  var portDim = 23;
  var textWidth = audion.entryPoints.textSandbox_.clientWidth + 41;
  var portWidth = message.audioParamNames.length * portDim;
  var width = Math.max(textWidth, portWidth);

  // Create a node.
  var nodeColor =
      audion.entryPoints.nodeTypeToColorMapping_[nodeType] || '#000';
  new joint.shapes.basic.Rect({
    'id': audion.entryPoints.computeNodeGraphId_(frameId, message.nodeId),
    'attrs': {
        'rect': {
          'fill': nodeColor,
          'rx': 2,
          'ry': 2,
          'stroke-width': 0
        },
        'text': {
          'fill': '#fff',
          'text': nodeLabel
        },
        '.inPorts circle': {'fill': '#16A085'},
        '.outPorts circle': {'fill': '#E74C3C'},
        '.paramPorts circle': {'fill': '#90CAF9'}
    },
    'size': {
      // Just a heuristic. Add a little padding.
      'width': width,
      'height': Math.max(
          40,
          Math.max(message.numberOfInputs, message.numberOfOutputs) * portDim)
    },
    'ports': {
      'groups': {
          'in': {
              'attrs': {
                  'text': {'fill': '#000000'},
                  'circle':
                      {
                        'fill': '#00ff00',
                        'stroke': '#000000',
                        'magnet': 'passive'
                      }
              },
              'interactive': false,
              'position': 'left',
              'label': null
          },
          'out': {
              'attrs': {
                  'text': {'fill': '#000000' },
                  'circle':
                      {
                        'fill': '#ff0000',
                        'stroke': '#000000',
                        'magnet': true
                      }
              },
              'interactive': false,
              'position': 'right',
              'label': null
          },
          'param': {
              'attrs': {
                  'text': {'fill': '#000000'},
                  'circle':
                      {
                        'fill': '#0000ff',
                        'stroke': '#000000',
                        'magnet': 'passive'
                      }
              },
              'interactive': false,
              'position': 'bottom',
              'label': null
          }
      },
      'items': ports
    }
  }).addTo(audion.entryPoints.graph_);

  audion.entryPoints.requestRedraw_();
};


/**
 * Adds a link between 2 ports to the graph. Requests a redraw afterwards.
 * @param {string} sourceNodeLabel
 * @param {string} sourcePortLabel
 * @param {string} destinationNodeLabel
 * @param {string} destinationPortLabel
 * @private
 */
audion.entryPoints.addLink_ = function(
    sourceNodeLabel,
    sourcePortLabel,
    destinationNodeLabel,
    destinationPortLabel) {
  var source = {
      'id': sourceNodeLabel,
      'port': sourcePortLabel
  };
  var target = {
      'id': destinationNodeLabel,
      'port': destinationPortLabel
  };
  var link = new joint.shapes.devs.Link({
      'id': audion.entryPoints.computeEdgeLabel_(
          sourcePortLabel, destinationPortLabel),
      'source': source,
      'target': target,
      'router': {name: 'metro'},
      'connector': {name: 'rounded'}
  }).addTo(audion.entryPoints.graph_);
  link.attr({'.marker-target': {'d': 'M 10 0 L 0 5 L 10 10 z'}});
  audion.entryPoints.handleLinkCreated_(link);
  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode connects with another AudioNode.
 * @param {!AudionNodeToNodeConnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeToNodeConnected_ = function(message) {
  if (!message.sourceNodeId || !message.destinationNodeId) {
    throw 'Undefined node. Message: ' + JSON.stringify(message);
  }

  var frameId = /** @type {number} */ (message.frameId);
  audion.entryPoints.addLink_(
      audion.entryPoints.computeNodeGraphId_(frameId, message.sourceNodeId),
      audion.entryPoints.outPortLabel_(
          frameId, message.sourceNodeId, message.fromChannel),
      audion.entryPoints.computeNodeGraphId_(
          frameId, message.destinationNodeId),
      audion.entryPoints.inPortLabel_(
          frameId, message.destinationNodeId, message.toChannel));
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
  audion.entryPoints.graph_.clear();

  // Well, the tab just changed, so we can't be missing audio updates.
  audion.entryPoints.audioUpdatesMissing_ = false;

  // Tell the panel to reset to this empty graph.
  audion.entryPoints.resetUi_(audion.entryPoints.graph_);
};


/**
 * Handles when a node connects to an AudioParam.
 * @param {!AudionNodeToParamConnectedMessage} message
 */
audion.entryPoints.handleNodeToParamConnected_ = function(message) {
  if (!message.sourceNodeId || !message.destinationNodeId) {
    throw 'Undefined node. Message: ' + JSON.stringify(message);
  }

  var frameId = /** @type {number} */ (message.frameId);
  audion.entryPoints.addLink_(
      audion.entryPoints.computeNodeGraphId_(frameId, message.sourceNodeId),
      audion.entryPoints.outPortLabel_(
          frameId, message.sourceNodeId, message.fromChannel),
      audion.entryPoints.computeNodeGraphId_(
          frameId, message.destinationNodeId),
      audion.entryPoints.audioParamPortLabel_(
          frameId, message.destinationNodeId, message.destinationParamName));
};


/**
 * Removes a link.
 * @param {string} nodeGraphId
 * @param {string} linkId
 * @private
 */
audion.entryPoints.removeLink_ = function(nodeGraphId, linkId) {
  var mapping = audion.entryPoints.linkMapping_[nodeGraphId];
  if (!mapping) {
    // The source node cannot be found.
    return;
  }

  var link = mapping[linkId];
  if (!link) {
    // The link could not be found.
    return;
  }

  // Remove the link.
  link.remove();
  delete mapping[linkId];

  // Remove the mapping for the source node to conserve memory if applicable.
  var noMoreLinks = true;
  for (var localLinkId in mapping) {
    noMoreLinks = false;
    break;
  }
  if (noMoreLinks) {
    delete audion.entryPoints.linkMapping_[nodeGraphId];
  }

  // We removed a link and thus changed the graph. Request a redraw.
  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioNode.
 * @param {!AudionNodeFromNodeDisconnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeFromNodeDisconnected_ = function(message) {
  var frameId = /** @type {number} */ (message.frameId);
  var sourceId = audion.entryPoints.computeNodeGraphId_(
      frameId, message.sourceNodeId);
  var mapping = audion.entryPoints.linkMapping_[sourceId];
  if (!mapping) {
    // The source node cannot be found.
    return;
  }

  var linkId = audion.entryPoints.computeEdgeLabel_(
      audion.entryPoints.outPortLabel_(
          frameId, message.sourceNodeId, message.fromChannel),
      audion.entryPoints.inPortLabel_(
          frameId, message.disconnectedFromNodeId, message.toChannel));
  audion.entryPoints.removeLink_(sourceId, linkId);
};


/**
 * Handles when an AudioNode disconnects from everything.
 * @param {!AudionAllDisconnectedMessage} message
 * @private
 */
audion.entryPoints.handleAllDisconnected_ = function(message) {
  var frameId = /** @type {number} */ (message.frameId);
  var sourceId = audion.entryPoints.computeNodeGraphId_(
      frameId, message.nodeId);
  var mapping = audion.entryPoints.linkMapping_[sourceId];
  if (!mapping) {
    // The source node cannot be found. Or, it lacks outbound links.
    return;
  }

  // Remove all outgoing links.
  for (var linkId in mapping) {
    mapping[linkId].remove();
  }
  delete audion.entryPoints.linkMapping_[sourceId];

  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioParam.
 * @param {!AudionNodeFromParamDisconnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeFromParamDisconnected_ = function(message) {
  var frameId = /** @type {number} */ (message.frameId);
  var sourceId = audion.entryPoints.computeNodeGraphId_(
      frameId, message.sourceNodeId);
  var mapping = audion.entryPoints.linkMapping_[sourceId];
  if (!mapping) {
    // The source node cannot be found.
    return;
  }

  var linkId = audion.entryPoints.computeEdgeLabel_(
      audion.entryPoints.outPortLabel_(
          frameId, message.sourceNodeId, message.fromChannel),
      audion.entryPoints.audioParamPortLabel_(
          frameId, message.disconnectedFromNodeId, message.audioParamName));
  audion.entryPoints.removeLink_(sourceId, linkId);
};


/**
 * Handles a message from the background script that contains information on a
 * node being inspected.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodePropertiesUpdate_ = function(message) {
  // TODO
  audion.entryPoints.requestRedraw_();
};


/**
 * Resizes the paper to fit.
 * @private
 */
audion.entryPoints.resizeToFit_ = function() {
  audion.entryPoints.paper_.scaleContentToFit({
    'padding': 30
  });
};


/**
 * Redraws the graph. Maybe expensive.
 * @private
 */
audion.entryPoints.redraw_ = function() {
  // Indicate that subsequent changes will need a new redraw.
  audion.entryPoints.isRedrawPending_ = false;

  var layout = joint.layout.DirectedGraph.layout(audion.entryPoints.graph_, {
      'rankDir': 'LR',
      'setLinkVertices': true
    });

  if (!layout.width ||
      !layout.height ||
      !isFinite(layout.width) ||
      !isFinite(layout.height)) {
    // The layout failed. Perhaps the graph is empty.
    return;
  }

  // Resize the paper.
  if (audion.entryPoints.shouldRescaleOnRelayout_) {
    audion.entryPoints.resizeToFit_();
  }

  // Hide the loading screen if it is showing.
  audion.entryPoints.loadingScreen_.classList.remove(goog.getCssName('shown'));
  if (audion.entryPoints.loadingTimeoutId_) {
    // Do not later show the loading screen.
    goog.global.clearTimeout(audion.entryPoints.loadingTimeoutId_);
    audion.entryPoints.loadingTimeoutId_ = null;
  }
};


/**
 * Requests a redraw of the visual graph.
 * @private
 */
audion.entryPoints.requestRedraw_ = function() {
  // TODO: Resize the paper when the panel window resizes.

  if (audion.entryPoints.isRedrawPending_) {
    // A redraw is pending already. Do not excessively redraw.
    return;
  }

  // Indicate that a redraw is pending.
  audion.entryPoints.isRedrawPending_ = true;

  if (!goog.isNull(audion.entryPoints.loadingTimeoutId_)) {
    audion.entryPoints.loadingTimeoutId_ = goog.global.setTimeout(function() {
      // If rendering does not finish within 50 ms, show the loading screen.
      audion.entryPoints.loadingScreen_.classList.add(goog.getCssName('shown'));
      audion.entryPoints.loadingScreen_.loadingTimeoutId_ = null;
    }, 50);
  }

  // Throttle to every other frame.
  goog.global.requestAnimationFrame(function() {
    goog.global.requestAnimationFrame(audion.entryPoints.redraw_);
  });
};


/**
 * Resets the UI. Hides warning about missing audio updates. Resets panning and
 * zooming.
 * @param {!joint.dia.Graph} visualGraph
 * @private
 */
audion.entryPoints.resetUi_ = function(visualGraph) {
  audion.entryPoints.graph_ = visualGraph;
  audion.entryPoints.shouldRescaleOnRelayout_ = true;
  audion.entryPoints.requestRedraw_();
};


/**
 * Accepts a message from the dev tools script.
 * {!AudionMessageFromFrame} message The message to receive.
 */
audion.entryPoints.acceptMessage_ = function(message) {
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
 * The entry point for the script to run in our web audio Chrome dev panel -
 * the actual UI of the panel.
 */
audion.entryPoints.panel = function() {
  // Define some functions global to the panel window namespace so that the dev
  // tools script (which has complete access to the panel page window upon
  // creating the panel page) can directly call the functions to change the UI.
  goog.global['acceptMessage'] = audion.entryPoints.acceptMessage_;

  // Handle link creation.
  audion.entryPoints.graph_.on(
      'change:source change:target', audion.entryPoints.handleLinkCreated_);
};


audion.entryPoints.panel();
