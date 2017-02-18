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
 * The paper on which to render the graph.
 * @private {?joint.dia.Paper}
 */
audion.entryPoints.paper_ = null;


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
    }
  });
};


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
  return audion.entryPoints.computeNodeGraphId_(frameId, nodeId) + 'param' + name;
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
 * Handles the creation of an AudioNode (that might not be part of a graph yet).
 * @param {!AudionNodeCreatedMessage} message
 * @private
 */
audion.entryPoints.handleNodeCreated_ = function(message) {
  var frameId = /** @type {number} */ (message.frameId);
  var nodeLabel = message.nodeType + ' ' + message.nodeId;

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
  new joint.shapes.basic.Rect({
    'id': audion.entryPoints.computeNodeGraphId_(frameId, message.nodeId), 
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
              'position': 'left',
              'label': null,
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
              'position': 'bottom',
              'label': null,
          }
      },
      'items': ports
    },
    'attrs': {
        'text': {
          'text': nodeLabel
        },
        '.inPorts circle': {'fill': '#16A085'},
        '.outPorts circle': {'fill': '#E74C3C'},
        '.paramPorts circle': {'fill': '#90CAF9'}
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
  var linkObject = new joint.shapes.devs.Link({
      'id': audion.entryPoints.computeEdgeLabel_(
          sourcePortLabel, destinationPortLabel),
      'source': source,
      'target': target,
      'router': {name: 'metro'},
      'connector': {name: 'rounded'}
  }).addTo(audion.entryPoints.graph_);
  linkObject.attr({'.marker-target': {'d': 'M 10 0 L 0 5 L 10 10 z'}});
  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode connects with another AudioNode.
 * @param {!AudionNodeToNodeConnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeToNodeConnected_ = function(message) {
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
  var frameId = /** @type {number} */ (message.frameId);
  audion.entryPoints.addLink_(
      audion.entryPoints.computeNodeGraphId_(frameId, message.sourceNodeId),
      audion.entryPoints.outPortLabel_(
          frameId, message.sourceNodeId, message.fromChannel),
      audion.entryPoints.computeNodeGraphId_(frameId, message.destinationNodeId),
      audion.entryPoints.audioParamPortLabel_(
          frameId, message.destinationNodeId, message.destinationParamName));
};


/**
 * Handles when an AudioNode disconnects from an AudioNode.
 * @param {!AudionNodeFromNodeDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromNodeDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode disconnects from everything.
 * @param {!AudionAllDisconnectedMessage} message
 */
audion.entryPoints.handleAllDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioParam.
 * @param {!AudionNodeFromParamDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromParamDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestRedraw_();
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
 * Redraws the graph. Maybe expensive.
 * @private
 */
audion.entryPoints.redraw_ = function() {
  // Indicate that subsequent changes will need a new redraw.
  audion.entryPoints.isRedrawPending_ = false;

  // Create the paper if we have not done so.
  if (!audion.entryPoints.paper_) {
    audion.entryPoints.paper_ = audion.entryPoints.createPaper_(
        audion.entryPoints.graphContainer_, audion.entryPoints.graph_);
  }

  joint.layout.DirectedGraph.layout(audion.entryPoints.graph_, {
      'rankDir': 'LR',
      'setLinkVertices': false
    });

  // TODO: Find out if this call is necessary.
  audion.entryPoints.paper_.render();
};


/**
 * Requests a redraw of the visual graph.
 * @private
 */
audion.entryPoints.requestRedraw_ = function() {
  // TODO: Resize the paper when the panel window resizes.

  // Indicate that a redraw is pending.
  audion.entryPoints.isRedrawPending_ = true;

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
};


audion.entryPoints.panel();
