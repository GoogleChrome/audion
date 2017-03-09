/**
 * @fileoverview Contains external variable declarations for JointJS.
 * @externs
 */

/**
 * Symbols from JointJS.
 */

var g = {};

/** @constructor */
g.point = function(x, y) {};

var V = {};
var joint = {};

/**
 * Matrix data in following format:
 *   [a c e]
 *   [b d f]
 *   [0 0 1]
 *
 * @typedef {{
 *   a: (number|undefined),
 *   b: (number|undefined),
 *   c: (number|undefined),
 *   d: (number|undefined),
 *   e: (number|undefined),
 *   f: (number|undefined),
 * }}
 */
var MatrixData;

/**
 * @param {!MatrixData=} opt_matrix Matrix data.
 * @return {!SVGMatrix}
 */
V.createSVGMatrix = function(opt_matrix) {};

/**
 * @param {!MatrixData=} opt_matrix Matrix data.
 * @return {boolean}
 */
V.isUndefined = function(opt_matrix) {};

/**
 * @param {!MatrixData=} opt_matrix Matrix data.
 * @return {string}
 */
V.matrixToTransformString = function(opt_matrix) {};

joint.dia = {};
joint.layout = {};
joint.shapes = {};
joint.shapes.devs = {};
joint.shapes.basic = {};

/**
 * @constructor
 * @extends {Backbone.Model}
 */
joint.dia.Cell = function() {};
/**
 * @type {string}
 */
joint.dia.Cell.prototype.id;
/**
 * @type {joint.dia.Graph}
 */
joint.dia.Cell.prototype.graph;
/**
 * @type {!Array<*>}
 */
joint.dia.Cell.prototype.ports;
joint.dia.Cell.prototype.isLink = function() {};
/**
 * @param {Object=} opt_options
 */
joint.dia.Cell.prototype.getEmbeddedCells = function(opt_options) {};
/**
 * @param {number} width
 * @param {number} height
 */
joint.dia.Cell.prototype.resize = function(width, height) {};
/**
 * @param {number} dx
 * @param {number} dy
 */
joint.dia.Cell.prototype.translate = function(dx, dy) {};
/**
 * @param {!joint.dia.Cell} cell
 */
joint.dia.Cell.prototype.embed = function(cell) {};
/**
 * @param {!joint.dia.Cell} cell
 */
joint.dia.Cell.prototype.isEmbeddedIn = function(cell) {};
/**
 * @param {!Object} options
 */
joint.dia.Cell.prototype.fitEmbeds = function(options) {};
joint.dia.Cell.prototype.getBBox = function() {};

/** @constructor */
joint.dia.CellView = function() {};
/**
 * @type {!joint.dia.Cell}
 */
joint.dia.CellView.prototype.model;
/**
 * @type {!VectorizedElement}
 */
joint.dia.CellView.prototype.el;
/**
 * @type {!VectorizedElement}
 */
joint.dia.CellView.prototype.sourceMagnet;
/**
 * @type {!VectorizedElement}
 */
joint.dia.CellView.prototype.targetMagnet;

/**
 * @constructor
 * @extends {joint.dia.Cell}
 */
joint.dia.Link = function() {};
/**
 * @param {!joint.dia.Graph} graph
 */
joint.dia.Link.prototype.addTo = function(graph) {};
joint.dia.Link.prototype.reparent = function() {};
joint.dia.Link.prototype.remove = function() {};

/**
 * @constructor
 * @extends {Backbone.View}
 * @param {!Object} attrs
 */
joint.dia.Paper = function(attrs) {};
/**
 * @type {!Object}
 */
joint.dia.Paper.prototype.options;
joint.dia.Paper.prototype.viewport;
/**
 * @type {!SVGSVGElement}
 */
joint.dia.Paper.prototype.svg;
/**
 * @type {!SVGElement}
 */
joint.dia.Paper.prototype.viewport;
/**
 * @type {!joint.dia.Graph}
 */
joint.dia.Paper.prototype.model;
/**
 * @param {string} event
 * @param {!Function} handler
 */
joint.dia.Paper.prototype.on = function(event, handler) {};
/**
 * @param {!joint.dia.Cell|string} model
 * @return {!joint.dia.CellView}
 */
joint.dia.Paper.prototype.findViewByModel = function(model) {};
/**
 * @param {number} width
 * @param {number} height
 */
joint.dia.Paper.prototype.setDimensions = function(width, height) {};
joint.dia.Paper.prototype.getContentBBox = function() {};
/**
 * @param {number} x
 * @param {number} y
 */
joint.dia.Paper.prototype.setOrigin = function(x, y) {};
/**
 * @param {number} sx
 * @param {number} sy
 * @param {number=} opt_x
 * @param {number=} opt_y
 */
joint.dia.Paper.prototype.scale = function(sx, sy, opt_x, opt_y) {};
/**
 * Removes a paper.
 */
joint.dia.Paper.prototype.remove = function() {};
/**
 * Renders a paper.
 */
joint.dia.Paper.prototype.render = function() {};
/**
 * Scales a paper's contents to fit.
 * @param {!Object=} opt_options
 */
joint.dia.Paper.prototype.scaleContentToFit = function(opt_options) {};

/** @constructor */
joint.dia.Graph = function() {};
joint.dia.Graph.prototype.clear = function() {};
/**
 * @param {!joint.dia.Cell} cell
 */
joint.dia.Graph.prototype.addCell = function(cell) {};
/**
 * @param {!Array<!joint.dia.Cell>} cells
 */
joint.dia.Graph.prototype.resetCells = function(cells) {};
/**
 * @param {!Array<!joint.dia.Cell>} cells
 */
joint.dia.Graph.prototype.cloneCells = function(cells) {};
/**
 * TODO(chizeng): Figure out the type of the elements.
 * @return {!Array<!Object>}
 */
joint.dia.Graph.prototype.getElements = function() {};
/**
 * @param {string} event
 * @param {!Function} handler
 */
joint.dia.Graph.prototype.on = function(event, handler) {};
/**
 * @param {(function(!Object):(!Object|boolean))|boolean} interactivity
 */
joint.dia.Paper.prototype.setInteractivity = function(interactivity) {};

joint.layout.DirectedGraph = {};

/**
 * @typedef {{
 *    x: number,
 *    y: number,
 *    width: number,
 *    height: number
 * }}
 */
joint.layout.DirectedGraph.LayoutSpecification;

/**
 * Lays out a graph.
 * @param {!joint.dia.Graph} graph
 * @param {!Object=} opt_options
 * @return {!joint.layout.DirectedGraph.LayoutSpecification}
 */
joint.layout.DirectedGraph.layout = function(graph, opt_options) {};


/**
 * @constructor
 * @param {!Object=} opt_options
 * @extends {joint.dia.CellView}
 */
joint.shapes.devs.Model = function(opt_options) {};
/**
 * @param {!joint.dia.Graph} graph
 */
joint.shapes.devs.Model.prototype.addTo = function(graph) {};


/**
 * @constructor
 * @extends {joint.dia.CellView}
 */
joint.shapes.devs.ModelView = function() {};

/**
 * @constructor
 * @extends {joint.dia.Link}
 * @param {!Object} attrs
 */
joint.shapes.devs.Link = function(attrs) {};

/**
 * @constructor
 * @extends {joint.dia.Cell}
 * @param {!Object} attrs
 */
joint.shapes.basic.Generic = function(attrs) {};
/**
 * @type {Object}
 */
joint.shapes.basic.Generic.prototype.defaults;

/**
 * @constructor
 * @extends {joint.dia.Cell}
 * @param {!Object} attrs
 */
joint.shapes.basic.Rect = function(attrs) {};
/**
 * @param {!joint.dia.Graph} graph
 */
joint.shapes.basic.Rect.prototype.addTo = function(graph) {};

/**
 * Symbols from Backbone.
 */
var Backbone = {};

/** @constructor */
Backbone.Model = function() {};

/**
 * @param {!Object} attrs Attributes of Backbone model.
 */
Backbone.Model.extend = function(attrs) {};
/**
 * @param {string} attr
 */
Backbone.Model.prototype.get = function(attr) {};
/**
 * @param {!Object|string} attr
 * @param {*=} opt_value
 * @param {*=} opt_options
 */
Backbone.Model.prototype.set = function(attr, opt_value, opt_options) {};
/**
 * @param {string} event
 * @param {!Function} handler
 */
Backbone.Model.prototype.on = function(event, handler) {};
/**
 * @param {!Object|string} attrs
 * @param {*=} opt_value
 */
Backbone.Model.prototype.attr = function(attrs, opt_value) {};
/**
 * @param {string} event
 * @param {*=} opt_arg1
 * @param {*=} opt_arg2
 * @param {*=} opt_arg3
 */
Backbone.Model.prototype.trigger = function(
    event, opt_arg1, opt_arg2, opt_arg3) {};

/** @constructor */
Backbone.View = function() {};
/**
 * @param {!Object} attrs
 */
Backbone.View.extend = function(attrs) {};

/**
 * @constructor
 * @extends {Element}
 */
var VectorizedElement = function() {};
/**
 * @param {string} className
 */
VectorizedElement.prototype.addClass = function(className) {};
/**
 * @param {string} selector
 */
VectorizedElement.prototype.querySelectorAll = function(selector) {};
/**
 * @param {string} selector
 * @returns {?VectorizedElement}
 */
VectorizedElement.prototype.querySelector = function(selector) {};
VectorizedElement.prototype.getBBox = function() {};

/**
 * Symbols from jquery.
 */
var $;

/**
 * Symbols from Underscore.
 */
var _;
