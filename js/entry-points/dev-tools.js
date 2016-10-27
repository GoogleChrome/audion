goog.provide('audion.entryPoints.devTools');


/**
 * The entry point for the dev tools script.
 */
audion.entryPoints.devTools = function() {
  chrome.devtools.panels.create(
      'Web Audio',
      'images/devToolsIcon.png',
      'panel.html',
      goog.nullFunction);
};


audion.entryPoints.devTools();
