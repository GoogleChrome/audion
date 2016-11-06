goog.provide('audion.messaging.ConnectionType');


/**
 * Enumerates types of connections made between scripts throughout the
 * extension. A connection allows for the exchange of messages.
 * @enum {string}
 */
audion.messaging.ConnectionType = {
  // Between the content script run in a frame to the background script. This
  // connection allows the content script to pass web audio updates to the
  // background script (which routes to the rest of the extension).
  INIT_FRAME: 'init_frame',

  // Between a newly created instance of dev tools and the background script.
  // We audio updates are relayed to dev tools. Dev tools may pass messages to
  // the background script for say requesting more information from a frame.
  INIT_DEV_PANEL: 'init_dev_panel'
};
