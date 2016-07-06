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
var svgGraphContainer = d3.select("#graph svg");


/**
 * The inner (g) SVG container for the audio graph visualization.
 * @type {!SVGElement}
 */
var svgGraphInnerContainer = d3.select("#graph svg g");


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
 * Does graph layout and then renders the graph.
 */
function layoutAndDrawGraph() {
  renderDagreGraph(svgGraphInnerContainer, audioGraph);

  var graphDimensions = audioGraph.graph();
  if (!isFinite(graphDimensions.width) || !isFinite(graphDimensions.height)) {
    // The computed dimensions are awry. Perhaps the graph lacks nodes.
    return;
  }

  // Center the graph.
  svgGraphContainer.attr('width', graphDimensions.width + 100);
  var xCenterOffset = graphDimensions.width / 2;
  svgGraphContainer.attr('transform', 'translate(' + xCenterOffset + ', 20)');
  svgGraphContainer.attr('height', graphDimensions.height + 100);
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
