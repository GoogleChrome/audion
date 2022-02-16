/// <reference path="../utils/Types.ts" />
/// <reference path="Types.ts" />

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
    this.onShow = null;

    chrome.devtools.panels.create('Web Audio', '', 'panel.html', (panel) => {
      panel.onShown.addListener(() => {
        if (this.onShow) {
          this.onShow();
        }
      });
    });

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
