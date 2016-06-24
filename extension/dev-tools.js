/**
 * This script runs when the dev panel opens. It creates a Web Audio panel. It
 * owns (keeps up to date) the audio graph and controls the UI based on updates.
 */


/**
 * Creates an empty audio graph.
 * @return {!dagreD3.graphlib.Graph}
 */
function createEmptyAudioGraph() {
  return new dagreD3.graphlib.Graph({
        compound: true,
        multigraph: true
      })
      .setGraph({})
      .setDefaultEdgeLabel(function() {return {};});
};


/**
 * The updated audio graph.
 * @type {!Object}
 */
var audioGraph = createEmptyAudioGraph();


/**
 * Whether web audio updates occurred before this dev tools instance opened.
 * @type {boolean}
 */
var missingUpdates = false;


/**
 * The window of the panel. Non-null if the panel had shown at least once.
 * @type {?Window}
 */
var panelWindow = null;


/**
 * Whether the panel is currently shown.
 * @type {boolean}
 */
var panelShown = false;


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
 * Posts a message to the panel window. Assumes that it is open.
 * @param {!Object} message The message to post.
 */
function postToPanelWindow(message) {
  panelWindow.postMessage(message, panelWindow.location.origin || '*');
}


/**
 * If the panel window is open, requests the panel to redraw the audio graph,
 * which is stored within the audioGraph global variable within the panel JS
 * namespace. Does nothing if the panel window is hidden.
 */
function requestGraphRedraw() {
  if (panelShown) {
    postToPanelWindow({
      'type': 'redraw_graph'
    });
  }
}


/**
 * Handles what happens when the tab changes URL location.
 * @param {!Object} message The message indicating the change in page.
 */
function handleTabPageChange(message) {
  // Clear all audio graphs.
  audioGraph = createEmptyAudioGraph();
  if (panelWindow) {
    // Update the panel's audio graph reference to this new, reset one. 
    panelWindow.audioGraph = audioGraph;

    // Tell the panel that the page had been reset.
    postToPanelWindow({
      'type': 'page_changed'
    });
  }
  requestGraphRedraw();
};


/**
 * Handles the creation of a new context.
 * @param {!Object} message The message indicating the update.
 */
function handleNewContext(message) {
  // TODO: ... do something. :)
};


/**
 * Handles the creation of a new node.
 * @param {!Object} message The message indicating the update.
 */
function handleAddNode(message) {
  // TODO: Update graph.
  requestGraphRedraw();
};


/**
 * Handles the addition of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleAddEdge(message) {
  // TODO: Update graph.
  requestGraphRedraw();
};


/**
 * Handles the removal of an edge.
 * @param {!Object} message The message indicating the update.
 */
function handleRemoveEdge(message) {
  // TODO: Update graph.
  requestGraphRedraw();
};


/**
 * Note that the dev tools instance is missing some prior web audio updates.
 */
function handleMissingUpdates(message) {
  missingUpdates = true;
}


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
    case 'missing_updates':
      // This dev tools instance has missed some prior audio graph updates. The
      // visualized audio graph may be incomplete. The user may want to refresh.
      handleMissingUpdates(message);
      break;
  }
});


// Indicate to the background page that the dev panel can now receive messages.
backgroundPageConnection.postMessage({
    'type': 'listeners_ready',
    'inspectedTabId': chrome.devtools.inspectedWindow.tabId
  });


/**
 * Handles what happens when the 'Web Audio' panel opens for the first time
 * after the user opens Chrome dev tools.
 * @param {!Window} panelWindow The window object of the panel.
 */
function handlePanelOpenForFirstTime(localPanelWindow) {
  if (missingUpdates) {
    // Tell the panel to warn the user about missing audio updates that occurred
    // before the dev tools instance was opened.
    postToPanelWindow({
      'type': 'missing_updates'
    });
  }
}


/**
 * Handles what happens whenever the panel is shown (user tabs into it).
 */
function handlePanelShown(localPanelWindow) {
  // Store a reference to the panel window every time it opens.
  panelWindow = localPanelWindow;
  panelShown = true;

  // Store a reference in the panel window (global to panel) to the audio graph
  // in this (dev tools) global namespace.
  panelWindow.audioGraph = audioGraph;

  // Request a redraw when the panel is shown.
  // TODO: Only do this when necessary.
  requestGraphRedraw();
}


/**
 * Handles what happens whenever the panel is hidden.
 */
function handlePanelHidden() {
  panelShown = false;
}


/**
 * Handles what happens when the Web Audio panel is created.
 * @param {!ExtensionPanel} extensionPanel The created panel.
 */
function handlePanelCreated(extensionPanel) {
  extensionPanel.onShown.addListener(handlePanelShown);
  extensionPanel.onHidden.addListener(handlePanelHidden);

  var callback = function(localPanelWindow) {
    // Run a callback on the first time that the panel is shown.
    handlePanelOpenForFirstTime(localPanelWindow);
    extensionPanel.onShown.removeListener(callback);
  };
  extensionPanel.onShown.addListener(callback);
}


chrome.devtools.panels.create(
    'Web Audio',
    // TODO: Think of an icon ... where does this icon even appear?!
    'images/temporaryIcon48.png',
    'panel.html',
    handlePanelCreated);
