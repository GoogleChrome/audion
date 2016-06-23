/**
 * This script controls the functionality and UI for the Web Audio panel in
 * Chrome dev tools.
 * TODO: Move the bulk (maybe all) of the tracking logic to dev-tools.js.
 */


/**
 * @typedef {{
 *   audioParam: string|undefined,
 *   destId: number
 * }} 
 */
var AudioGraphEdge;


/**
 * For now, lets say an audio graph is a mapping from node ID to a mapping from
 * (edge ID -> Edge).
 * @typedef {!Object.<number, !Object.<number, !AudioGraphEdge>>}
 */
var AudioGraph;


/**
 * A mapping from frame ID to audio graph. // TODO: Construct the graph.
 * @type {!Object.<number, !AudioGraph>}
 */
var audioGraphs = {};


/**
 * The container for the graph visualization.
 * @type {!Element}
 */
var graphContainer = document.getElementById('graph');


// Connect with the background page so that it can relay web audio updates to
// this panel.
var backgroundPageConnection = chrome.runtime.connect({
  'name': 'init_dev_panel'
});


/**
 * Appends a row of text to the panel. Mainly used for debugging.
 * @param {string} text The text to add.
 */
function addTextToPanel(text) {
  var container = document.createElement('div');
  container.innerHTML = text;
  document.getElementById('debuggingText').appendChild(container);
};


/**
 * Handles what happens when the tab changes URL location.
 * @param {!Object} message The message indicating the change in page.
 */
function handleTabPageChange(message) {
  addTextToPanel('The page changed. We should reset the audio graph.');
};


/**
 * Handles the creation of a new context.
 * @param {!Object} message The message indicating the update.
 */
function handleNewContext(message) {
  addTextToPanel('AudioContext ' + message['contextId'] + ' created.');
};


/**
 * Handles the creation of a new node.
 * @param {!Object} message The message indicating the update.
 */
function handleAddNode(message) {
  addTextToPanel(message['nodeType'] + ' ' + message['nodeId'] + ' created.');
};


/**
 * Handles the addition of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleAddEdge(message) {
  var text = 'Node ' + message['sourceId'] + ' connected with ';
  if (message['audioParam']) {
    text += 'the ' + message['audioParam'] + ' param of ';
  }
  text += ' node ' + message['destId'] + '.';
  addTextToPanel(text);
};


/**
 * Handles the removal of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleRemoveEdge(message) {
  var text;
  if (message['destId']) {
    // We are removing a specific edge emanating from some node.
    text = 'The edge from node ' + message['sourceId'] + ' to ';
    if (message['audioParam']) {
      text += ' the ' + message['audioParam'] + ' param of ';
    }
    text += 'node ' + message['destId'] + ' was removed.';
  } else {
    // We are removing all the edges from some node.
    text = 'All edges emanating from node ' + message['sourceId'] +
        ' were removed.';
  }
  addTextToPanel(text);
};


backgroundPageConnection.onMessage.addListener(function(message) {
  switch (message['type']) {
    case 'page_changed':
      // The tab's location changed. Reset the stored audio graph.
      handleTabPageChange(message);
      break;
    case 'new_context':
      // A new AudioContext has been created.
      handleNewContext(message);
      break;
    case 'add_node':
      // A node has been added to the audio graph.
      handleAddNode(message);
      break;
    case 'add_edge':
      // An edge has been added to the audio graph.
      handleAddEdge(message);
      break;
    case 'remove_edge':
      // An edge has been removed from the audio graph.
      handleRemoveEdge(message);
      break;
  }
});


// Indicate to the background page that the dev panel can now receive messages.
backgroundPageConnection.postMessage({
    'type': 'listeners_ready',
    'inspectedTabId': chrome.devtools.inspectedWindow.tabId
  });
