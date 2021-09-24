/// <reference path="../devtools/Types.ts" />
/// <reference path="../utils/Types.js" />

import {Observer} from '../utils/Observer';

const EMPTY_GRAPH = {
  graph: {value: {width: 0, height: 0}, nodes: [], edges: []},
};
/**
 * Control which graph is observed.
 */
export class GraphSelector {
  /**
   * Create a GraphSelector.
   * @param {object} options
   * @param {GraphMapObserver} options.allGraphsObserver
   */
  constructor({allGraphsObserver}) {
    /** @type {string} */
    this.graphId = '';
    this._select = this.select.bind(this);
    this.select = this._select;

    /** @type {Utils.Observer<string[]>} */
    this.optionsObserver = Observer.transform(allGraphsObserver, (allGraphs) =>
      Object.entries(allGraphs)
        .filter(([key, graphContext]) => graphContext)
        .map(([key]) => key),
    );
    /** @type {Utils.Observer<string>} */
    this.graphIdObserver = Observer.onSubscribe(
      new Observer((onNext, ...args) => {
        this.select = (id) => {
          if (id !== this.graphId) {
            this.graphId = id;
            onNext(id);
          }
        };
        return () => {
          this.select = this._select;
        };
      }),
      () => this.graphId,
    );
    /** @type {Utils.Observer<Audion.GraphContext>} */
    this.graphObserver = Observer.transform(
      Observer.props(
        {id: this.graphIdObserver, allGraphs: allGraphsObserver},
        {
          id: '',
          allGraphs: /** @type {Object<string, Audion.GraphContext>} */ ({}),
        },
      ),
      (value) => value.allGraphs[value.id] || EMPTY_GRAPH,
    );
  }

  /**
   * Select the graph to observe.
   * @param {string} graphId
   */
  select(graphId) {
    this.graphId = graphId;
  }
}

/** @typedef {Object<string, Audion.GraphContext>} GraphMap */

/** @typedef {Utils.Observer<GraphMap>} GraphMapObserver */
