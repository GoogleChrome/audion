/**
 * This script updates the UI of the Web Audio panel based on the audio graph
 * stored in dev tools.
 */


/**
 * A renderer used to layout and render the graph.
 * @type {!dagreD3.render}
 */
var renderDagreGraph = new dagreD3.render();


/**
 * The SVG container for the audio graph visualization.
 * @type {!SVGElement}
 */
var svgGraphContainer = d3.select('#graph svg');


/**
 * The inner (g) SVG container for the audio graph visualization.
 * @type {!SVGElement}
 */
var svgGraphInnerContainer = d3.select("#graph svg g");


/**
 * The previous scale value.
 * @type {number}
 */
var lastScaleValue = 1;


/**
 * The previous translate value.
 * @type {!Array<number>}
 */
var lastTranslateValue = [0, 0];


/**
 * Whether the user had panned or zoomed since the last tab refresh. Used to
 * determine whether we can directly re-center and re-scale the graph after a
 * layout. If we re-orient the graph after the user already interacted, we could
 * be overriding a desirable orientation of the user.
 * @type {boolean}
 */
var userPannedOrZoomed = false;


// Allow the user to zoom via mouse wheel.
var zoomListener = d3.behavior.zoom().on('zoom', handleZoom);
// Actually attach the listener.
svgGraphContainer.call(zoomListener);


/**
 * If true, a redraw is pending. No need to request a new one.
 * @type {boolean}
 */
var redrawPending = false;


/**
 * Runs pending redraw tasks. Run by requestAnimationFrame to be in sync with
 * the vsync thread.
 */
function runPendingRedrawCallbacks() {
  redrawPending = false;
  layoutAndDrawGraph();
}


/**
 * Requests a redraw on the next animation frame.
 */
function requestRedraw() {
  if (redrawPending) {
    // A redraw is already pending. No need to request another one.
    return;
  }
  redrawPending = true;
  requestAnimationFrame(runPendingRedrawCallbacks);
}


/**
 * Handles a d3 zoom event. Assumes d3.event is defined.
 */
function handleZoom() {
  lastScaleValue = d3.event.scale;
  lastTranslateValue = d3.event.translate;
  scaleAndTranslateGraph(lastScaleValue, lastTranslateValue);
}


/**
 * Applies a scale and a translation to the inner SVG element of the graph.
 * @param {number} scale
 * @param {Array<number, number>} translation Format: X, Y
 */
function scaleAndTranslateGraph(scale, translation) {
  svgGraphInnerContainer.attr(
      'transform',
      'translate(' + translation + ')' + 'scale(' + scale + ')'
    );
}


/**
 * Scales and repositions so that the entire graph is visible.
 */
function makeWholeGraphViewable() {
  if (!graphHasValidDimensions()) {
    return;
  }

  userPannedOrZoomed = false;
  centerGraph();
}


/**
 * Does graph layout and then renders the graph.
 */
function layoutAndDrawGraph() {
  // Remove the scaling if we had one. Compute graph dimensions assuming scaling
  // 1. We re-apply the scaling later.
  scaleAndTranslateGraph(1, lastTranslateValue);
  renderDagreGraph(svgGraphInnerContainer, audioGraph);

  if (!graphHasValidDimensions()) {
    return;
  }

  if (userPannedOrZoomed) {
    // The user already panned or zoomed. Maintain the user's current
    // configuration of translation and scaling.
    scaleAndTranslateGraph(lastScaleValue, lastTranslateValue);
  } else {
    // The user had not panned or zoomed yet. Center and scale the graph so that
    // the user can see the whole graph.
    centerGraph();
  }
}


/**
 * Determines if the graph has valid dimensions. It may not if it lacks nodes.
 * Assumes that layout and rendering already occurred.
 * @return {boolean}
 */
function graphHasValidDimensions() {
  var graphDimensions = audioGraph.graph();
  return isFinite(graphDimensions.width) && isFinite(graphDimensions.height);
}


/**
 * Centers the graph and scales it so that it fits completely within the panel
 * page.
 */
function centerGraph() {
  // The dimensions of the DOM container of the graph.
  var graphContainerDimensions =
      svgGraphContainer.node().getBoundingClientRect();

  // The min dimenions needed to render the graph.
  var graphDimensions = audioGraph.graph();

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

  // Center the graph.
  zoomListener
      .translate(translation)
      .scale(scale)
      .event(svgGraphInnerContainer);
}


/**
 * Handles a request to redraw the audio graph, perhaps for instance after an
 * update to the graph.
 */
function handleRequestGraphRedraw(message) {
  // TODO: Redraw the graph using the global audioGraph variable, which
  // stores a graphlib.Graph (set in dev-tools.js).
  requestRedraw();
}



/**
 * Handles what happens if web audio updates occurred before the dev tools
 * instance opened.
 */
function handleMissingAudioUpdates(message) {
  var divWarning = document.getElementById('warningMessage');
  var divGraph = document.getElementById('graph');
  var divDebug = document.getElementById('debuggingText');
  
  divGraph.style.display = divDebug.style.display = 'none';
  divWarning.style.display = 'block'
  divWarning.innerHTML =
      'This visualization ignores web audio updates before dev tools opened.' +
      '<br><strong>Refresh</strong> to track a comprehensive graph.';
}


/**
 * Handles what happens when the page within the tab changes.
 */
function handlePageChangeWithinTab() {
  // Clear all warnings. We basically begin with a new clean slate.
  var divWarning = document.getElementById('warningMessage');
  var divGraph = document.getElementById('graph');
  var divDebug = document.getElementById('debuggingText');

  divWarning.style.display = 'none';
  divWarning.innerHTML = '';
  divGraph.style.display = divDebug.style.display = 'block';

  // Reset panning and zooming.
  lastScaleValue = 1;
  lastTranslateValue = [0, 0];
  userPannedOrZoomed = false;
}


window.addEventListener('message', function(event) {
  var message = event.data
  switch (message['type']) {
    case 'missing_updates':
      // Audio updates occurred prior to dev tools opening.
      handleMissingAudioUpdates(message);
      break;
    case 'page_changed':
      // The tab changed pages.
      handlePageChangeWithinTab();
      break;
    case 'redraw_graph':
      handleRequestGraphRedraw(message);
      break;
  }
});

// Make the whole graph fit in the viewport when the user clicks on the button.
document.getElementById('viewEntireGraphButton').addEventListener(
    'click', makeWholeGraphViewable);
