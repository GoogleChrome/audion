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
