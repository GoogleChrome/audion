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
/**
 * @fileoverview An extern for a modified subclass of the Port class that is
 * able to store a frame ID property. The background script needs to know which
 * frame issued a message (for a web audio update).
 *
 * @externs
 */


/**
 * @constructor
 * @extends {Port}
 */
function AudionPortForFrameConnection() {}

/**
 * The ID of the frame that issued the connection to the background script.
 * @type {number|undefined}
 */
AudionPortForFrameConnection.prototype.frameId;
