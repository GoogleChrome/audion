import {Observable, combineLatest, BehaviorSubject} from 'rxjs';
import {map, shareReplay, distinctUntilChanged} from 'rxjs/operators';

import {Audion} from '../devtools/Types';

type GraphMap = {[key: string]: Audion.GraphContext};

type GraphMapRX = Observable<GraphMap>;

const EMPTY_GRAPH = {
  graph: {value: {width: 0, height: 0}, nodes: [], edges: []},
} as Audion.GraphContext;

/**
 * Control which graph is observed.
 */
export class GraphSelector {
  options$: Observable<string[]>;
  graphId$: Observable<string>;
  graph$: Observable<Audion.GraphContext>;

  private _graphIdSubject: BehaviorSubject<string>;

  get graphId(): string {
    return this._graphIdSubject.value;
  }

  /**
   * Create a GraphSelector.
   * @param options
   */
  constructor({allGraphs$: allGraphs$}: {allGraphs$: GraphMapRX}) {
    this.options$ = allGraphs$.pipe(
      map((allGraphs) =>
        Object.entries(allGraphs)
          .filter(([key, graphContext]) => graphContext)
          .map(([key]) => key),
      ),
    );

    const graphIdSubject = new BehaviorSubject('');
    this._graphIdSubject = graphIdSubject;
    this.graphId$ = graphIdSubject;

    const props$ = combineLatest({
      id: this.graphId$,
      allGraphs: allGraphs$,
    });

    this.graph$ = props$.pipe(
      map(({id, allGraphs}) => allGraphs[id] || EMPTY_GRAPH),
      distinctUntilChanged(),
      shareReplay(1),
    );
  }

  /**
   * Select the graph to observe.
   * @param graphId
   */
  select(graphId: string) {
    if (graphId !== this.graphId) {
      this._graphIdSubject.next(graphId);
    }
  }
}
