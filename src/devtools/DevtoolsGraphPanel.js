/// <reference path="../utils/Types.js" />
/// <reference path="Types.js" />

import dagre from 'dagre';

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
   * @param {Utils.Observer<Audion.GraphContext>} graphObserver
   */
  constructor(graphObserver) {
    chrome.devtools.panels.create('Web Audio', '', 'panel.html', () => {});

    chrome.runtime.onConnect.addListener((port) => {
      const unsubscribe = graphObserver.observe((graph) => {
        if (graph.graph) {
          port.postMessage({
            ...graph,
            graph: dagre.graphlib.json.write(graph.graph),
          });
        } else {
          port.postMessage(graph);
        }
      });

      port.onDisconnect.addListener(() => {
        unsubscribe();
      });
    });
  }
}
