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
