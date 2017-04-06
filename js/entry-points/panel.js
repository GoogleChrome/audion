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
goog.require('audion.ui.pane.AudioNodeMode');
goog.require('audion.ui.pane.ModeType');
goog.require('audion.ui.pane.Pane');
goog.require('audion.ui.tooltip.Tooltip');


/**
 * The element that contains all graph logic.
 * @private @const {!Element}
 */
audion.entryPoints.graphContainer_ = /** @type {!Element} */ (
    document.getElementById('graph'));


/**
 * An element absolute positioned and used to detect the dimensions of the page.
 * The graph div does not suffice because its dimensions may change.
 * @private @const {!Element}
 */
audion.entryPoints.pageSizeDetector_ = /** @type {!Element} */ (
    document.getElementById('page-size-detector'));


/**
 * The current zoom relative to the entire graph fitting in the screen.
 * @private {!number}
 */
audion.entryPoints.zoom_ = 1;


/**
 * How much to zoom in / out per mouse wheel event.
 * @private @const {!number}
 */
audion.entryPoints.zoomSensitivity_ = 1.2;


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
 * The element that is the loading screen. This element is normally hidden.
 * @private @const {!Element}
 */
audion.entryPoints.loadingScreen_ = /** @type {!Element} */ (
    document.getElementById('loading-screen'));


/**
 * Whether web audio updates are missing. If we are missing web audio updates,
 * then the screen below is hidden.
 * @private {boolean}
 */
audion.entryPoints.updatesAreMissing_ = false;


/**
 * The element that is the screen notifying the user that web audio updates
 * occurred before dev tools opened, in which case the user must refresh to use
 * this tool. This element is normally hidden.
 * @private @const {!Element}
 */
audion.entryPoints.missingUpdatesScreen_ = /** @type {!Element} */ (
    document.getElementById('updates-missing-screen'));


/**
 * The hidden element we render text into to gauge the width of the text.
 * @private @const {!Element}
 */
audion.entryPoints.textSandbox_ = /** @type {!Element} */ (
    document.getElementById('text-sandbox'));


/**
 * The last recorded graph to render if any.
 * @private @const {!joint.dia.Graph}
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
 * The pane used to say highlight information such as information on an
 * inspected AudioNode.
 * @private @const {!audion.ui.pane.Pane}
 */
audion.entryPoints.pane_ = new audion.ui.pane.Pane();


/**
 * A tooltip used to clarify info in the UI.
 * @private @const {!audion.ui.tooltip.Tooltip}
 */
audion.entryPoints.tooltip_ = new audion.ui.tooltip.Tooltip();


/**
 * Computes the color that should be used to visualize an AudioNode.
 * @param {string} nodeType The type of the node. With the Node suffix removed.
 * @param {boolean} isOffline Whether this node pertains to an
 *     OfflineAudioContext.
 * @return {string} The hex color used to visualize the AudioNode.
 * @private
 */
audion.entryPoints.computeNodeColor_ = function(nodeType, isOffline) {
  // AudioNodes are grouped into color categories based on their purposes.
  switch (nodeType) {
    case 'AudioDestination':
      // The destination nodes of OfflineAudioContexts are brown. Those of
      // "non-offline" AudioContexts are a dark grey.
      return isOffline ? '#5D4037' : '#37474F';
    case 'AudioBufferSource':
    case 'Oscillator':
      return '#009688';
    case 'BiquadFilter':
    case 'Convolver':
    case 'Delay':
    case 'DynamicsCompressor':
    case 'IIRFilter':
    case 'Panner':
    case 'StereoPanner':
    case 'WaveShaper':
      return '#2196F3';
    case 'Analyser':
      return '#00BCD4';
    case 'Gain':
    case 'ChannelMerger':
    case 'ChannelSplitter':
      return '#3F51B5';
    case 'MediaElementAudioSource':
    case 'MediaStreamAudioDestination':
    case 'MediaStreamAudioSource':
      return '#9C27B0';
    case 'ScriptProcessor':
      return '#C62828';
  }

  // Nothing matched. Odd. Highlight this node in dark red.
  return '#C62828';
};


/**
 * Computes the JointJS cell ID for the shape of an AudioNode.
 * @return {string}
 * @private
 */
audion.entryPoints.computeCellId_ = function(frameId, nodeId) {
  return 'f' + frameId + 'n' + nodeId;
};


/**
 * Unhighlights the current Audio Node if one is highlighted.
 * @private
 */
audion.entryPoints.unhighlightCurrentAudioNode_ = function() {
  var nodeEntry = audion.entryPoints.highlightedAudioNode_;
  if (!nodeEntry) {
    // No AudioNode highlighted. Nothing to do.
    return;
  }

  audion.entryPoints.highlightedAudioNode_ = null;

  var cellId = audion.entryPoints.computeCellId_(
      nodeEntry.frameId, nodeEntry.audioNodeId);
  V(audion.entryPoints.paper_.findViewByModel(cellId)['el'])['removeClass'](
      goog.getCssName('highlightedAudioNode'));
  audion.messaging.Util.postMessageToWindow(
    /** @type {!AudionNodeUnhighlightedMessage} */ ({
      type: audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED,
      audioNodeId: nodeEntry.audioNodeId,
      frameId: nodeEntry.frameId
    }));
};


/**
 * Handles a click on a cell in the graph. A cell can be a node, an edge, or
 * some other entity in the graph.
 * @param {!Object} cellView A JointJS cell view.
 * @private
 */
audion.entryPoints.handleCellClick_ = function(cellView) {
  // When the user clicks on a node, highlight it.
  var model = cellView['model'];
  if (!model) {
    return;
  }
  var modelId = /** @type {string} */ (model['id']);
  if (!modelId) {
    return;
  }

  var groups = modelId.match(/^f(\d+)n(\d+)$/);
  if (!groups || groups.length != 3) {
    // No frame ID, node ID combo found.
    return;
  }

  var frameId = groups[1];
  var audioNodeId = groups[2];

  if (audion.entryPoints.highlightedAudioNode_ &&
      audion.entryPoints.highlightedAudioNode_.frameId == frameId &&
      audion.entryPoints.highlightedAudioNode_.audioNodeId == audioNodeId) {
    // This audio node is already highlighted. Nothing to do.
    return;
  }

  // If an AudioNode is highlighted, unhighlight it. The user is interested in
  // a different one now.
  audion.entryPoints.unhighlightCurrentAudioNode_();

  // Update the highlighted AudioNode to be the new one.
  audion.entryPoints.highlightedAudioNode_ =
      /** @type {?audion.entryPoints.AudioNodeEntry_} */ ({
    frameId: frameId,
    audioNodeId: audioNodeId
  });

  var cellId = audion.entryPoints.computeCellId_(frameId, audioNodeId);
  V(audion.entryPoints.paper_.findViewByModel(cellId)['el'])['addClass'](
      goog.getCssName('highlightedAudioNode'));

  // Tell the dev tools script about the new highlighted node.
  audion.messaging.Util.postMessageToWindow(
    /** @type {!AudionNodeHighlightedMessage} */ ({
      type: audion.messaging.MessageType.AUDIO_NODE_HIGHLIGHTED,
      frameId: frameId,
      audioNodeId: audioNodeId
    }));
};


/**
 * Turns off auto-resize, ie resizing the canvas when the screen resizes.
 * @private
 */
audion.entryPoints.turnOffAutoResize_ = function() {
  audion.entryPoints.shouldRescaleOnRelayout_ = false;
};


/**
 * Determines whether the paper is interactive given the cell view.
 * @param {!Object} cellView The view of the relevant cell in the graph.
 * @return {boolean|!Object}
 * @private
 */
audion.entryPoints.decideInteractivity_ = function(cellView) {
  if (cellView['model']['isLink']()) {
    return {
      'vertexAdd': false,
      'vertexRemove': false,
      'arrowheadMove': false,
      'vertexMove': false
    };
  }

  // Allow most interactions.
  return true;
};


/**
 * Creates a paper.
 * @param {!Element} graphContainer The DOM element that is the graph.
 * @param {?joint.dia.Graph} graph The graph to use.
 * @return {!joint.dia.Paper}''
 * @private
 */
audion.entryPoints.createPaper_ = function(graphContainer, graph) {
  var paper = new joint.dia.Paper({
    'el': graphContainer,
    'width': graphContainer.offsetWidth,
    'height': graphContainer.offsetHeight,
    'model': graph,
    'snapLinks': {
      'radius': Infinity,
    },
    // Asynchronously render the paper. Don't update UI on every node update.
    'async': true,
    // Trigger cell:pointerclick events.
    'clickThreshold': 1,
    'linkPinning': false,
    'interactive': audion.entryPoints.decideInteractivity_
  });

  paper.on('cell:pointerclick', audion.entryPoints.handleCellClick_);

  // When the user interacts with the graph, do not reset the view on every
  // layout - that might override user configurations.
  var nonResetInteractions = [
      'blank:mousewheel',
      'blank:pointerclick',
      'cell:mousewheel',
      'cell:pointermove'
    ];
  for (var i = 0; i < nonResetInteractions.length; i++) {
    paper.on(nonResetInteractions[i], audion.entryPoints.turnOffAutoResize_);
  }

  paper.on('cell:pointerdown', function(cellView, evt) {
    // Don't let the user drag the graph around via JointJS. We have the pan
    // zoom library handle that.
    paper.setInteractivity(false);
  });

  paper.on('cell:pointerup', function(cellView, evt) {
    // Re-enable some interactions.
    paper.setInteractivity(audion.entryPoints.decideInteractivity_);
  });

  return paper;
};


/**
 * The paper on which to render the graph.
 * @private {!joint.dia.Paper}
 */
audion.entryPoints.paper_ = audion.entryPoints.createPaper_(
    audion.entryPoints.graphContainer_, audion.entryPoints.graph_);


/**
 * Creates a pan zoom object (for panning and zooming).
 * @return {!Object}
 * @private
 */
audion.entryPoints.createPanZoomObject_ = function() {
  var svgContainer = audion.entryPoints.graphContainer_.querySelector('svg');
  return goog.global['svgPanZoom'](
    svgContainer, {
    'viewportSelector': svgContainer.firstChild,
    'zoomEnabled': true,
    'controlIconsEnabled': false,
    'minZoom': 0.1,
    'zoomScaleSensitivity': 0.3,
    'dblClickZoomEnabled': false,
    'fit': false,
    'center': false
  });
};


/**
 * An object that manages panning and zooming.
 * @private {!Object}
 */
audion.entryPoints.panZoomObject_ = audion.entryPoints.createPanZoomObject_();


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

  var leftSidePortCount =
      message.numberOfInputs + message.audioParamNames.length;

  var portPadding = 4;
  var inputPortRadius = 10;
  var totalInputPortHeight = inputPortRadius * 2 + portPadding;
  var audioParamPortRadius = 5;
  var totalParamPortHeight = audioParamPortRadius * 2 + portPadding;
  var leftTextIndent = 12;

  // Even if there are no input ports, leave room for the node label.
  var inputPortSectionHeight =
      totalInputPortHeight * Math.max(1, message.numberOfInputs);
  var paramPortSectionHeight =
      totalParamPortHeight * message.audioParamNames.length;

  // Use the max of the left and right side heights as the total height.
  // Include a little padding on the left.
  var leftSideTopPadding = 5;
  var leftSideBottomPadding = message.audioParamNames.length ? 6 : 8;
  var totalHeight = Math.max(
      inputPortSectionHeight + paramPortSectionHeight + leftSideTopPadding +
          leftSideBottomPadding,
      totalInputPortHeight * message.numberOfOutputs);

  // Create labels for in ports.
  var ports = [];
  var inputPortY = inputPortRadius + leftSideTopPadding;
  for (var i = 0; i < message.numberOfInputs; i++) {
    ports.push({
      'id': audion.entryPoints.inPortLabel_(frameId, message.nodeId, i),
      'group': 'in',
      'attrs': {
        'text': {
          'text': i
        },
      },
      'args': {
        'y': inputPortY
      }
    });
    inputPortY += totalInputPortHeight
  }

  // Create labels for out ports.
  for (var i = 0; i < message.numberOfOutputs; i++) {
    ports.push({
      'id': audion.entryPoints.outPortLabel_(frameId, message.nodeId, i),
      'group': 'out',
      'attrs': {
        'text': {
          'text': i
        }
      }
    });
  }

  // Compute the max width. Part of that entails computing the max param label
  // length. Style the invisible text sandbox so that it accurately sizes text.
  var maxTextLength = 0;
  audion.entryPoints.textSandbox_.classList.add(
      goog.getCssName('audioParamText'));

  // Create labels for audio param ports.
  var audioParamY =
      inputPortSectionHeight + leftSideTopPadding + audioParamPortRadius;
  for (var i = 0; i < message.audioParamNames.length; i++) {
    ports.push({
      'id': audion.entryPoints.audioParamPortLabel_(
          frameId, message.nodeId, message.audioParamNames[i]),
      'group': 'param',
      'attrs': {
        'text': {
          'text': message.audioParamNames[i]
        }
      },
      'args': {
        'y': audioParamY
      },
    });
    audioParamY += totalParamPortHeight;

    // Determine the audio param label max length.
    audion.entryPoints.textSandbox_.textContent = message.audioParamNames[i];
    maxTextLength = Math.max(
        maxTextLength, audion.entryPoints.textSandbox_.clientWidth);
  }

  // No longer size the text based on the smaller audio param text font.
  audion.entryPoints.textSandbox_.classList.remove(
      goog.getCssName('audioParamText'));

  // Determine the would-be length of the node label text.
  audion.entryPoints.textSandbox_.textContent = nodeLabel;
  maxTextLength = Math.max(
        maxTextLength, audion.entryPoints.textSandbox_.clientWidth);

  // Create a node.
  var nodeColor = audion.entryPoints.computeNodeColor_(
      nodeType, message.isOffline);

  var textSpecifications = {
    'fill': '#fff',
    'text': nodeLabel
  };
  // Only manually y-position the node label if we have several input
  // ports. Otherwise, the label won't align with the port.
  if (leftSidePortCount > 1 || message.numberOfOutputs > 1) {
    textSpecifications = Object.assign(textSpecifications, {
      'text-anchor': 'left',
      'x-alignment': 'left',
      'y-alignment': 'top',
      'ref-x': leftTextIndent,
      'ref-y': 4 + leftSideTopPadding,
    });
  }
  new joint.shapes.basic.Rect({
    'id': audion.entryPoints.computeNodeGraphId_(frameId, message.nodeId),
    'attrs': {
      'rect': {
        'fill': nodeColor,
        'rx': 3,
        'ry': 3,
        'stroke-width': 0
      },
      'text': textSpecifications,
      // What does this do?
      // '.inPorts circle': {'fill': '#4CAF50'},
      // '.outPorts circle': {'fill': '#FF9800'},
      // '.paramPorts circle': {'fill': '#A5D6A7'}
    },
    'size': {
      'width': maxTextLength + leftTextIndent + 30,
      'height': totalHeight
    },
    'ports': {
      'groups': {
        'in': {
          'attrs': {
            'circle': {
              'fill': '#4CAF50',
              'r': inputPortRadius,
              'stroke': '#000000',
              // Prevent interactions with the port.
              'magnet': 'passive'
            }
          },
          'interactive': false,
          'position': 'left',
          'label': {
            'position': {
              'name' :'bottom',
              'args': {
                'x': 0,
                'y': -3
              }
            }
          }
        },
        'out': {
          'attrs': {
            'circle': {
              'fill': '#E91E63',
              'r': inputPortRadius,
              'stroke': '#000000',
              'magnet': 'passive'
            }
          },
          'interactive': false,
          'position': 'right',
          'label': {
            'position': {
              'name' :'bottom',
              'args': {
                  'x': 0,
                  'y': -3
              }
            }
          }
        },
        'param': {
          'attrs': {
            'text': {
              'fill': '#CFD8DC'
            },
            'circle': {
              'fill': '#CDDC39',
              'r': audioParamPortRadius,
              'stroke': '#000000',
              'magnet': 'passive'
            }
          },
          'interactive': false,
          'position': 'left',
          'label': {
            'position': {
              'name' : 'right',
              'args': {
                'x': leftTextIndent,
                'y': 0,
                'angle': 0
              }
            }
          }
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
  var linkId = audion.entryPoints.computeEdgeLabel_(
      sourcePortLabel, destinationPortLabel);
  if (audion.entryPoints.linkMapping_ &&
      audion.entryPoints.linkMapping_[sourceNodeLabel] &&
      audion.entryPoints.linkMapping_[sourceNodeLabel][linkId]) {
    // This link exists already. Do not duplicate it. Otherwise, JointJS
    // actually makes 2 links. One atop the other.
    return;
  }

  var source = {
      'id': sourceNodeLabel,
      'port': sourcePortLabel
  };
  var target = {
      'id': destinationNodeLabel,
      'port': destinationPortLabel
  };
  var link = new joint.shapes.devs.Link({
      'id': linkId,
      'source': source,
      'target': target,
      // Do not route edges. Defer to edges generated by dagre.
      'router': null,
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
  // Show the screen that notifies the user. This screen occludes the tool.
  audion.entryPoints.missingUpdatesScreen_.classList.add(
      goog.getCssName('shown'));
  audion.entryPoints.updatesAreMissing_ = true;
};


/**
 * Removes the loading screen. And prevents it from showing if a request to load
 * the screen is pending. Does nothing if the screen is not showing and is not
 * slated to be shown.
 * @private
 */
audion.entryPoints.removeLoadingScreen_ = function() {
  // Hide the loading screen if it is showing.
  audion.entryPoints.loadingScreen_.classList.remove(goog.getCssName('shown'));
};


/**
 * Resets the panel. As if the user just visited a new page. This is also used
 * to set up tests.
 */
audion.entryPoints.resetPanel = function() {
  // Unhighlight the current highlighted node if there is one.
  audion.entryPoints.pane_.setMode(null);

  // Reset the graph.
  audion.entryPoints.graph_.clear();

  // Well, the tab just changed, so we can't be missing audio updates.
  audion.entryPoints.updatesAreMissing_ = false;
  audion.entryPoints.missingUpdatesScreen_.classList.remove(
      goog.getCssName('shown'));

  // Hide the loading screen.
  audion.entryPoints.removeLoadingScreen_();

  // Tell the panel to reset to this empty graph.
  audion.entryPoints.resetUi_();
};


/**
 * Handles the case in which the tab URL changes. We have to reset.
 * @private
 */
audion.entryPoints.handlePageOfTabChanged_ = function() {
  audion.entryPoints.resetPanel();
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
 * @param {string} nodeGraphId The source node.
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
  var mode = audion.entryPoints.pane_.getMode();
  if (mode && mode.getType() == audion.ui.pane.ModeType.AUDIO_NODE) {
    mode = /** @type {!audion.ui.pane.AudioNodeMode} */ (mode);
    if (mode.getFrameId() == message.frameId &&
        mode.getAudioNodeId() == message.audioNodeId) {
      // If the pane is currently showing the properties of this AudioNode, just
      // have it update current property values.
      mode.updateAudioProperties(message);
      return;
    }
  }

  // We are now inspecting a new AudioNode. Delete the old mode of display in
  // the pane and create a new one.
  mode = new audion.ui.pane.AudioNodeMode(message);
  // When the mode is done (ie, the pane is closed or swapped to something
  // else like a new node), tell the content script to stop sending updates.
  mode.setCleanUpCallback(function() {
    var nodeEntry = audion.entryPoints.highlightedAudioNode_;
    if (!nodeEntry ||
        nodeEntry.frameId != mode.getFrameId() ||
        nodeEntry.audioNodeId != mode.getAudioNodeId()) {
      // This node is irrelevant. We are unhighlighting a completely different
      // node.
      return;
    }
    // Unhighlight the previous node.
    audion.entryPoints.unhighlightCurrentAudioNode_();
  });

  audion.entryPoints.pane_.setMode(mode);
};


/**
 * Resizes the paper to fit.
 * @private
 */
audion.entryPoints.resizeToFit_ = function() {
  audion.entryPoints.panZoomObject_['updateBBox']();
  audion.entryPoints.panZoomObject_['fit']();
  audion.entryPoints.panZoomObject_['center']();
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
      'setLinkVertices': true,
      'rankSep': 50
    });

  if (!layout.width ||
      !layout.height ||
      !isFinite(layout.width) ||
      !isFinite(layout.height)) {
    // The layout failed.
    audion.entryPoints.removeLoadingScreen_();
    return;
  }

  // Resize the paper.
  if (audion.entryPoints.shouldRescaleOnRelayout_) {
    audion.entryPoints.resizeToFit_();
  }

  audion.entryPoints.removeLoadingScreen_();
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

  // Show the loading screen.
  audion.entryPoints.loadingScreen_.classList.add(goog.getCssName('shown'));

  // Throttle to every other frame.
  goog.global.requestAnimationFrame(function() {
    goog.global.requestAnimationFrame(audion.entryPoints.redraw_);
  });
};


/**
 * Handles a resize of the graph container.
 */
audion.entryPoints.handleResize_ = function() {
  audion.entryPoints.paper_.setDimensions(
      audion.entryPoints.pageSizeDetector_.offsetWidth,
      audion.entryPoints.pageSizeDetector_.offsetHeight);
  audion.entryPoints.panZoomObject_['resize']();
  audion.entryPoints.requestRedraw_();
};


/**
 * Resets the UI. Hides warning about missing audio updates. Resets panning and
 * zooming.
 * @private
 */
audion.entryPoints.resetUi_ = function() {
  // Keep resizing to fit as web audio updates come in. ... until the user
  // actively manipulates the view, in which case we do not want to override
  // the user's preference for a view.
  audion.entryPoints.shouldRescaleOnRelayout_ = true;
  audion.entryPoints.requestRedraw_();
};


/**
 * Accepts a message from the dev tools script.
 * {!AudionMessageFromFrame} message The message to receive.
 */
audion.entryPoints.acceptMessage_ = function(message) {
  if (audion.entryPoints.updatesAreMissing_) {
    // If updates are missing, ignore web audio updates. The user has to refresh
    // the page to use this tool. The messages below are web audio updates.
    switch (message.type) {
      case audion.messaging.MessageType.NODE_CREATED:
      case audion.messaging.MessageType.NODE_TO_NODE_CONNECTED:
      case audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED:
      case audion.messaging.MessageType.ALL_DISCONNECTED:
      case audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED:
      case audion.messaging.MessageType.NODE_FROM_PARAM_DISCONNECTED:
      case audion.messaging.MessageType.AUDIO_NODE_PROPERTIES_UPDATE:
        return;
    }
  }

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
 * @return {!Object} A JSON representation of the JointJS graph.
 */
audion.entryPoints.getGraphJsonRepresentation = function() {
  return /** @type {!Object} */ (audion.entryPoints.graph_.toJSON());
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

  // When the window resizes, resize the tool.
  window.addEventListener('resize', audion.entryPoints.handleResize_);

  // Let the user resize the graph to fit the whole graph.
  document.getElementById('resize-to-fit-button').addEventListener('click',
      function(event) {
    event.preventDefault();
    audion.entryPoints.resetUi_();
    return false;
  });

  // Add the pane and tooltip to the DOM. The tooltip can be atop the pane.
  var panelDom = document.getElementById('dev-tools-panel');
  panelDom.appendChild(audion.entryPoints.pane_.getDom());
  panelDom.appendChild(audion.entryPoints.tooltip_.getDom());
};


audion.entryPoints.panel();
