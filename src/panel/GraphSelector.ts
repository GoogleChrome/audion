import {Observable, merge} from 'rxjs';
import {map, shareReplay, scan} from 'rxjs/operators';

import {Audion} from '../devtools/Types';

import {Utils} from '../utils/Types';
import {Observer} from '../utils/Observer';
import {toRX} from '../utils/rxInterop';

type GraphMap = {[key: string]: Audion.GraphContext};

type GraphMapRX = Observable<GraphMap>;

type GraphMapObserver = Utils.Observer<GraphMap>;

const EMPTY_GRAPH = {
  graph: {value: {width: 0, height: 0}, nodes: [], edges: []},
} as Audion.GraphContext;

/**
 * Control which graph is observed.
 */
export class GraphSelector {
  graphId: string;
  _select: (graphId: string) => void;
  optionsObserver: Utils.Observer<string[]>;
  optionsObserver$: Observable<string[]>;
  graphIdObserver: Utils.Observer<string>;
  graphIdObserver$: Observable<string>;
  propsObserver: Utils.Observer<{
    id: string;
    allGraphs: Audion.GraphContextsById;
  }>;
  graphObserver: Utils.Observer<Audion.GraphContext>;
  graphObserver$: Observable<Audion.GraphContext>;

  /**
   * Create a GraphSelector.
   * @param options
   * @param options.allGraphsObserver
   * @param options.allGraphsObserver$
   */
  constructor({
    allGraphsObserver,
    allGraphsObserver$,
  }: {
    allGraphsObserver: GraphMapObserver;
    allGraphsObserver$: GraphMapRX;
  }) {
    this.graphId = '';
    this._select = this.select.bind(this);
    this.select = this._select;

    this.optionsObserver = Observer.transform(allGraphsObserver, (allGraphs) =>
      Object.entries(allGraphs)
        .filter(([key, graphContext]) => graphContext)
        .map(([key]) => key),
    );
    this.optionsObserver$ = map((allGraphs) =>
      Object.entries(allGraphs)
        .filter(([key, graphContext]) => graphContext)
        .map(([key]) => key),
    )(allGraphsObserver$);

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
    const latest$ = new Observable<string>((subscriber) => {
      subscriber.next(this.graphId);
      subscriber.complete();
    });
    const gio$ = new Observable<string>((subscriber) => {
      this.select = (id) => {
        if (id !== this.graphId) {
          this.graphId = id;
          subscriber.next(id);
        }
      };
      return () => {
        this.select = this._select;
      };
    });
    // this.graphIdObserver$ = concat(latest$, gio$.pipe(share()));
    this.graphIdObserver$ = toRX(this.graphIdObserver).pipe(shareReplay(1));

    this.propsObserver = Observer.props(
      {id: this.graphIdObserver, allGraphs: allGraphsObserver},
      {
        id: '',
        allGraphs: {} as GraphMap,
      },
    );
    this.graphObserver = Observer.transform(
      Observer.props(
        {id: this.graphIdObserver, allGraphs: allGraphsObserver},
        {
          id: '',
          allGraphs: {} as GraphMap,
        },
      ),
      (value) => value.allGraphs[value.id] || EMPTY_GRAPH,
    ) as any;
    this.graphObserver$ = merge(
      this.graphIdObserver$.pipe(map((value) => ({id: value}))),
      allGraphsObserver$.pipe(map((value) => ({allGraphs: value}))),
    ).pipe(
      scan((accum, value) => ({...accum, ...value}), {
        id: '',
        allGraphs: {} as GraphMap,
      }),
      map(({id, allGraphs}) => allGraphs[id] || EMPTY_GRAPH),
      shareReplay(1),
    );
    // this.graphObserver$ = zip(this.graphIdObserver$, allGraphsObserver$).pipe(
    //   map(([id, allGraphs]) => ({id, allGraphs})),
    //   startWith({id: '', allGraphs: {}}),
    //   map(({id, allGraphs}) => allGraphs[id] || EMPTY_GRAPH),
    // );
  }

  /**
   * Select the graph to observe.
   * @param graphId
   */
  select(graphId: string) {
    this.graphId = graphId;
  }
}

/** @typedef {Object<string, Audion.GraphContext>} GraphMap */

/** @typedef {Utils.Observer<GraphMap>} GraphMapObserver */
