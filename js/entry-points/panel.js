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
goog.provide('audion.entryPoints.panel');

goog.require('audion.messaging.MessageType');
goog.require('audion.messaging.Util');


/**
 * The last recorded graph to render if any.
 * @private {?dagre.graphlib.Graph}
 */
audion.entryPoints.lastRecordedVisualGraph_ = null;


/**
 * Handles what happens when we discover that dev tools is missing audio updates
 * from the main tab. We want to inform the user.
 * @private
 */
audion.entryPoints.handleMissingAudioUpdates_ = function() {};


/**
 * Requests a redraw of the visual graph.
 * @param {!dagre.graphlib.Graph} visualGraph
 * @private
 */
audion.entryPoints.requestRedraw_ = function(visualGraph) {};


/**
 * Resets the UI. Hides warning about missing audio updates. Resets panning and
 * zooming.
 * @param {!dagre.graphlib.Graph} visualGraph
 * @private
 */
audion.entryPoints.resetUi_ = function(visualGraph) {};


/**
 * The entry point for the script to run in our web audio Chrome dev panel -
 * the actual UI of the panel.
 */
audion.entryPoints.panel = function() {
  // Define some functions global to the panel window namespace so that the dev
  // tools script (which has complete access to the panel page window upon
  // creating the panel page) can directly call the functions to change the UI.
  goog.global['audionMissingAudioUpdates'] =
      audion.entryPoints.handleMissingAudioUpdates_;
  goog.global['requestRedraw'] = audion.entryPoints.requestRedraw_;
  goog.global['resetUi'] = audion.entryPoints.resetUi_;
};


audion.entryPoints.panel();
