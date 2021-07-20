/// <reference path="utils/Types.js" />
/// <reference path="Types.js" />

import {chrome} from './chrome';

/**
 * Manage a devtools panel rendering a graph of a web audio context.
 * @memberof Audion
 * @alias DevtoolsGraphPanel
 */
export class DevtoolsGraphPanel {
  /**
   * Create a DevtoolsGraphPanel.
   * @param {Utils.Observer<Audion.GraphContext>} graphObserver
   */
  constructor(graphObserver) {
    chrome.devtools.panels.create(
      'Web Audio',
      '',
      chrome.runtime.getUrl('panel.html'),
      () => {},
    );

    chrome.runtime.onConnect.addListener((port) => {
      const unsubscribe = graphObserver.observe((graph) => {
        port.postMessage(graph);
      });

      port.onDisconnect.addListener(() => {
        unsubscribe();
      });
    });
  }
}
