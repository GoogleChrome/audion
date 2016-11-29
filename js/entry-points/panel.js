goog.provide('audion.entryPoints.panel');


/**
 * The last recorded visual graph to render if any.
 * @private {?dagreD3.graphlib.Graph}
 */
audion.entryPoints.lastRecordedVisualGraph_ = null;


/**
 * Whether a redraw request is pending. We avoid performing superfluous redraws.
 * @private {boolean}
 */
audion.entryPoints.redrawPending_ = false;


/**
 * A renderer used to layout and render the graph. The dagre extern lacks the
 * render method, so we put it between quotes to avoid obfuscation. Updating the
 * extern proved fiddly.
 * @private {function(!d3.selection, !dagreD3.graphlib.Graph)}
 */
audion.entryPoints.renderDagreGraph_ = new dagreD3['render']();


/**
 * The HTML block container for the SVG visualization.
 * @private {!Element}
 */
audion.entryPoints.htmlContainer_ =
    /** @type {!Element} */ (goog.global.document.getElementById('graph'));
// Add a compiled CSS class name so that we can apply styles. We should probably
// move to using the ID directly.  
audion.entryPoints.htmlContainer_.classList.add(
    goog.getCssName('htmlGraphContainer'));


/**
 * The SVG container for the audio graph visualization.
 * @private {!d3.selection}
 */
audion.entryPoints.svgGraphContainer_ = d3.select('#graph svg');


/**
 * The inner (g) SVG container for the audio graph visualization.
 * @private {!d3.selection}
 */
audion.entryPoints.svgGraphInnerContainer_ = d3.select("#graph svg g");


/**
 * The previous scale value.
 * @private {number}
 */
audion.entryPoints.lastScaleValue_ = 1;


/**
 * The previous translate value.
 * @private {!Array<number>}
 */
audion.entryPoints.lastTranslateValue_ = [0, 0];


/**
 * Whether the user had panned or zoomed since the last tab refresh. Used to
 * determine whether we can directly re-center and re-scale the graph after a
 * layout. If we re-orient the graph after the user already interacted, we could
 * be overriding a desirable orientation of the user.
 * @private {boolean}
 */
audion.entryPoints.userPannedOrZoomed_ = false;


/**
 * Handles a d3 zoom event. Assumes d3.event is defined.
 * @private
 */
audion.entryPoints.handleZoom_ = function() {
  audion.entryPoints.lastScaleValue_ = d3.event.scale;
  audion.entryPoints.lastTranslateValue_ = d3.event.translate;
  audion.entryPoints.scaleAndTranslateGraph_(
      audion.entryPoints.lastScaleValue_,
      audion.entryPoints.lastTranslateValue_);
  audion.entryPoints.userPannedOrZoomed_ = true;
}


/**
 * A listener for zoom actions by the user.
 * // TODO(chizeng): Be more nuanced about function annotation.
 * @type {!d3.zoomType}
 */
audion.entryPoints.zoomListener_ =
    d3.behavior.zoom().on('zoom', audion.entryPoints.handleZoom_);
audion.entryPoints.svgGraphContainer_.call(audion.entryPoints.zoomListener_);


/**
 * Determines if the graph has valid dimensions. It may not if it lacks nodes.
 * Assumes that layout and rendering already occurred.
 * @return {boolean}
 * @private
 */
audion.entryPoints.graphHasValidDimensions_ = function() {
  if (!audion.entryPoints.lastRecordedVisualGraph_) {
    // No graph at all.
    return false;
  }
  var graphDimensions = audion.entryPoints.lastRecordedVisualGraph_.graph();
  return isFinite(graphDimensions.width) && isFinite(graphDimensions.height);
}


/**
 * Handles what happens when we discover that dev tools is missing audio updates
 * from the main tab. We want to inform the user.
 * @private
 */
audion.entryPoints.handleMissingAudioUpdates_ = function() {
  // TODO(chizeng): Yeah.
  var warning = goog.global.document.createElement('div');
  warning.classList.add(goog.getCssName('updatesMissingWarning'));
  warning.textContent =
      'Please refresh. Web audio activities occurred before ' +
          'developer tools opened.';
  goog.global.document.body.appendChild(warning);
  goog.global.document.body.classList.add(
      goog.getCssName('bodyWithupdatesMissingWarning'));
};


/**
 * Applies a scale and a translation to the inner SVG element of the graph.
 * @param {number} scale
 * @param {Array<number, number>} translation Format: X, Y
 * @private
 */
audion.entryPoints.scaleAndTranslateGraph_ = function(scale, translation) {
  audion.entryPoints.svgGraphInnerContainer_.attr(
      'transform',
      'translate(' + translation + ')' + 'scale(' + scale + ')'
    );
};


/**
 * Centers the graph and scales it so that it fits completely within the panel
 * page. Assumes that a graph has been recorded.
 * @private
 */
audion.entryPoints.centerGraph_ = function() {
  // The dimensions of the DOM container of the graph.
  var graphContainerDimensions =
      audion.entryPoints.svgGraphContainer_.node().getBoundingClientRect();

  // The min dimenions needed to render the graph.
  var graphDimensions = audion.entryPoints.lastRecordedVisualGraph_.graph();

  var widthRatio = graphContainerDimensions.width / graphDimensions.width;
  var heightRatio = graphContainerDimensions.height / graphDimensions.height;
  var scale;
  var translation = [0, 0];
  if (widthRatio < heightRatio) {
    // We are limited by width.
    scale = widthRatio;
    translation[1] =
        (graphContainerDimensions.height - graphDimensions.height * scale) / 2;
  } else {
    // We are limited by height.
    scale = heightRatio;
    translation[0] =
        (graphContainerDimensions.width - graphDimensions.width * scale) / 2;
  }

  // Center the graph. Then reset the detection for user interaction.
  audion.entryPoints.zoomListener_
      .translate(translation)
      .scale(scale)
      .event(audion.entryPoints.svgGraphInnerContainer_);
  audion.entryPoints.userPannedOrZoomed_ = false;
}


/**
 * Does graph layout and then renders the graph.
 * @private
 */
audion.entryPoints.layoutAndDrawGraph_ = function() {
  // ... there is no graph. Do no layout.
  if (!audion.entryPoints.lastRecordedVisualGraph_) {
    return;
  }

  // Remove the scaling if we had one. Compute graph dimensions assuming scaling
  // 1. We re-apply the scaling later.
  audion.entryPoints.scaleAndTranslateGraph_(
      1, audion.entryPoints.lastTranslateValue_);
  audion.entryPoints.renderDagreGraph_(
      audion.entryPoints.svgGraphInnerContainer_,
      audion.entryPoints.lastRecordedVisualGraph_);

  if (!audion.entryPoints.graphHasValidDimensions_()) {
    return;
  }

  if (audion.entryPoints.userPannedOrZoomed_) {
    // The user already panned or zoomed. Maintain the user's current
    // configuration of translation and scaling.
    audion.entryPoints.scaleAndTranslateGraph_(
        audion.entryPoints.lastScaleValue_,
        audion.entryPoints.lastTranslateValue_);
  } else {
    // The user had not panned or zoomed yet. Center and scale the graph so that
    // the user can see the whole graph.
    audion.entryPoints.centerGraph_();
  }
};


/**
 * Requests a redraw of the visual graph.
 * @param {!dagreD3.graphlib.Graph} visualGraph
 * @private
 */
audion.entryPoints.requestRedraw_ = function(visualGraph) {
  audion.entryPoints.lastRecordedVisualGraph_ = visualGraph;
  if (audion.entryPoints.redrawPending_) {
    // We will redraw in due time. Don't redraw twice.
    return;
  }
  // Note that a redraw is pending.
  audion.entryPoints.redrawPending_ = true;
  goog.global.requestAnimationFrame(function() {
    // Intentionally skip a frame - aim for 30FPS. Layout can take a while.
    goog.global.requestAnimationFrame(function() {
      // We are performing the redraw. We need new redraws for subsequent
      // updates.
      audion.entryPoints.redrawPending_ = false;

      // Lay out and draw the graph based on the last recorded visual graph.
      audion.entryPoints.layoutAndDrawGraph_();
    });
  });
};


/**
 * Resets the UI.
 * @param {!dagreD3.graphlib.Graph} visualGraph
 * @private
 */
audion.entryPoints.resetUi_ = function(visualGraph) {
  audion.entryPoints.lastRecordedVisualGraph_ = visualGraph;

  // Hide the warning about missing audio updates. Show the rest.
  goog.global.document.body.classList.remove(
      goog.getCssName('bodyWithupdatesMissingWarning'));
  var updatesMissingWarning = goog.global.document.querySelector(
      '.' + goog.getCssName('updatesMissingWarning'));
  if (updatesMissingWarning) {
    updatesMissingWarning.remove();
  }

  // Reset panning and zooming.
  audion.entryPoints.lastScaleValue_ = 1;
  audion.entryPoints.lastTranslateValue_ = [0, 0];
  audion.entryPoints.userPannedOrZoomed_ = false;

  // Request another redraw.
  audion.entryPoints.requestRedraw_(visualGraph);
};


/**
 * Handles a click on the button for resizing the view to fit.
 * @private
 */
audion.entryPoints.handleResizeToFitButtonClick_ = function() {
  if (!audion.entryPoints.graphHasValidDimensions_()) {
    // The graph is wonky, ie it lacks nodes.
    return;
  }

  // Resize the graph so the user can see all of it. Center it.
  audion.entryPoints.centerGraph_();
};


/**
 * Creates the utility bar, which offers various pieces of functionality.
 * @private
 */
audion.entryPoints.createUtilityBar_ = function() {
  var utilityBar = goog.global.document.createElement('div');
  utilityBar.classList.add(goog.getCssName('utilityBar'));

  // Create a button for resizing the view to fit.
  var resizeToFitButton = goog.global.document.createElement('div');
  resizeToFitButton.classList.add(goog.getCssName('button'));
  resizeToFitButton.classList.add(goog.getCssName('resizeToFitButton'));
  // Make an internal square.
  var resizeToFitButtonInternal = goog.global.document.createElement('div');
  resizeToFitButton.appendChild(resizeToFitButtonInternal);
  // Add a listener to the button.
  resizeToFitButton.addEventListener(
      'click', audion.entryPoints.handleResizeToFitButtonClick_);
  utilityBar.appendChild(resizeToFitButton);

  goog.global.document.body.appendChild(utilityBar);
};


/**
 * Handles a click on something inside the graph visualization.
 * @this {!Element}
 * @private
 */
audion.entryPoints.handleClickOnGraph_ = function() {
  // Keep climbing the DOM tree til we hit an interesting element, ie a node.
  var thingClickedOn = d3.event.target;
  while (thingClickedOn && this != thingClickedOn) {
    var data = d3.select(thingClickedOn).data();
    if (!(data && data.length == 1)) {
      // We do not know if the user clicked on something interesting yet.
      continue;
    }
    var graphNodeId = data[0];

    // TODO(chizeng): Handle how the user might have clicked on an edge instead
    // of a node.
    var node = audion.entryPoints.lastRecordedVisualGraph_.node(graphNodeId);
    if (node) {
      // The user clicked on a node in the visual graph.
      // TODO(chizeng): Inspect the node.
      goog.global.console.log('User clicked on node ' + node.label);
      break;
    }
    // Keep going up the DOM tree.
    thingClickedOn = thingClickedOn.parentElement;
  }
};


/**
 * Sets up a click listener for the graph so that the user can say inspect
 * audio nodes. To be efficient, we use a single listener for the entire graph
 * DOM and wait for click events on visual nodes and edges to bubble up.
 * @private
 */
audion.entryPoints.createGraphClickListener_ = function() {
  audion.entryPoints.svgGraphContainer_.on(
      'click', audion.entryPoints.handleClickOnGraph_);
};


/**
 * The entry point for the script to run in our web audio Chrome dev panel -
 * the actual UI of the panel.
 */
audion.entryPoints.panel = function() {
  // Create the utility bar with various functionality like resizing the view to
  // fit the entire graph.
  audion.entryPoints.createUtilityBar_();

  // Sets a listener for clicks on the graph so that for instance the user can
  // inspect a node.
  audion.entryPoints.createGraphClickListener_();  

  // Define some functions global to the panel window namespace so that the dev
  // tools script (which has complete access to the panel page window upon
  // creating the panel page) can directly call the functions to change the UI.
  goog.global['audionMissingAudioUpdates'] =
      audion.entryPoints.handleMissingAudioUpdates_;
  goog.global['requestRedraw'] = audion.entryPoints.requestRedraw_;
  goog.global['resetUi'] = audion.entryPoints.resetUi_;
};


audion.entryPoints.panel();
