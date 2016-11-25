goog.provide('audion.entryPoints.background');

goog.require('audion.messaging.ConnectionType');
goog.require('audion.messaging.MessageType');


/**
 * When we need a unique numeric ID in this script, we just increment this
 * integer and possibly convert it to a string. For instance, every frame needs
 * a unique ID. We just put all IDs in the same namespace.
 * @private {number}
 */
audion.entryPoints.nextAvailableId_ = 1;


/**
 * Maps a tab ID to a frame ID to a content script connection (for collecting
 * web audio information straight from the frame). The content scripts that
 * these ports connect to are all ready to receive messages.
 * @type {!Object.<string, !Object.<string, !Port>>}
 */
audion.entryPoints.frameConnections_ = {};


/**
 * Maps a tab ID to a connection to a panel (dev tools instance) connection. The
 * panel scripts that these ports connect to are all ready to receive messages.
 * @type {!Object.<string, !Port>}
 */
audion.entryPoints.devToolsScriptConnections_ = {};


/**
 * Keys for this object comprise a set of IDs of tabs that received web audio
 * updates. Used to determine whether a dev tools instance for a tab might have
 * missed audio graph updates. The values in this object are all 1.
 * @type {!Object.<string, number>}
 */
audion.entryPoints.tabsWithAudioUpdates_ = {};


/**
 * Determines if an object is empty. We could use goog.object, that pulls in too
 * much code. :/
 * @param {!Object} obj The object.
 * @return {boolean} Whether the object is empty.
 */
audion.entryPoints.isEmpty_ = function(obj) {
  return Object.keys(obj).length == 0;
}


/**
 * Handles what happens when the content script for a frame issues a message
 * indicating that it is ready to receive messages. We store a reference to the
 * port for that connection.
 * @param {!AudionPortForFrameConnection} port The port for the connection.
 */
audion.entryPoints.handleNewFrameListenersReady_ = function(port) {
  var tabId = port.sender.tab.id;
  var tabIdString = '' + tabId;
  if (!audion.entryPoints.frameConnections_[tabIdString]) {
    audion.entryPoints.frameConnections_[tabIdString] = {};
  }
  // Give this frame a unique ID. Store it on the port itself.
  port.frameId = audion.entryPoints.nextAvailableId_++;
  var stringFrameId = '' + port.frameId;
  audion.entryPoints.frameConnections_[tabIdString][stringFrameId] = port;
  port.onDisconnect.addListener(function() {
    // TODO(chizeng): Consider making this function static to save memory.
    // Remove the connection once the page (frame) is closed.
    var tabFrameConnections = audion.entryPoints.frameConnections_[tabIdString];
    delete tabFrameConnections[stringFrameId];
    if (audion.entryPoints.isEmpty_(tabFrameConnections)) {
      // Connections for all frames from this tab have been closed.
      delete audion.entryPoints.frameConnections_[tabIdString];

      // The user has closed the tab. There's no longer a need to remember that
      // the tab has evinced web audio updates.
      delete audion.entryPoints.tabsWithAudioUpdates_[tabIdString];
    }
  });
};


/**
 * Handles a web audio update received from a frame.
 * @param {!AudionPortForFrameConnection} port The port connecting to the frame.
 * @param {!AudionMessage} message Contains the web audio update.
 */
audion.entryPoints.handleAudioUpdate_ = function(port, message) {
  // Note that this tab has experienced a web audio update.
  var tabId = port.sender.tab.id;
  var tabIdString = '' + tabId;
  audion.entryPoints.tabsWithAudioUpdates_[tabIdString] = 1;

  // TODO. Issue a AudionMessageFromFrame to dev tools if dev tools is open.

  // Relay the web audio update to the dev tools script.
  var devToolsPort = audion.entryPoints.devToolsScriptConnections_[tabIdString];
  if (devToolsPort) {
    // Tell dev tools which frame this message came from and pass it the
    // message.
    message = /** @type {!AudionMessageFromFrame} */ (message);
    message.frameId = devToolsPort.frameId;
    devToolsPort.postMessage(message);
  }
};


/**
 * Handles a new connection made with the content script of a frame. The
 * connection might not actually be able to receive messages yet.
 * @param {!AudionPortForFrameConnection} port The port for the connection.
 */
audion.entryPoints.handleNewFrameConnection_ = function(port) {
  var tab = port.sender.tab;
  if (!tab || !tab.id) {
    // We know not what tab this connection is coming from. It is degenerate.
    return;
  }

  // Listen to messages from the content script for the frame.
  port.onMessage.addListener(function(message) {
    message = /** @type {!AudionMessage} */ (message);
    switch (message.type) {
      case audion.messaging.MessageType.LISTENERS_READY:
        audion.entryPoints.handleNewFrameListenersReady_(port);
        break;
      default:
        // By default, assume that this is an audio update from the frame.
        audion.entryPoints.handleAudioUpdate_(port, message);
        break;
    }
  });
};


/**
 * Handles when a dev tools script is ready to receive messages.
 * @param {!Port} port The port for the connection.
 * @param {!AudionListenersReadyFromDevToolsScriptMessage} message
 */
audion.entryPoints.handleNewDevToolsListenersReady_ = function(port, message) {
  // TODO(chizeng): Determine what it means for the tab ID to be -1. It
  // sometimes is.
  var tabId = message.inspectedTabId;
  if (!(tabId >= 0)) {
    // This condition also filters for undefineds.
    // We do not know which tab we are inspecting. This might be degenerate.
    return;
  }

  // Silly Closure requires keys to be strings ...
  var tabIdString = '' + tabId;

  // Store a reference to the dev tools script connection so that we can relay
  // messages to it from the frame later. 
  audion.entryPoints.devToolsScriptConnections_[tabIdString] = port;
  port.onDisconnect.addListener(function() {
    // Remove the connection once the page is closed.
    delete audion.entryPoints.devToolsScriptConnections_[tabIdString];
  });

  // If the tab has received web audio updates, tell the dev tools instance that
  // it is missing prior web audio updates.
  if (audion.entryPoints.tabsWithAudioUpdates_[tabIdString]) {
    port.postMessage(/** @type {!AudionMessage} */ ({
      type: audion.messaging.MessageType.MISSING_AUDIO_UPDATES
    }));
  }
};


/**
 * Handles a new connection made with a dev panel script. The connection might
 * not actually be able to receive messages yet.
 * @param {!Port} port The port for the connection.
 */
audion.entryPoints.handleNewDevToolsConnection_ = function(port) {
  var tab = port.sender.tab;
  if (!tab || !tab.id) {
    // We know not what tab this connection is coming from. It is degenerate.
    return;
  }

  // Listen to messages from the content script for the frame.
  port.onMessage.addListener(function(message) {
    message = /** @type {!AudionMessage} */ (message);
    switch (message.type) {
      case audion.messaging.MessageType.LISTENERS_READY:
        message = /** @type {!AudionListenersReadyFromDevToolsScriptMessage} */(
            message);
        audion.entryPoints.handleNewDevToolsListenersReady_(port, message);
        break;
    }
  });
};


/**
 * Creates listeners for connections by other scripts.
 * @private
 */
audion.entryPoints.createOnConnectListeners_ = function() {
  // Handle connections to the background on case-by-case basis. A connection
  // allows for future exchange of data.
  chrome.runtime.onConnect.addListener(function(port) {
    // Each connection to the background script has a unique port name
    // designating its general purpose.
    var portName = port.name;

    switch (portName) {
      case audion.messaging.ConnectionType.INIT_FRAME:
        // A new frame has initialized in some tab.
        port = /** @type {!AudionPortForFrameConnection} */ (port);
        audion.entryPoints.handleNewFrameConnection_(port);
        break;
      case audion.messaging.ConnectionType.INIT_DEV_PANEL:
        // A dev panel has opened for some tab.
        audion.entryPoints.handleNewDevToolsConnection_(port);
        break;
    }
  });
};


/**
 * Handles an individual message (not related to any connection) received by the
 * background script. See {@code listenToIndividualMessages_}.
 * @param {*} message
 * @param {!MessageSender} sender
 * @private
 */
audion.entryPoints.handleIndividualMessage_ = function(message, sender) {
  message = /** @type {!AudionMessage} message */ (message);
  if (!sender.tab || !sender.tab.id) {
    // The sender lacks a tab. Hmm, seems degenerate.
    return;
  }
  var tabId = sender.tab.id;
  var tabIdString = '' + tabId;
  switch(message.type) {
    case audion.messaging.MessageType.PAGE_OF_TAB_CHANGED:
      // The page reset in the tab. No web audio updates so far.
      delete audion.entryPoints.tabsWithAudioUpdates_[tabIdString];

      var devToolsPort =
          audion.entryPoints.devToolsScriptConnections_[tabIdString];
      if (devToolsPort) {
        // Tell the panel that the top-level page for the tab has changed.
        devToolsPort.postMessage(message);
      }
      break;
  }
};


/**
 * Listen to individual messages from scripts. A script might send an individual
 * message without making a connection out of convenience (perhaps it does not
 * need a 2-way connection).
 * @private
 */
audion.entryPoints.listenToIndividualMessages_ = function() {
  chrome.runtime.onMessage.addListener(
      audion.entryPoints.handleIndividualMessage_);
};


/**
 * The entry point for the background script, which coordinates the other
 * scripts. For instance, this script routes messages from the content script to
 * the dev panel script.
 */
audion.entryPoints.background = function() {
  audion.entryPoints.createOnConnectListeners_();
  audion.entryPoints.listenToIndividualMessages_();
};


audion.entryPoints.background();
