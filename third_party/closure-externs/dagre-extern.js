/**
 * @license
 * Copyright (c) 2012-2014 Chris Pettitt
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * @fileoverview This is a work in progress, a complete externs file is not
 * available publicly for dagre.js. This file will grow as people contribute the
 * externs they need.
 *
 * @externs
 */

/** @const Namespace. */
var dagre = function() {};

/**
 * @param {dagre.graphlib.Graph} g
 */
dagre.layout = function(g) {};


/** @const Namespace.*/
dagre.graphlib = function() {};

/**
 * @param {Object=} opt_cfg
 * @constructor
 */
dagre.graphlib.Graph = function(opt_cfg) {};


/**
 * @param {Object} cfg
 */
dagre.graphlib.Graph.prototype.setGraph = function(cfg) {};

/**
 * @param {function():Object} callback
 */
dagre.graphlib.Graph.prototype.setDefaultEdgeLabel = function(callback) {};

/**
 * @param {function():Object} callback
 */
dagre.graphlib.Graph.prototype.setDefaultNodeLabel = function(callback) {};

/**
 * @param {string} name
 * @param {Object=} opt_cfg
 */
dagre.graphlib.Graph.prototype.setNode = function(name, opt_cfg) {};

/**
 * @param {string} name
 * return {boolean}
 */
dagre.graphlib.Graph.prototype.hasNode = function(name) {};

/**
 * @param {string} name
 * return {!Object}
 */
dagre.graphlib.Graph.prototype.node = function(name) {};

/**
 * return {!Array}
 */
dagre.graphlib.Graph.prototype.nodes = function() {};

/**
 * @param {string} v
 * @param {string} w
 * @param {Object=} opt_cfg
 * @param {string=} opt_name
 */
dagre.graphlib.Graph.prototype.setEdge = function(v, w, opt_cfg, opt_name) {};


/**
 * @param {string} name
 * return {!Object}
 */
dagre.graphlib.Graph.prototype.edge = function(name) {};

/**
 * return {!Array}
 */
dagre.graphlib.Graph.prototype.edges = function() {};

/**
 * @param {string} child
 * @param {string} parent
 */
dagre.graphlib.Graph.prototype.setParent = function(child, parent) {};

/**
 * @param {string} name
 * return {string} parent
 */
dagre.graphlib.Graph.prototype.parent = function(name) {};

/**
 * return {!Object}
 */
dagre.graphlib.Graph.prototype.graph = function() {};
