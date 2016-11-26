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
 * Connects with the background page so that it can relay web audio updates to
 * this panel.
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
  // TODO(chizeng): Use a switch statement instead.
  if (audion.entryPoints.panelWindow_) {
    var blurb = audion.entryPoints.panelWindow_.document.createElement('div');
    blurb.innerHTML = JSON.stringify(message);
    audion.entryPoints.panelWindow_.document.body.appendChild(blurb);
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
