goog.provide('audion.messaging.NodePropertyType');


/**
 * Enumerates types of properties of AudioNodes. These values are used within
 * AudionPropertyValuePair messages, which are routed to dev tools in order to
 * update the properties of nodes shown to the user.
 * Increment this value upon adding a new value - next available value: 5
 * @enum {number}
 */
audion.messaging.NodePropertyType = {
  AUDIO_PARAM: 1,
  READ_ONLY: 2,
  MUTABLE_NUMBER: 3,
  ENUM: 4
};
