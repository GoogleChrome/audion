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
audion.entryPoints.panelConnections_ = {};


/**
 * A list of IDs of tabs that received web audio updates. Used to determine
 * whether a dev tools instance for a tab might have missed audio graph updates.
 * @type {!Array.<number>}
 */
audion.entryPoints.tabsWithAudioUpdates_ = [];


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
  var tabId = '' + port.sender.tab.id;
  if (!audion.entryPoints.frameConnections_[tabId]) {
    audion.entryPoints.frameConnections_[tabId] = {};
  }
  // Give this frame a unique ID. Store it on the port itself.
  port.frameId = audion.entryPoints.nextAvailableId_++;
  var stringFrameId = '' + port.frameId;
  audion.entryPoints.frameConnections_[tabId][stringFrameId] = port;
  port.onDisconnect.addListener(function() {
    // TODO(chizeng): Consider making this function static to save memory.
    // Remove the connection once the page (frame) is closed.
    var tabFrameConnections = audion.entryPoints.frameConnections_[tabId];
    delete tabFrameConnections[stringFrameId];
    if (audion.entryPoints.isEmpty_(tabFrameConnections)) {
      // Connections for all frames from this tab have been closed.
      delete audion.entryPoints.frameConnections_[tabId];
    }
  });
};


/**
 * Handles a web audio update received from a frame.
 * @param {!AudionPortForFrameConnection} port The port connecting to the frame.
 * @param {!AudionMessage} message Contains the web audio update.
 */
audion.entryPoints.handleAudioUpdate_ = function(port, message) {
  // TODO. Issue a AudionMessageFromFrame to dev tools if dev tools is open.
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
 * Handles a new connection made with a dev panel script. The connection might
 * not actually be able to receive messages yet.
 * @param {!Port} port The port for the connection.
 */
audion.entryPoints.handleNewDevPanelConnection_ = function(port) {
  // TODO: Handle new dev tool instances opening.
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
        audion.entryPoints.handleNewDevPanelConnection_(port);
        break;
    }
  });
};


/**
 * The entry point for the background script, which coordinates the other
 * scripts. For instance, this script routes messages from the content script to
 * the dev panel script.
 */
audion.entryPoints.background = function() {
  audion.entryPoints.createOnConnectListeners_();
};


audion.entryPoints.background();
