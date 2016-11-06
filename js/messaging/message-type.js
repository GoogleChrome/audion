goog.provide('audion.messaging.MessageType');


/**
 * Enumerates types of messages sent throughout the extension. Stored in the
 * type field of AudionMessages. These are numbers to allow for fast comparison.
 * See messages-extern.js for the properties of various AudionMessage objects.
 * Increment this value upon adding a new value - next available value: 9
 * @enum {number}
 */
audion.messaging.MessageType = {
  // Issued by a port (extension script) to indicate that it is ready to receive
  // messages (ie, its listeners are set up).
  LISTENERS_READY: 1,

  CONTEXT_CREATED: 2,
  NODE_CREATED: 3,
  NODE_TO_NODE_CONNECTED: 4,
  NODE_TO_PARAM_CONNECTED: 5,
  ALL_DISCONNECTED: 6,
  NODE_FROM_NODE_DISCONNECTED: 7,
  NODE_FROM_PARAM_DISCONNECTED: 8
};
