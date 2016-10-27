/**
 * @fileoverview An incomplete extern for dagre d3.
 * 
 * @externs
 */



/** @constructor. */
var dagreD3 = function() {};


/**
 * @param {!dagreD3.graphlib.Graph} g
 */
dagreD3.layout = function(g) {};


/** @const Namespace.*/
dagreD3.graphlib = function() {};


/**
 * @param {Object=} opt_cfg
 * @constructor
 */
dagreD3.graphlib.Graph = function(opt_cfg) {};


/**
 * @param {Object} cfg
 */
dagreD3.graphlib.Graph.prototype.setGraph = function(cfg) {};


/**
 * @param {function():Object} callback
 */
dagreD3.graphlib.Graph.prototype.setDefaultEdgeLabel = function(callback) {};


/**
 * @param {function():Object} callback
 */
dagreD3.graphlib.Graph.prototype.setDefaultNodeLabel = function(callback) {};


/**
 * @param {string} name
 * @param {Object=} opt_cfg
 */
dagreD3.graphlib.Graph.prototype.setNode = function(name, opt_cfg) {};


/**
 * @param {string} name
 * return {boolean}
 */
dagreD3.graphlib.Graph.prototype.hasNode = function(name) {};


/**
 * @param {string} name
 * return {!Object}
 */
dagreD3.graphlib.Graph.prototype.node = function(name) {};


/**
 * return {!Array}
 */
dagreD3.graphlib.Graph.prototype.nodes = function() {};


/**
 * @param {!Object|string} w
 * @return {?string} The parent of w or undefined.
 */
dagreD3.graphlib.Graph.prototype.getParent = function(w) {};


/**
 * @param {string} v
 * @param {string} w
 * @param {Object=} opt_cfg
 */
dagreD3.graphlib.Graph.prototype.setEdge = function(v, w, opt_cfg) {};


/**
 * @param {string|!Object} v Either the source node or an edge object.
 * @param {string=} opt_w
 * @param {string=} opt_name
 */
dagreD3.graphlib.Graph.prototype.removeEdge = function(v, opt_w, opt_name) {};


/**
 * @param {string} name
 * return {!Object}
 */
dagreD3.graphlib.Graph.prototype.edge = function(name) {};


/**
 * return {!Array}
 */
dagreD3.graphlib.Graph.prototype.edges = function() {};


/**
 * @param {!Object} edgeObject
 * @param {string=} opt_w
 */
dagreD3.graphlib.Graph.prototype.inEdges = function(edgeObject, opt_w) {};


/**
 * @param {string} child
 * @param {string=} opt_parent If undefined, removes the parent.
 */
dagreD3.graphlib.Graph.prototype.setParent = function(child, opt_parent) {};


/**
 * @param {string} name
 * return {string} parent
 */
dagreD3.graphlib.Graph.prototype.parent = function(name) {};


/**
 * return {!Object}
 */
dagreD3.graphlib.Graph.prototype.graph = function() {};
