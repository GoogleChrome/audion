/// <reference path="../utils/Types.ts" />
/// <reference path="Types.ts" />

import {Subject} from 'rxjs';
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

    /** @type {Subject<Audion.DevtoolsRequest>} */
    this.requests$ = new Subject();

    chrome.devtools.panels.create('Web Audio', '', 'panel.html', (panel) => {
      panel.onShown.addListener(() => {
        if (this.onShow) {
          this.onShow();
        }
      });
    });

    chrome.runtime.onConnect.addListener((port) => {
      port.onMessage.addListener((value) => this.requests$.next(value));

      const unsubscribe = devtoolsObserver.observe((graph) => {
        port.postMessage(graph);
      });

      port.onDisconnect.addListener(() => {
        unsubscribe();
      });
    });
  }
}
