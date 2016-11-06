goog.provide('audion.messaging.MessageType');


/**
 * Enumerates types of messages sent throughout the extension. Stored in the
 * type field of AudionMessages. These are numbers to allow for fast comparison.
 * See messages-extern.js for the properties of various AudionMessage objects.
 * Increment this value upon adding a new value - next available value: 8
 * @enum {number}
 */
audion.messaging.MessageType = {
  CONTEXT_CREATED: 1,
  NODE_CREATED: 2,
  NODE_TO_NODE_CONNECTED: 3,
  NODE_TO_PARAM_CONNECTED: 4,
  ALL_DISCONNECTED: 5,
  NODE_FROM_NODE_DISCONNECTED: 6,
  NODE_FROM_PARAM_DISCONNECTED: 7
};
