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
