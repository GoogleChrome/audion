/**
 * @fileoverview An extern for messages passed around the extension. The
 * properties of these messages must be consistent across compiled binaries, so
 * we require an extern.
 *
 * @externs
 */


/**
 * A base record type for a message sent across scripts throughout this
 * extension.
 * @typedef {{
 *   type: number,
 * }}
 */
var AudionMessage;


/**
 * A base record type for a message sent from the page being traced to the
 * content script. This message has an additional tag property with the value
 * audion.entryPoints.ExtensionTag. Only tagged messages are relevant to this
 * extension.
 * @typedef {{
 *   type: number,
 *   tag: number
 * }}
 */
var AudionTaggedMessage;


/**
 * A base record for a message that came from a certain frame. The dev panel
 * needs to know which frame a message came from.
 * @typedef {{
 *   type: number,
 *   frameId: number
 * }}
 */
var AudionMessageFromFrame;


/**
 * Indicates that a script is ready to receive messages. The type of this
 * message is audion.messaging.MessageType.LISTENERS_READY.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number
 * }}
 */
var AudionListenersReadyMessage;


/**
 * Indicates that a dev tools script is ready to receive messages. The type of
 * this message is audion.messaging.MessageType.LISTENERS_READY. This message
 * has an additional field for the inspected tab ID. Chrome does not add that
 * natively to the message, so we must reserve a field for it in the message.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   inspectedTabId: number
 * }}
 */
var AudionListenersReadyFromDevToolsScriptMessage;


/**
 * Indicates that an AudioContext had been created. The type of this message is
 * audion.messaging.MessageType.CONTEXT_CREATED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   contextId: number
 * }}
 */
var AudionContextCreatedMessage;


/**
 * Indicates that an AudioNode had been created. The type of this message is
 * audion.messaging.MessageType.NODE_CREATED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   nodeId: number,
 *   nodeType: string
 * }}
 */
var AudionNodeCreatedMessage;


/**
 * Indicates that a node had connected to another node (and not an AudioParam).
 * The type of this message is
 * audion.messaging.MessageType.NODE_TO_NODE_CONNECTED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   sourceNodeId: number,
 *   destinationNodeId: number
 * }}
 */
var AudionNodeToNodeConnectedMessage;


/**
 * Indicates that a node had connected to an AudioParam. For instance, an
 * oscillator may be regulating a Gain param. The type of this message is
 * audion.messaging.MessageType.NODE_TO_PARAM_CONNECTED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   sourceNodeId: number,
 *   destinationNodeId: number,
 *   destinationParamName: string
 * }}
 */
var AudionNodeToParamConnectedMessage;


/**
 * Indicates that a node had disconnected from everything. The type of this
 * message is audion.messaging.MessageType.ALL_DISCONNECTED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   nodeId: number
 * }}
 */
var AudionAllDisconnectedMessage;


/**
 * Indicates that a node had disconnected from another node (not an AudioParam).
 * The type of this message is
 * audion.messaging.MessageType.NODE_FROM_NODE_DISCONNECTED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   sourceNodeId: number,
 *   disconnectedFromNodeId: number
 * }}
 */
var AudionNodeFromNodeDisconnectedMessage;


/**
 * Indicates that a node had disconnected from an AudioParam.
 * The type of this message is
 * audion.messaging.MessageType.NODE_FROM_PARAM_DISCONNECTED.
 * @typedef {{
 *   type: number,
 *   tag: ?number,
 *   frameId: ?number,
 *   sourceNodeId: number,
 *   disconnectedFromNodeId: number,
 *   audioParamName: string
 * }}
 */
var AudionNodeFromParamDisconnectedMessage;
