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
 * The element that contains all graph logic.
 * @private {!Element}
 */
audion.entryPoints.graphContainer_ = /** @type {!Element} */ (
    document.getElementById('graph'));


/**
 * The last recorded graph to render if any.
 * @private {?joint.dia.Graph}
 */
audion.entryPoints.lastRecordedVisualGraph_ = null;


/**
 * The paper on which to render the graph.
 * @private {?joint.dia.Paper}
 */
audion.entryPoints.paper_ = null;


/**
 * Creates a paper.
 * @param {!Element} graphContainer The DOM element that is the graph.
 * @param {?joint.dia.Graph} graph The graph to use.
 * @return {!joint.dia.Paper}
 * @private
 */
audion.entryPoints.createPaper_ = function(graphContainer, graph) {
  return new joint.dia.Paper({
    'el': graphContainer,
    'width': graphContainer.offsetWidth,
    'height': graphContainer.offsetHeight,
    'model': graph,
    'snapLinks': {
      'radius': Infinity,
    }
  });
};


/**
 * Handles what happens when we discover that dev tools is missing audio updates
 * from the main tab. We want to inform the user.
 * @private
 */
audion.entryPoints.handleMissingAudioUpdates_ = function() {};


/**
 * Requests a redraw of the visual graph.
 * @param {!joint.dia.Graph} visualGraph
 * @private
 */
audion.entryPoints.requestRedraw_ = function(visualGraph) {
  // TODO: Throttle to every other frame.
  // TODO: Resize the paper when the panel window resizes.
  if (audion.entryPoints.paper_) {
    return;
  }
  var innerGraph = document.createElement('div');
  innerGraph.id = 'innerGraph';
  audion.entryPoints.graphContainer_.appendChild(innerGraph);
  audion.entryPoints.paper_ = audion.entryPoints.createPaper_(
      innerGraph, visualGraph);
};


/**
 * Resets the UI. Hides warning about missing audio updates. Resets panning and
 * zooming.
 * @param {!joint.dia.Graph} visualGraph
 * @private
 */
audion.entryPoints.resetUi_ = function(visualGraph) {
  audion.entryPoints.lastRecordedVisualGraph_ = visualGraph;
  audion.entryPoints.requestRedraw_(visualGraph);
};


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
