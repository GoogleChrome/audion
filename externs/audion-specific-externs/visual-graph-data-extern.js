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
 *   width: ?number
 * }}
 */
var AudionVisualGraphData;
