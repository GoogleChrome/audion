goog.provide('audion.entryPoints.tabPageChanged');

goog.require('audion.messaging.MessageType');


/**
 * The entry point for the script that runs when a top-level page changes.
 * Informs other entities of this change.
 */
audion.entryPoints.tabPageChanged = function() {
  chrome.runtime.sendMessage(/** @type {!AudionMessage} */ (
      {type: audion.messaging.MessageType.PAGE_OF_TAB_CHANGED}));
};


audion.entryPoints.tabPageChanged();
