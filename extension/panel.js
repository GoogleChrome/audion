/**
 * This script updates the UI of the Web Audio panel based on the audio graph
 * stored in dev tools.
 */


/**
 * Handles a request to redraw the audio graph, perhaps for instance after an
 * update to the graph.
 */ 
function handleRequestGraphRedraw(message) {
  // TODO: Redraw the graph using the global audioGraph variable, which
  // stores a graphlib.Graph.
}



/**
 * Handles what happens if web audio updates occurred before the dev tools
 * instance opened.
 */ 
function handleMissingAudioUpdates(message) {
  document.getElementById('warningMessage').innerHTML =
      'This visualization ignores web audio updates before dev tools opened. ' +
      'Refresh to track a comprehensive graph.';
}


/**
 * Handles what happens when the page within the tab changes.
 */ 
function handlePageChangeWithinTab(message) {
  // Clear all warnings. We basically begin with a new clean slate.
  document.getElementById('warningMessage').innerHTML = '';
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
      handlePageChangeWithinTab(message);
      break;
    case 'redraw_graph':
      handleRequestGraphRedraw(message);
      break;
  }
});
