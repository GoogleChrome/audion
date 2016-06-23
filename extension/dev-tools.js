/**
 * This script runs when the dev panel opens. It creates a Web Audio panel.
 * TODO(chizeng): Move tracking the audio graph + modifying the DOM into this
 * file. Panel JS only runs once the user clicks into the Web Audio tab.
 */


/**
 * Handles what happens when the 'Web Audio' panel opens for the first time
 * after the user opens Chrome dev tools.
 * @param {!Window} panelWindow The window object of the panel.
 */
function handlePanelOpenForFirstTime(panelWindow) {
  // This is just a temp hack to verify that we can modify the DOM of the
  // panel from the dev tools script.
  var canaryElement = panelWindow.document.createElement('div');
  canaryElement.innerHTML = 'mark twain';
  panelWindow.document.body.appendChild(canaryElement);
}


/**
 * Handles what happens when the Web Audio panel is created.
 * @param {!ExtensionPanel} extensionPanel The created panel.
 */
function handlePanelCreated(extensionPanel) {
  var callback = function(panelWindow) {
    handlePanelOpenForFirstTime(panelWindow);
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
