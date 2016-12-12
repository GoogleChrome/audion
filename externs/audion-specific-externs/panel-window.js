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
