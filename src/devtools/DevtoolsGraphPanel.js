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
   */
  constructor() {
    this.onShow = null;

    chrome.devtools.panels.create('Web Audio', '', 'panel.html', (panel) => {
      panel.onShown.addListener(() => {
        if (this.onShow) {
          this.onShow();
        }
      });
    });
  }

  /**
   * Connects the DevtoolsObserver to the Chrome Runtime.
   * @param {Audion.DevtoolsObserver} devtoolsObserver
   */
  connect(devtoolsObserver) {
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
