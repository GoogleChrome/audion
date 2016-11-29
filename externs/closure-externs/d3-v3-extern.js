/**
 * @fileoverview An extern for d3 v3. This extern may be incomplete.
 * 
 * @externs
 */


/**
 * @typedef {?function(?)}
 */
d3.scaleType;

/**
 * Re-open the scaleType type definition so we can define properties
 * on it.
 *
 * @type {d3.scaleType}
 */
d3.scaleType_;
d3.scaleType_.prototype.clamp;
d3.scaleType_.prototype.copy;
d3.scaleType_.prototype.domain;
d3.scaleType_.prototype.orient;
d3.scaleType_.prototype.invert;
d3.scaleType_.prototype.invertExtent;
d3.scaleType_.prototype.nice;
d3.scaleType_.prototype.quantiles;
d3.scaleType_.prototype.range;
d3.scaleType_.prototype.rangeBand;
d3.scaleType_.prototype.rangeBands;
d3.scaleType_.prototype.rangeBounds;
d3.scaleType_.prototype.rangePoints;
d3.scaleType_.prototype.rangeRound;
d3.scaleType_.prototype.rangeRoundBands;
d3.scaleType_.prototype.scale;
d3.scaleType_.prototype.ticks;

/**
 * @typedef {function(this:Node, ?, number): number}
 */
d3.arcType;
d3.arcType.prototype.centroid;
d3.arcType.prototype.cornerRadius;
d3.arcType.prototype.endAngle;
d3.arcType.prototype.innerRadius;
d3.arcType.prototype.outerRadius;
d3.arcType.prototype.padAngle;
d3.arcType.prototype.padRadius;
d3.arcType.prototype.startAngle;

/**
 * @constructor
 */
d3.axisType = function() {};
d3.axisType.prototype.innerTickSize;
d3.axisType.prototype.orient;
d3.axisType.prototype.outerTickSize;
d3.axisType.prototype.scale;
d3.axisType.prototype.tickFormat;
d3.axisType.prototype.tickPadding;
d3.axisType.prototype.tickSize;
d3.axisType.prototype.tickSubdivide;
d3.axisType.prototype.tickValues;
d3.axisType.prototype.ticks;


/**
 * @see https://github.com/mbostock/d3/wiki/Selections
 * @return {!d3.selection}
 * @constructor
 * @extends {Array}
 */
d3.selection = function() {};
/**
 * @param {(string|function(this:Node, ?, number):!Node)} name
 * @return {!d3.selection}
 */
d3.selection.prototype.append = function(name) {};
/**
 * @param {!(string|Object.<string, ?(undefined|string|number)>)} nameOrMap
 * @param {?(undefined|string|number|
 *     function(this:Node, ?, number): ?(undefined|string|number))=} opt_value
 * @return {?} This should be !(string|d3.selection), but the narrower type
 *     would break some builds.
 */
d3.selection.prototype.attr = function(nameOrMap, opt_value) {};
/**
 * @param {!Function} f
 * @param {...*} var_args
 * @return {!d3.selection}
 */
d3.selection.prototype.call = function(f, var_args) {};
/**
 * @param {!(string|Object.<string, boolean>)} nameOrMap
 * @param {(boolean|function(this:Node, ?, number): boolean)=} opt_value
 * @return {!(boolean|d3.selection)}
 */
d3.selection.prototype.classed = function(nameOrMap, opt_value) {};
/**
 * @param {!(Array|function(this:d3.selection, ?, number): !Array)=} opt_values
 * @param {function(?, number)=} opt_keyFn
 *     The {@code this} context of opt_keyFn is the node when the function is
 *     evaluated on existing nodes, or the data array when the function is
 *     evaluated on new nodes.
 * @return {!(Array|d3.selection)}
 */
d3.selection.prototype.data = function(opt_values, opt_keyFn) {};
/**
 * @param {(undefined|boolean|number|string|Object|
 *     function(this:Node, ?, number): *)=} opt_value
 * @return {!(undefined|boolean|number|string|Object)}
 */
d3.selection.prototype.datum = function(opt_value) {};
/**
 * @param {function(this:Node, ?, number)} f
 * @return {!d3.selection}
 */
d3.selection.prototype.each = function(f) {};
/**
 * @return {boolean}
 */
d3.selection.prototype.empty = function() {};
/**
 * @return {!d3.selection}
 */
d3.selection.prototype.enter = function() {};
/**
 * @return {!d3.selection}
 */
d3.selection.prototype.exit = function() {};
/**
 * @param {string|function(this:Node, ?, number): boolean} f
 * @return {!d3.selection}
 * @suppress {checkTypes} Overrides Array#filter with different arguments.
 * @override
 */
d3.selection.prototype.filter = function(f) {};
/**
 * @param {(string|function(this:Node, ?, number): string)=} opt_value
 * @return {!(string|d3.selection)}
 */
d3.selection.prototype.html = function(opt_value) {};
/**
 * @param {(string|function(): !Node)} name
 * @param {(string|function(): !Node)=} opt_before
 * @return {!d3.selection}
 */
d3.selection.prototype.insert = function(name, opt_before) {};
/**
 * @return {Node}
 */
d3.selection.prototype.node = function() {};
/**
 * @param {string} type
 * @param {?function(this:Node, ?, number)=} opt_listener
 * @param {boolean=} opt_capture
 * @return {!(undefined|d3.selection|function(this:Node, ?, number))}
 */
d3.selection.prototype.on = function(type, opt_listener, opt_capture) {};
/**
 * @return {!d3.selection}
 */
d3.selection.prototype.order = function() {};
/**
 * @param {!(string|Object.<string, ?(undefined|string|number|boolean)>)}
 *     nameOrMap
 * @param {?(undefined|string|number|boolean|Object|
 *     function(this:Node, ?, number):
 *         ?(undefined|string|number|boolean|Object))=}
 *     opt_value
 * @return {!(undefined|boolean|number|string|d3.selection|Object)}
 */
d3.selection.prototype.property = function(nameOrMap, opt_value) {};
/**
 * @return {!d3.selection}
 */
d3.selection.prototype.remove = function() {};
/**
 * @param {string|function(this:Node, ?, number): Node} selector
 *     See http://www.w3.org/TR/css3-selectors/#selectors
 * @return {!d3.selection}
 */
d3.selection.prototype.select = function(selector) {};
/**
 * @param {(string|
 *     function(this:Node, ?, number): !(Array.<Node>|NodeList))} selector
 *     See http://www.w3.org/TR/css3-selectors/#selectors
 * @return {!d3.selection}
 */
d3.selection.prototype.selectAll = function(selector) {};
/**
 * @return {number}
 */
d3.selection.prototype.size = function() {};
/**
 * @param {function(?, ?): number} comparator
 * @return {!d3.selection}
 * @suppress {checkTypes} Overrides Array#sort with different arguments.
 * @override
 */
d3.selection.prototype.sort = function(comparator) {};
/**
 * @param {!(string|Object.<string, ?(undefined|string|number)>)} nameOrMap
 * @param {?(undefined|string|number|
 *     function(this:Node, ?, number): ?(undefined|string|number))=} opt_value
 * @param {?string=} opt_priority null or 'important'.
 * @return {!(string|d3.selection)}
 */
d3.selection.prototype.style = function(nameOrMap, opt_value, opt_priority) {};
/**
 * @param {?(string|function(this:Node, ?, number): string)=} opt_value
 * @return {!(string|d3.selection)}
 */
d3.selection.prototype.text = function(opt_value) {};
/**
 * @param {string=} opt_value
 * @return {!d3.transitionType}
 */
d3.selection.prototype.transition = function(opt_value) {};
/**
 * @param {string|Node} selector
 *     See http://www.w3.org/TR/css3-selectors/#selectors
 * @return {!d3.selection}
 */
d3.select = function(selector) {};
/**
 * @param {!(string|Array.<Node>|NodeList)} selector
 *     See http://www.w3.org/TR/css3-selectors/#selectors
 * @return {!d3.selection}
 */
d3.selectAll = function(selector) {};

/**
 * See https://github.com/mbostock/d3/wiki/SVG-Shapes#area for details.
 * @typedef {function(Array<Object>=)}
 */
d3.areaType;
d3.areaType.prototype.defined;
d3.areaType.prototype.x;
d3.areaType.prototype.y;
d3.areaType.prototype.x1;
d3.areaType.prototype.y1;
d3.areaType.prototype.x0;
d3.areaType.prototype.y0;
d3.areaType.prototype.interpolate;

/**
 * @constructor
 */
d3.coordinates = function() {};
d3.coordinates.prototype.x;
d3.coordinates.prototype.y;
d3.coordinates.prototype.x0;
d3.coordinates.prototype.y0;


/**
 * @constructor
 */
d3.rgbType = function() {};
d3.rgbType.prototype.brighter;
d3.rgbType.prototype.darker;
d3.rgbType.prototype.hsl;
d3.rgbType.prototype.toString;
d3.rgbType.prototype.r;
d3.rgbType.prototype.g;
d3.rgbType.prototype.b;


/**
 * @constructor
 */
d3.hslType = function() {};
d3.hslType.prototype.brighter;
d3.hslType.prototype.darker;
d3.hslType.prototype.rgb;
d3.hslType.prototype.toString;
d3.rgbType.prototype.h;
d3.rgbType.prototype.s;
d3.rgbType.prototype.l;


/**
 * @constructor
 */
d3.diagonalType = function() {};
d3.diagonalType.prototype.diagonal;
d3.diagonalType.prototype.projection;
d3.diagonalType.prototype.source;
d3.diagonalType.prototype.target;


/**
 * @constructor
 */
d3.transitionType = function() {};
d3.transitionType.prototype.attr;
d3.transitionType.prototype.attrTween;
d3.transitionType.prototype.call;
d3.transitionType.prototype.delay;
d3.transitionType.prototype.duration;
d3.transitionType.prototype.each;
d3.transitionType.prototype.ease;
d3.transitionType.prototype.empty;
d3.transitionType.prototype.filter;
d3.transitionType.prototype.remove;
d3.transitionType.prototype.select;
d3.transitionType.prototype.selectAll;
d3.transitionType.prototype.style;
d3.transitionType.prototype.styleTween;
d3.transitionType.prototype.text;
d3.transitionType.prototype.transition;
d3.transitionType.prototype.tween;

/**
 * NOTE(chizeng): I made this subclass Function so that we can pass a
 * d3.zoomType as an argument into the `call` method.
 * @constructor
 * @extends {Function}
 */
d3.zoomType = function() {};
d3.zoomType.prototype.on;
d3.zoomType.prototype.scale;
d3.zoomType.prototype.scaleExtent;
d3.zoomType.prototype.translate;
d3.zoomType.prototype.x;
d3.zoomType.prototype.y;

/**
 * @typedef {function()}
 */
d3.dragType;

/**
 * @type {d3.dragType}
 */
d3.dragType_;
d3.dragType_.prototype.on;
d3.dragType_.prototype.origin;

/**
 * @interface
 * @template K
 * @template V
 */
d3.mapType = function() {};

/**
 * @param {K} key
 * @return {boolean}
 */
d3.mapType.prototype.has = function(key) {};

/**
 * @param {K} key
 * @return {(V|undefined)}
 */
d3.mapType.prototype.get = function(key) {};

/**
 * @param {K} key
 * @return {boolean}
 */
d3.mapType.prototype.remove = function(key) {};

/**
 * @param {K} key
 * @param {V} value
 */
d3.mapType.prototype.set = function(key, value) {};

/**
 * @return {!Array<string>}
 */
d3.mapType.prototype.keys = function() {};

/**
 * @return {!Array<V>}
 */
d3.mapType.prototype.values = function() {};

/**
 * @return {!Array<{key: string, value: V}>}
 */
d3.mapType.prototype.entries = function() {};

/**
 * @param {function(this:d3.mapType, string, V)} iteratorCallback
 */
d3.mapType.prototype.forEach = function(iteratorCallback) {};

/**
 * @return {number}
 */
d3.mapType.prototype.size = function() {};

/**
 * @return {boolean}
 */
d3.mapType.prototype.empty = function() {};

/**
 * @template K
 * @template V
 * @param {Object<K, V>=} opt_obj
 * @return {!d3.mapType<K, V>}
 */
d3.map = function(opt_obj) {};

/**
 * @constructor
 */
d3.nestType = function() {};
d3.nestType.prototype.entries;
d3.nestType.prototype.key;
d3.nestType.prototype.map;
d3.nestType.prototype.rollup;
d3.nestType.prototype.sortKeys;
d3.nestType.prototype.sortValues;

/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   px: number,
 *   py: number,
 *   weight: number,
 *   fixed: boolean
 * }}
 */
d3.forceLayoutNode;

/**
 * @typedef {{
 *   source: (d3.forceLayoutNode|number),
 *   target: (d3.forceLayoutNode|number)
 * }}
 */
d3.forceLayoutLink;

/**
 * @see https://github.com/mbostock/d3/wiki/Force-Layout
 * @typedef {?function(?)}
 */
d3.forceLayout;

/**
 * @type {d3.forceLayout}
 */
d3.forceLayout_;

/**
 * @param {number=} opt_alpha
 * @return {number|!d3.forceLayout}
 */
d3.forceLayout_.prototype.alpha = function(opt_alpha) {};

/**
 * @param {number|function(d3.forceLayoutNode, number)} opt_charge
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.charge = function(opt_charge) {};

/**
 * @param {number=} opt_chargeDistance
 * @return {number|!d3.forceLayout}
 */
d3.forceLayout_.prototype.chargeDistance = function(opt_chargeDistance) {};

/**
 * @return {!d3.dragType}
 */
d3.forceLayout_.prototype.drag = function() {};

/**
 * @param {number=} opt_friction
 * @return {number|!d3.forceLayout}
 */
d3.forceLayout_.prototype.friction = function(opt_friction) {};

/**
 * @param {number=} opt_gravity
 * @return {number|!d3.forceLayout}
 */
d3.forceLayout_.prototype.gravity = function(opt_gravity) {};

/**
 * @param {number|function(d3.forceLayoutNode, number)} opt_linkDistance
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.linkDistance = function(opt_linkDistance) {};

/**
 * @param {number|function(d3.forceLayoutNode, number)} opt_linkStrength
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.linkStrength = function(opt_linkStrength) {};

/**
 * @param {!Array<d3.forceLayoutLink>} opt_links
 * @return {!Array<d3.forceLayoutLink|number>|!d3.forceLayout}
 */
d3.forceLayout_.prototype.links = function(opt_links) {};

/**
 * @param {!Array<d3.forceLayoutNode>} opt_nodes
 * @return {!Array<d3.forceLayoutNode>|!d3.forceLayout}
 */
d3.forceLayout_.prototype.nodes = function(opt_nodes) {};

/**
 * @param {string} type
 * @param {Function} opt_listener
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.on = function(type, opt_listener) {};

/**
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.resume = function() {};

/**
 * @param {Array<number>=} opt_size
 * @return {Array<number>|!d3.forceLayout}
 */
d3.forceLayout_.prototype.size = function(opt_size) {};

/**
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.start = function() {};

/**
 * @return {!d3.forceLayout}
 */
d3.forceLayout_.prototype.stop = function() {};

/**
 * @param {number=} opt_theta
 * @return {number|!d3.forceLayout}
 */
d3.forceLayout_.prototype.theta = function(opt_theta) {};

/**
 * @return {boolean|undefined}
 */
d3.forceLayout_.prototype.tick = function() {};

/**
 * @constructor
 */
d3.quadtreeGeom = function() {};
d3.quadtreeGeom.prototype.visit = function(value) {};


/**
 * @constructor
 */
d3.partitionLayout = function() {};
d3.partitionLayout.prototype.children = function(value) {};
d3.partitionLayout.prototype.links = function(value) {};
d3.partitionLayout.prototype.nodes = function(value) {};
d3.partitionLayout.prototype.sort = function(value) {};
d3.partitionLayout.prototype.size = function(value) {};
d3.partitionLayout.prototype.value = function(value) {};


/**
 * @typedef {{
 *   value: *,
 *   startAngle: number,
 *   endAngle: number,
 *   padAngle: number,
 *   data: *
 * }}
 */
d3.pieLayoutData;


/**
 * @typedef {function(!Array<*>, number=): !Array<!d3.pieLayoutData>}
 */
d3.pieLayout;
/**
 * Re-open the pieLayout type definition so we can define properties
 * on it.
 *
 * @type {d3.pieLayout}
 */
d3.pieLayout_;
/**
 * @param {(number|(function(!Array<*>, number): number))=} opt_angleOrFn
 * @return {(number|!d3.pieLayout)}
 */
d3.pieLayout_.prototype.endAngle = function(opt_angleOrFn) {};
/**
 * @param {(number|(function(!Array<*>, number): number))=} opt_angleOrFn
 * @return {(number|!d3.pieLayout)}
 */
d3.pieLayout_.prototype.padAngle = function(opt_angleOrFn) {};
/**
 * @param {?Function=} opt_compareFn
 * @return {(Function|!d3.pieLayout)}
 */
d3.pieLayout_.prototype.sort = function(opt_compareFn) {};
/**
 * @param {(number|(function(!Array<*>, number): number))=} opt_angleOrFn
 * @return {(number|!d3.pieLayout)}
 */
d3.pieLayout_.prototype.startAngle = function(opt_angleOrFn) {};
/**
 * @param {(function(*, number): *)=} opt_valueFn
 * @return {(Function|!d3.pieLayout)}
 */
d3.pieLayout_.prototype.value = function(opt_valueFn) {};


/** @typedef {?function(?)} */
d3.stackLayout;
/**
 * Re-open the stackLayout type definition so we can define properties on it.
 * @type {d3.stackLayout}
 */
d3.stackLayout_ = function() {};
d3.stackLayout_.prototype.values = function(layers, opt_index) {};
d3.stackLayout_.prototype.offset = function(offsetName) {};
d3.stackLayout_.prototype.order = function(orderName) {};
d3.stackLayout_.prototype.x = function(accessor) {};
d3.stackLayout_.prototype.y = function(accessor) {};
d3.stackLayout_.prototype.out = function(setter) {};


/** @typedef {?function(?)} */
d3.treeLayout;

/**
 * Re-open the treeLayout type definition so we can define properties on it.
 * @type {d3.treeLayout}
 */
d3.treeLayout_ = function() {};

/**
 * @param {?Function} comparator
 * @return {!d3.treeLayout}
 */
d3.treeLayout_.prototype.sort = function(comparator) {};
/**
 * @param {?Function} children
 * @return {!d3.treeLayout}
 */
d3.treeLayout_.prototype.children = function(children) {};
/**
 * @param {!Object} root
 * @return {!Array}
 */
d3.treeLayout_.prototype.nodes = function(root) {};
/**
 * @param {!Array} nodes
 * @return {!Array}
 */
d3.treeLayout_.prototype.links = function(nodes) {};
/**
 * @param {?Function} separation
 * @return {!d3.treeLayout}
 */
d3.treeLayout_.prototype.separation = function(separation) {};
/**
 * @param {!Array} size
 * @return {!d3.treeLayout}
 */
d3.treeLayout_.prototype.size = function(size) {};

/**
 * @param {!Array<number>} size
 * @return {!d3.treeLayout}
 */
d3.treeLayout_.prototype.nodeSize = function(size) {};

/**
 * @constructor
 */
d3.treemapLayout = function() {};
d3.treemapLayout.prototype.children = function(opt_children) {};
d3.treemapLayout.prototype.links = function(nodes) {};
d3.treemapLayout.prototype.mode = function(opt_mode) {};
d3.treemapLayout.prototype.nodes = function(root) {};
d3.treemapLayout.prototype.padding = function(opt_padding) {};
d3.treemapLayout.prototype.ratio = function(opt_ratio) {};
d3.treemapLayout.prototype.round = function(opt_round) {};
d3.treemapLayout.prototype.size = function(opt_size) {};
d3.treemapLayout.prototype.sort = function(opt_sort) {};
d3.treemapLayout.prototype.sticky = function(opt_sticky) {};
d3.treemapLayout.prototype.value = function(opt_value) {};

/**
 * https://github.com/mbostock/d3/wiki/Chord-Layout
 * @constructor
 */
d3.chordLayout = function() {};
d3.chordLayout.prototype.padding = function(opt_padding) {};
d3.chordLayout.prototype.sortSubgroups = function(opt_comparator) {};
d3.chordLayout.prototype.sortGroups = function(opt_comparator) {};
d3.chordLayout.prototype.sortChords = function(opt_comparator) {};
d3.chordLayout.prototype.matrix = function(opt_matrix) {};
d3.chordLayout.prototype.chords = function() {};
d3.chordLayout.prototype.groups = function() {};

/**
 * @typedef {(string|Element|Array)}
 */
d3.query;

/**
 * @constructor
 */
d3.geo.projection = function() {};
d3.geo.projection.prototype.center = function(value) {};
d3.geo.projection.prototype.clipAngle = function(value) {};
d3.geo.projection.prototype.invert = function(value) {};
d3.geo.projection.prototype.rotate = function(value) {};
d3.geo.projection.prototype.scale = function(value) {};
d3.geo.projection.prototype.stream = function(value) {};
d3.geo.projection.prototype.translate = function(value) {};

/**
 * @return {!d3.geo.projection}
 */
d3.geo.orthographic = function() {};
d3.geo.azimuthal = function() {};
d3.geo.albers = function() {};
d3.geo.albersUsa = function() {};
d3.geo.bonne = function() {};
d3.geo.equirectangular = function() {};
d3.geo.mercator = function() {};
d3.geo.path = function() {};
d3.geo.bounds = function() {};
d3.geo.circle = function() {};
d3.geo.greatArc = function() {};
d3.geo.greatCircle = function() {};
d3.geo.orthographic = function() {};


/**
 * An object implementing the interface of Date.
 * @typedef {Date|{getTime: function():number}}
 */
d3.DateLike;

/**
 * TODO(pallosp): Change the return type of the returned function to string when
 * //javatests/com/google/visualization/gviz/jsapi/webdrivertests/tests/charts/
 * corechart:trendlines_image_test_chrome-linux is fixed.
 * @param {string} template
 * @return {function(?): ?}
 */
d3.time.format = function(template) {};
/**
 * @param {!d3.DateLike} date
 * @return {string}
 */
d3.time.format.iso = function(date) {};
/**
 * @param {string} str
 * @return {Date}
 */
d3.time.format.iso.parse = function(str) {};
/**
 * See  https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi
 * for details.
 * @param {!Array<!Array<(string|function(!Date):boolean)>>} listOfFormats
 * @return {function(!Date): string}
 */
d3.time.format.multi = function(listOfFormats) {};
/**
 * @param {string} template
 * @return {function(?): string}
 */
d3.time.format.utc = function(template) {};
/**
 * See  https://github.com/mbostock/d3/wiki/Time-Formatting#format_multi
 * for details.
 * @param {!Array<!Array<(string|function(!Date):boolean)>>} listOfFormats
 * @return {function(!Date): string}
 */
d3.time.format.utc.multi = function(listOfFormats) {};
/**
 * @see https://github.com/mbostock/d3/wiki/Time-Scales
 * @typedef {function(*): number}
 */
d3.timeScaleType;
/**
 * @type {d3.timeScaleType}
 */
d3.timeScaleType_;
/**
 * @param {number} y
 * @return {!Date}
 */
d3.timeScaleType_.prototype.invert = function(y) {};
/**
 * @param {!Array<!d3.DateLike>=} opt_dates
 * @return {(!d3.timeScaleType|!Array<!Date>)}
 */
d3.timeScaleType_.prototype.domain = function(opt_dates) {};
/**
 * @param {((function(!d3.DateLike): !Date)|number)=} opt_intervalOrCount
 * @param {number=} opt_step
 * @return {!d3.timeScaleType}
 */
d3.timeScaleType_.prototype.nice = function(opt_intervalOrCount, opt_step) {};
/**
 * @param {!Array<number>=} opt_values
 * @return {(!d3.timeScaleType|!Array<number>)}
 */
d3.timeScaleType_.prototype.range = function(opt_values) {};
/**
 * @param {!Array<number>=} opt_values
 * @return {(!d3.timeScaleType|!Array<number>)}
 */
d3.timeScaleType_.prototype.rangeRound = function(opt_values) {};
/**
 * @param {!Function=} opt_factory
 * @return {(!d3.timeScaleType|!Function)}
 */
d3.timeScaleType_.prototype.interpolate = function(opt_factory) {};
/**
 * @param {boolean=} val
 * @return {(!d3.timeScaleType|boolean)}
 */
d3.timeScaleType_.prototype.clamp = function(val) {};
/**
 * @param {((function(!d3.DateLike): !Date)|number)=} opt_intervalOrCount
 * @param {number=} opt_step
 * @return {!d3.timeScaleType}
 */
d3.timeScaleType_.prototype.ticks = function(opt_intervalOrCount, opt_step) {};
/**
 * @return {function(!Date): string}
 */
d3.timeScaleType_.prototype.tickFormat = function() {};
/**
 * @return {!d3.timeScaleType}
 */
d3.timeScaleType_.prototype.copy = function() {};
/**
 * @return {!d3.timeScaleType}
 */
d3.time.scale = function() {};
/**
 * @return {!d3.timeScaleType}
 */
d3.time.scale.utc = function() {};
/**
 * Alias for d3.time.second.floor.
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.second.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.second.offset = function(date, step) {};
/**
 * Alias for d3.time.second.range.
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.seconds = function(start, stop, opt_step) {};
/**
 * Alias for d3.time.second.utc.floor.
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.second.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.second.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.second.utc.offset = function(date, step) {};
/**
 * Alias for d3.time.second.utc.range.
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.seconds.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.minute.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.minute.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.minutes = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.minute.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.minute.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.minute.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.minutes.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.hour.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.hour.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.hours = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.hour.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.hour.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.hour.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.hours.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.day.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.day.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.days = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.day.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.day.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.day.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.days.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.dayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.monday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.monday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.mondays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.monday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.monday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.monday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.mondays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.mondayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.tuesday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.tuesday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.tuesdays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.tuesday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.tuesday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.tuesday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.tuesdays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.tuesdayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.wednesday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.wednesday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.wednesdays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.wednesday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.wednesday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.wednesday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.wednesdays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.wednesdayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.thursday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.thursday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.thursdays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.thursday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.thursday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.thursday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.thursdays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.thursdayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.friday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.friday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.fridays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.friday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.friday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.friday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.fridays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.fridayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.saturday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.saturday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.saturdays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.saturday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.saturday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.saturday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.saturdays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.saturdayOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.sunday.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.sunday.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.sundays = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.sunday.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.sunday.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.sunday.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.sundays.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.sundayOfYear = function(date) {};
/**
 * Alias for d3.time.week.floor as well as d3.time.sunday.floor.
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.week.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.week.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.weeks = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.week.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.week.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.week.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.weeks.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {number}
 */
d3.time.weekOfYear = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.month.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.month.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.months = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.month.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.month.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.month.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.months.utc = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.year.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.year.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.years = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.utc = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.utc.floor = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.utc.round = function(date) {};
/**
 * @param {!d3.DateLike} date
 * @return {!Date}
 */
d3.time.year.utc.ceil = function(date) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.year.utc.range = function(start, stop, opt_step) {};
/**
 * @param {!d3.DateLike|number} date
 * @param {number} step
 * @return {!Date}
 */
d3.time.year.utc.offset = function(date, step) {};
/**
 * @param {!d3.DateLike|number} start
 * @param {!d3.DateLike|number} stop
 * @param {number=} opt_step
 * @return {!Array.<!Date>}
 */
d3.time.years.utc = function(start, stop, opt_step) {};

/**
 * https://github.com/mbostock/d3/wiki/Internals#events
 * @param {...string} var_args Event types.
 * @return {!d3.dispatcherType_} An event type -> listener map with an on()
 *     method to register listeners.
 */
d3.dispatch = function(var_args) {};
/**
 * @constructor
 */
d3.dispatcherType_;
/**
 * @param {string} type
 * @param {Function=} opt_listener
 * @return {!Function|!d3.dispatcherType_|undefined}
 */
d3.dispatcherType_.prototype.on = function(type, opt_listener) {};

var d3 = {
  'version': {},
  'functor': function() {},
  'rebind': function() {},
  'ascending': function() {},
  'descending': function() {},
  'mean': function() {},
  'median': function() {},
  'min': function() {},
  'max': function() {},
  'extent': function() {},
  'random': {
    'normal': function() {},
    'logNormal': function() {},
    'irwinHall': function() {}
  },
  'sum': function() {},
  'quantile': function() {},
  'transpose': function() {},
  'zip': function() {},
  'bisector': function() {},
  'bisectLeft': function() {},
  'bisectRight': function() {},
  'bisect': function() {},
  'first': function() {},
  'last': function() {},
  /**
   * @return {!d3.nestType}
   */
  'nest': function() {},
  'keys': function() {},
  'values': function() {},
  'entries': function() {},
  'permute': function() {},
  'merge': function() {},
  'split': function() {},
  'range': function() {},
  'requote': function() {},
  'round': function() {},
  'xhr': function() {},
  'text': function() {},
  'json': function() {},
  'html': function() {},
  'xml': function() {},
  'ns': {
    'prefix': {
      'svg': {},
      'xhtml': {},
      'xlink': {},
      'xml': {},
      'xmlns': {}
    },
    'qualify': function() {}
  },
  'format': function() {},
  'formatPrefix': function() {},
  'ease': function() {},
  'event': {
    'sourceEvent': function() {},
    'preventDefault': function() {}
  },
  'transform': function() {},
  'interpolate': function() {},
  'interpolateNumber': function() {},
  'interpolateRound': function() {},
  'interpolateString': function() {},
  'interpolateTransform': function() {},
  'interpolateRgb': function() {},
  'interpolateHsl': function() {},
  'interpolateLab': function() {},
  'interpolateHcl': function() {},
  'interpolateArray': function() {},
  'interpolateObject': function() {},
  'interpolators': {
    '0': function() {},
    '1': function() {},
    '2': function() {},
    '3': function() {},
    '4': function() {}
  },
  /**
   * @param {number|string} rOrColor
   * @param {number=} opt_g
   * @param {number=} opt_b
   * @return {!d3.rgbType}
   */
  'rgb': function(rOrColor, opt_g, opt_b) {},
  /**
   * @param {number|string} hOrColor
   * @param {number=} opt_s
   * @param {number=} opt_l
   * @return {!d3.hslType}
   */
  'hsl': function(hOrColor, opt_s, opt_l) {},
  'hcl': function() {},
  'lab': function() {},
  /**
   * @param {*=} opt_selection
   * @return {!d3.selection}
   */
  'transition': function(opt_selection) {},
  'tween': function() {},
  'timer': function() {},
  'mouse': function() {},
  'touches': function() {},
  'scale': {
    'linear': function() {},
    'log': function() {},
    'pow': function() {},
    'sqrt': function() {},
    /** @return {!d3.scaleType} */
    'ordinal': function() {},
    'category10': function() {},
    'category20': function() {},
    'category20b': function() {},
    'category20c': function() {},
    'quantile': function() {},
    'quantize': function() {},
    'threshold': function() {},
    'identity': function() {}
  },
  'svg': {
    /**
     * @return {!d3.arcType}
     */
    'arc': function() {},
    'line': function() {},
    /** @return {!d3.areaType} */
    'area': function() {},
    'chord': function() {},
    /**
     * @return {!d3.diagonalType}
     */
    'diagonal': function() {},
    'mouse': function() {},
    'touches': function() {},
    'symbol': function() {},
    'symbolTypes': {
      '0': {},
      '1': {},
      '2': {},
      '3': {},
      '4': {},
      '5': {}
    },
    /** @return {!d3.axisType} */
    'axis': function() {},
    'brush': function() {}
  },
  'behavior': {
    /**
     * @return {!d3.dragType}
     */
    'drag': function() {},
    /**
     * @return {!d3.zoomType}
     */
    'zoom': function() {}
  },
  'layout': {
    'bundle': function() {},
    /**
     * @return {!d3.chordLayout}
     */
    'chord': function() {},
    /**
     * @return {!d3.forceLayout}
     */
    'force': function() {},
    /**
     * @return {!d3.partitionLayout}
     */
    'partition': function() {},
    /**
     * @return {!d3.pieLayout}
     */
    'pie': function() {},
    /**
     * @return {!d3.stackLayout}
     */
    'stack': function() {},
    'histogram': function() {},
    'hierarchy': function() {},
    'pack': function() {},
    'cluster': function() {},
    /**
     * @return {!d3.treeLayout}
     */
    'tree': function() {},
    /**
     * @return {!d3.treemapLayout}
     */
    'treemap': function() {}
  },
  'csv': {
    'format': function() {},
    'formatRows': function() {},
    'parse': function() {},
    'parseRows': function() {}
  },
  'tsv': {
    'format': function() {},
    'formatRows': function() {},
    'parse': function() {},
    'parseRows': function() {}
  },
  'geo': {},  // See above section for more geo.
  'geom': {
    'contour': function() {},
    'hull': function() {},
    'polygon': function() {},
    'voronoi': function() {},
    'delaunay': function() {},
    /**
     * @return {!d3.quadtreeGeom}
     */
    'quadtree': function() {}
  }
};