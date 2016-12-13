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
goog.provide('audion.messaging.MessageType');


/**
 * Enumerates types of messages sent throughout the extension. Stored in the
 * type field of AudionMessages. These are numbers to allow for fast comparison.
 * See messages-extern.js for the properties of various AudionMessage objects.
 * Increment this value upon adding a new value - next available value: 14
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
  NODE_FROM_PARAM_DISCONNECTED: 8,

  MISSING_AUDIO_UPDATES: 9,
  PAGE_OF_TAB_CHANGED: 10,

  // The panel notifies dev tools when the user highlights (wants to inspect) an
  // AudioNode. Our dev tools script tells the correct frame content script (via
  // the background script) to continuously send back information on the node
  // until the node is no longer highlighted.
  AUDIO_NODE_HIGHLIGHTED: 11,
  AUDIO_NODE_UNHIGHLIGHTED: 12,
  AUDIO_NODE_PROPERTIES_UPDATE: 13
};
