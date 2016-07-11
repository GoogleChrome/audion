/**
 * This script updates the UI of the Web Audio panel based on the audio graph
 * stored in dev tools.
 */


/**
 * Controls the pane for say examining AudioNodes.
 * @type {!PaneController}
 */
var paneController = new PaneController();

// When the pane closes, tell the dev panel to clear the active AudioNode.
paneController.setOnPaneCloseFunction(function() {
  // Tell the dev panel to stop highlighting this node by sending a
  // update_active_audio_node message that lacks a graphNodeId property.
  postToPanelWindow({
      type: 'update_active_audio_node',
    });
});


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


// Allow the user to zoom via mouse wheel.
var zoomListener = d3.behavior.zoom().on('zoom', handleZoom);
svgGraphContainer.call(zoomListener);


// Allow the user to inspect nodes by clicking them.
svgGraphContainer.on('click', handleClickOnGraphContainer);


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
 * Posts a message to this panel window. Assumes that it is open. The dev-tools
 * script will listen to messages posed to the panel window.
 * @param {!Object} message The message to post.
 */
function postToPanelWindow(message) {
  window.postMessage(message, window.location.origin || '*');
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
 * Handles a click event on the graph container.
 */
function handleClickOnGraphContainer() {
  // Keep climbing the DOM tree til we hit an interesting element, ie a node.
  var thingClickedOn = d3.event.target;
  while (thingClickedOn && this != thingClickedOn) {
    var data = d3.select(thingClickedOn).data();
    if (!(data && data.length == 1)) {
      // We do not know if the user clicked on something interesting yet.
      continue;
    }
    var graphNodeId = data[0];
    var node = audioGraph.node(graphNodeId);
    if (node) {
      // The user clicked on a node.
      postToPanelWindow({
        type: 'update_active_audio_node',
        graphNodeId: graphNodeId
      });
      break;
    }
    thingClickedOn = thingClickedOn.parentElement;
  }
}


/**
 * The dev panel had updated the active AudioNode (the one being inspected).
 * Take care of any changes.
 * @param {!Object} message
 */
function handleAudioNodeUpdatedByDevPanel(message) {
  if (message.audioNodeData) {
    // The pane should highlight an AudioNode node.
    paneController.highlightAudioNode(message.audioNodeData);
  } else {
    // The pane is highlighting no AudioNode. Hide it.
    paneController.hidePane();
  }
}


/**
 * Applies a scale and a translate to the inner SVG element of the graph.
 * @param {number} scale
 * @param {number} translate
 */
function scaleAndTranslateGraph(scale, translate) {
  svgGraphInnerContainer.attr(
      'transform',
      'translate(' + translate + ')' + 'scale(' + scale + ')'
    );
}


/**
 * Does graph layout and then renders the graph.
 */
function layoutAndDrawGraph() {
  // Remove the scaling if we had one. Compute graph dimensions assuming scaling
  // 1. We re-apply the scaling later.
  scaleAndTranslateGraph(1, lastTranslateValue);
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
  scaleAndTranslateGraph(lastScaleValue, lastTranslateValue);
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
    case 'active_audio_node_updated':
      handleAudioNodeUpdatedByDevPanel(message);
      break;
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
