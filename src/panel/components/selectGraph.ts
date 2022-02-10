import {
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  Observable,
} from 'rxjs';
import {Audion} from '../../devtools/Types';
import {setElementHTML, setElementText} from './domUtils';

function graphIdTitle(graphId: string) {
  return `unknown (${graphId.slice(-6)})`;
}

function graphTitle(graph: Audion.GraphContext) {
  return `${graph.context.contextType} (${graph.id.slice(-6)})`;
}

function graphTitles(allGraphs: Audion.GraphContextsById): {
  [key: string]: string;
} {
  return Object.entries(allGraphs)
    .map(([id, graph]) => [id, graphTitle(graph)])
    .reduce((accum, [id, title]) => {
      accum[id] = title;
      return accum;
    }, {} as {[key: string]: string});
}

function buttonTitle([graphId, graphTitles]) {
  return graphId
    ? graphTitles[graphId] || graphIdTitle(graphId)
    : '(no recordings)';
}

const dropdownListHTML = function (graphTitles: {
  [graphId: string]: string;
}): string {
  return Object.values(graphTitles)
    .map((title) => `<span>${title}</span>`)
    .join('');
};

function equalTitles(
  previousTitles: {[graphId: string]: string},
  currentTitles: {[graphId: string]: string},
) {
  const previousEntries = Object.entries(previousTitles);
  const currentEntries = Object.entries(currentTitles);
  return (
    previousEntries.length === currentEntries.length &&
    previousEntries.every(([previousKey, previousValue], index) => {
      const [currentKey, currentValue] = currentEntries[index];
      return previousKey === currentKey && previousValue === currentValue;
    })
  );
}

export function renderSelectGraph(
  titleElement$: Observable<HTMLElement>,
  dropdownListElement$: Observable<HTMLElement>,
  graphId$: Observable<string>,
  allGraphs$: Observable<Audion.GraphContextsById>,
) {
  const distinctGraphId$ = graphId$.pipe(distinctUntilChanged());
  const graphTitles$ = allGraphs$.pipe(
    map(graphTitles),
    distinctUntilChanged(equalTitles),
  );
  const graphIdAndTitles$ = combineLatest([distinctGraphId$, graphTitles$]);

  const titleText$ = graphIdAndTitles$.pipe(map(buttonTitle));
  const dropdownListHTML$ = graphTitles$.pipe(map(dropdownListHTML));
  return merge(
    setElementText(titleElement$, titleText$),
    setElementHTML(dropdownListElement$, dropdownListHTML$),
  );
}
