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
 * @return {!joint.dia.Graph}
 * @private
 */
audion.entryPoints.createEmptyAudioGraph_ = function() {
  return new joint.dia.Graph();
};


/**
 * The audio node graph.
 * @private {!joint.dia.Graph}
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
 * Handles a request by the user to inspect a node.
 * @param {!AudionNodeHighlightedMessage} message
 * @private
 */
audion.entryPoints.handleNewAudioNodeHighlightedRequest_ = function(message) {
  // TODO: Tell the web page to send back info on this audio node.
};


/**
 * Handles a request by the user to stop inspecting a node.
 * @param {!AudionNodeUnhighlightedMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodeUnhighlightedRequest_ = function(message) {
  // TODO: Tell the web page to stop sending back info on this audio node.
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
 * Computes the label for a node.
 * @param {number} frameId
 * @param {number} nodeId
 * @private
 */
audion.entryPoints.computeNodeLabel_ = function(frameId, nodeId) {
  return 'f' + frameId + 'n' + nodeId;
};


/**
 * Computes the label for an input port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {number} portIndex
 * @private
 */
audion.entryPoints.inPortLabel_ = function(frameId, nodeId, portIndex) {
  return audion.entryPoints.computeNodeLabel_(frameId, nodeId) +
      'input' + portIndex;
};


/**
 * Computes the label for an output port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {number} portIndex
 * @private
 */
audion.entryPoints.outPortLabel_ = function(frameId, nodeId, portIndex) {
  return audion.entryPoints.computeNodeLabel_(frameId, nodeId) +
      'output' + portIndex;
};


/**
 * Computes the label for an AudioParam port.
 * @param {number} frameId
 * @param {number} nodeId
 * @param {string} name The name of the AudioParam.
 * @private
 */
audion.entryPoints.audioParamPortLabel_ = function(frameId, nodeId, name) {
  return audion.entryPoints.computeNodeLabel_(frameId, nodeId) + 'param' + name;
};


/**
 * Handles the creation of an AudioNode (that might not be part of a graph yet).
 * @param {!AudionNodeCreatedMessage} message
 * @private
 */
audion.entryPoints.handleNodeCreated_ = function(message) {
  var frameId = /** @type {number} */ (message.frameId);
  var nodeId = audion.entryPoints.computeNodeLabel_(frameId, message.nodeId);
  var nodeLabel = message.nodeType + ' ' + message.nodeId;

  // Create labels for in ports.
  var inPorts = [];
  for (var i = 0; i < message.numberOfInputs; i++) {
    inPorts.push(audion.entryPoints.inPortLabel_(frameId, message.nodeId, i));
  }

  // Create labels for out ports.
  var outPorts = [];
  for (var i = 0; i < message.numberOfOutputs; i++) {
    outPorts.push(audion.entryPoints.outPortLabel_(frameId, message.nodeId, i));
  }

  // Create labels for AudioParam ports.
  var paramPorts = [];
  for (var i = 0; i < message.audioParamNames.length; i++) {
    paramPorts.push(
      audion.entryPoints.audioParamPortLabel_(
          frameId,
          message.nodeId,
          message.audioParamNames[i]));
  }

  // Create a node.
  new joint.shapes.devs.Model({
    'inPorts': inPorts,
    'outPorts': outPorts,
    'paramPorts': paramPorts,
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
                        'fill': '#00ff00',
                        'stroke': '#000000',
                        'magnet': 'passive'
                      }
              },
              'position': 'bottom',
              'label': null,
          }
      },
    },
    'attrs': {
        '.label': { 'text': nodeLabel, 'ref-x': .4, 'ref-y': .2 },
        '.inPorts circle': {'fill': '#16A085'},
        '.outPorts circle': {'fill': '#E74C3C'}
    }
  }).addTo(audion.entryPoints.visualGraph_);
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode connects with another AudioNode.
 * @param {!AudionNodeToNodeConnectedMessage} message
 * @private
 */
audion.entryPoints.handleNodeToNodeConnected_ = function(message) {
  // TODO
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
  // TODO
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioNode.
 * @param {!AudionNodeFromNodeDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromNodeDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from everything.
 * @param {!AudionAllDisconnectedMessage} message
 */
audion.entryPoints.handleAllDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles when an AudioNode disconnects from an AudioParam.
 * @param {!AudionNodeFromParamDisconnectedMessage} message
 */
audion.entryPoints.handleNodeFromParamDisconnected_ = function(message) {
  // TODO
  audion.entryPoints.requestPanelRedraw_();
};


/**
 * Handles a message from the background script that contains information on a
 * node being inspected.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodePropertiesUpdate_ = function(message) {
  // TODO
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
