/**
 * @fileoverview Utility methods related to sending messages.
 */

goog.provide('audion.messaging.Util');


/**
 * Issues a message to the window.
 * @param {!AudionMessage} message
 * @param {!Window=} opt_window The window to post to. Defaults to current one.
 */
audion.messaging.Util.postMessageToWindow = function(message, opt_window) {
  var w = (opt_window || window);
  w.postMessage(message, w.location.origin || '*');
};
