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
goog.provide('audion.render.VisualGraphType');


/**
 * The visual graph refers to the graph displayed in the panel created by dev
 * tools. Nodes and edges in that graph carry data (on AudioNodes, web audio
 * graph edges, etc). This enumerates the different types of data.
 * Increment the following value upon adding a new entry:
 * Next available ID: 9
 * @enum {number}
 */
audion.render.VisualGraphType = {
  AUDIO_NODE: 1,
  AUDIO_PARAM_NODE: 2,
  CHANNEL: 3,
  INPUT_TO_NODE_EDGE: 4,
  NODE_TO_NODE_EDGE: 5,
  NODE_TO_OUTPUT_EDGE: 6,
  AUDIO_PARAM_TO_NODE_EDGE: 7,
  NODE_TO_AUDIO_PARAM_EDGE: 8
};
