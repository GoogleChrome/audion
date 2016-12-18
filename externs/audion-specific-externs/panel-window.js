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
 * @fileoverview An extern for a modified subclass of Window that includes
 * additional methods that the panel page window (within dev tools) has.
 *
 * @externs
 */


/**
 * @constructor
 * @extends {Window}
 */
function AudionPanelWindow() {};


/**
 * Handles missing audio updates.
 */
AudionPanelWindow.prototype.audionMissingAudioUpdates = function() {};


/**
 * Requests the panel to redraw the UI after say a web audio update.
 * {!dagreD3.graphlib.Graph} visualGraph The graph to render.
 */
AudionPanelWindow.prototype.requestRedraw = function(visualGraph) {};


/**
 * Requests the panel to reset its UI.
 * {!dagreD3.graphlib.Graph} visualGraph The graph to render initially.
 */
AudionPanelWindow.prototype.resetUi = function(visualGraph) {};


/**
 * Makes the panel UI heed an AudioNode property update.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message
 */
AudionPanelWindow.prototype.noteAudioNodePropertyUpdate = function(message) {};
