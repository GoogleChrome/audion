/// <reference path="../utils/Types.js" />
/// <reference path="Types.js" />

import {chrome} from '../chrome';

/**
 * Manage a devtools panel rendering a graph of a web audio context.
 *
 * @memberof Audion
 * @alias DevtoolsGraphPanel
 */
export class DevtoolsGraphPanel {
  /**
   * Create a DevtoolsGraphPanel.
   * @param {Audion.DevtoolsObserver} devtoolsObserver
   */
  constructor(devtoolsObserver) {
    chrome.devtools.panels.create('Web Audio', '', 'panel.html', () => {});

    chrome.runtime.onConnect.addListener((port) => {
      const unsubscribe = devtoolsObserver.observe((graph) => {
        port.postMessage(graph);
      });

      port.onDisconnect.addListener(() => {
        unsubscribe();
      });
    });
  }
}
