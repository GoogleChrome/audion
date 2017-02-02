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
 * @fileoverview An extern for data stored in the dagre graph that is shown in
 * the panel created by the dev tools script.
 *
 * @externs
 */


/**
 * A record that contains information on a visual node or edge in the panel that
 * is created by the dev tools script.
 *   * underlyingType is a numeric enum value denoting what the visual node
 *     represents, ie an AudioNode, an AudioParam, a channel, etc.
 *   * width refers to the width of an edge.
 * @typedef {{
 *   underlyingType: number,
 *   labelType: string,
 *   label: string,
 *   style: ?string,
 *   arrowheadStyle: ?string,
 *   labelStyle: ?string,
 *   rx: number,
 *   ry: number,
 *   audioNodeId: number,
 *   sourceAudioNodeId: ?number,
 *   destinationAudioNodeId: ?number,
 *   audioParamName: ?string,
 *   frameId: number,
 *   arrowheadClass: ?string,
 *   class: ?string,
 *   lineInterpolate: string,
 *   width: ?number,
 *   inputChannel: ?number,
 *   outputChannel: ?number,
 *   sourceVisualNodeId: ?string,
 *   destinationVisualNodeId: ?string
 * }}
 */
var AudionVisualGraphData;
