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
 * The queue for messages that will be sent to the panel window once the panel
 * window opens for the first time.
 * @private {!Array.<!AudionMessageFromFrame>}
 */
audion.entryPoints.messageQueue_ = [];


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
 * Connects with the background page so that it can relay web audio updates to
 * this panel. Make sure to keep the keys strings to prevent obfuscation.
 * @private {!Port}
 */
audion.entryPoints.backgroundPageConnection_ = chrome.runtime.connect({
  'name': audion.messaging.ConnectionType.INIT_DEV_PANEL
});


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
  // Tell the content script to issue data on the new node.
  audion.entryPoints.postToBackgroundScript_(
      /** @type {!AudionNodeHighlightedMessage} */ ({
    type: audion.messaging.MessageType.AUDIO_NODE_HIGHLIGHTED,
    frameId: message.frameId,
    audioNodeId: message.audioNodeId,
    inspectedTabId: chrome.devtools.inspectedWindow.tabId
  }));
};


/**
 * Handles a request by the user to stop inspecting a node.
 * @param {!AudionNodeUnhighlightedMessage} message
 * @private
 */
audion.entryPoints.handleAudioNodeUnhighlightedRequest_ = function(message) {
  // Notify the content script so that it stops sending info on the node.
  audion.entryPoints.postToBackgroundScript_(
      /** @type {!AudionNodeUnhighlightedMessage} */ ({
    type: audion.messaging.MessageType.AUDIO_NODE_UNHIGHLIGHTED,
    frameId: message.frameId,
    audioNodeId: message.audioNodeId,
    inspectedTabId: chrome.devtools.inspectedWindow.tabId
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
  // Route all messages that were awaiting the panel window to open for the
  // first time. This might flood the panel window with messages.
  while (audion.entryPoints.messageQueue_.length) {
    panelWindow.acceptMessage(audion.entryPoints.messageQueue_[0]);
    audion.entryPoints.messageQueue_ =
        audion.entryPoints.messageQueue_.slice(1);
  }

  audion.entryPoints.panelWindow_ = panelWindow;

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
 * Handles a message from the background script.
 * @param {!AudionMessageFromFrame} message
 * @private
 */
audion.entryPoints.handleMessageFromBackground_ = function(message) {
  if (audion.entryPoints.panelWindow_) {
    // The panel window has been created. Route this message to it.
    audion.entryPoints.panelWindow_.acceptMessage(message);
  } else {
    // The panel window has not opened yet. Wait til it opens before routing.
    audion.entryPoints.messageQueue_.push(message);
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
