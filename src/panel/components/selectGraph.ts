import {
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
  Observable,
  of,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';

import {Audion} from '../../devtools/Types';
import {
  assignElementStyle,
  setElementClassName,
  setElementHTML,
  setElementText,
  toggleElementClassList,
} from './domUtils';
import style from './selectGraph.css';

/**
 * Title of the dropdown toggle button when no graphs are selected or available
 * to select.
 */
const NO_GRAPHS_AVAILABLE_TITLE = '(no recordings)';

/**
 * Render title for an audio graph with only the graphId.
 * @param graphId unique graph identifier
 * @returns rendered graph title
 */
function graphIdTitle(graphId: string) {
  return `unknown (${graphId.slice(-6)})`;
}

/**
 * Render title for an audio graph.
 * @param graph
 * @returns rendered graph title
 */
function graphTitle(graph: Audion.GraphContext) {
  return `${graph.context.contextType} (${graph.id.slice(-6)})`;
}

/**
 * Create a map of graph IDs to rendered graph titles.
 * @param allGraphs map of graph IDs to graph contexts
 * @returns map of graph IDs to rendered graph titles
 */
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

/**
 * Render current graph title or some copy to indicate no graph is selected or
 * no graph is available.
 * @param param currently selected graph ID and ID to title map
 * @returns rendered button title text
 */
function buttonTitle([graphId, graphTitles]) {
  return graphId
    ? graphTitles[graphId] || graphIdTitle(graphId)
    : NO_GRAPHS_AVAILABLE_TITLE;
}

/**
 * Render html list of graph options to select from.
 * @param graphTitles graph ID to title map
 * @returns html list of graph titles to select from
 */
const dropdownListHTML = function (graphTitles: {
  [graphId: string]: string;
}): string {
  return Object.entries(graphTitles)
    .map(
      ([graphId, title]) =>
        `<div class="${style.dropdownOption}" data-option="${graphId}"><div class="${style.dropdownOptionTitle}">${title}</div></div>`,
    )
    .join('');
};

/**
 * Test if two maps of graph titles are equivalent.
 *
 * Used to reduce further processing of graph title information like updating
 * the dom with new html for the new set of titles.
 *
 * @param previousTitles map of graph titles
 * @param currentTitles map of graph titles
 * @returns true if maps match
 */
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

/**
 * Render a widget displaying the current selected graph title. When clicked
 * show a list of currently available graphs to select from.
 *
 * @param titleElement$ current html element to render dropdown button
 * title into
 * @param dropdownListElement$ current html element to render dropdown
 * list into
 * @param buttonElement$ current html element that when clicked opens the dropdown
 * @param graphId$ currently selected graph id
 * @param allGraphs$ current map of graph ids to graph contexts
 * @returns an element pushed to renderSelectGraph after its content is modified
 */
export function renderSelectGraph(
  titleElement$: Observable<HTMLElement>,
  dropdownListElement$: Observable<HTMLElement>,
  buttonElement$: Observable<HTMLElement>,
  graphId$: Observable<string>,
  allGraphs$: Observable<Audion.GraphContextsById>,
) {
  const distinctGraphId$ = graphId$.pipe(distinctUntilChanged());
  const graphTitles$ = allGraphs$.pipe(
    map(graphTitles),
    distinctUntilChanged(equalTitles),
  );
  const graphIdAndTitles$ = combineLatest([distinctGraphId$, graphTitles$]);

  const dropdownVisible$ = new BehaviorSubject(false);

  const body$ = of(document.body);
  const bodyClick$ = body$.pipe(
    switchMap((element) => fromEvent(element, 'click')),
  );

  const openDropdownAction$ = buttonElement$.pipe(
    switchMap((element) => fromEvent(element, 'click')),
    tap(() => dropdownVisible$.next(!dropdownVisible$.value)),
    filter(() => false),
    map(() => {}),
  );
  const closeDropdownAction$ = combineLatest([
    buttonElement$,
    dropdownListElement$,
  ]).pipe(
    switchMap(([buttonElement, dropdownElement]) =>
      bodyClick$.pipe(
        filter(
          (ev) =>
            ev.target instanceof Element &&
            !(
              buttonElement.contains(ev.target) ||
              dropdownElement.contains(ev.target)
            ),
        ),
      ),
    ),
    tap(() => dropdownVisible$.next(false)),
    filter(() => false),
    map(() => {}),
  );

  const eventAction$ = merge(openDropdownAction$, closeDropdownAction$);

  const titleText$ = graphIdAndTitles$.pipe(map(buttonTitle));
  const buttonClassName$ = dropdownVisible$.pipe(
    map((visible) => (visible ? [style.dropdownButtonActive] : [])),
  );
  const dropdownListHTML$ = graphTitles$.pipe(map(dropdownListHTML));
  const dropdownListIdSelected$ = dropdownListElement$.pipe(
    switchMap((element) => fromEvent(element, 'click')),
    map((clickEvent) => {
      let {target} = clickEvent;
      if (target instanceof HTMLElement) {
        const optionElement = target.closest('[data-option]');
        if (optionElement instanceof HTMLElement) {
          const graphId = optionElement.dataset['option'];
          if (graphId) {
            return {type: 'selectGraph', graphId};
          }
        }
      }
    }),
    filter(Boolean),
    tap(() => dropdownVisible$.next(false)),
  );
  const dropdownClassName$ = dropdownVisible$.pipe(
    map(
      (visible) => `web-audio-select-graph-dropdown ${visible ? '' : 'hidden'}`,
    ),
  );
  const dropdownPositionStyle$ = buttonElement$.pipe(
    switchMap((buttonElement) =>
      dropdownVisible$.pipe(
        map((visible) => {
          const rect = buttonElement.getBoundingClientRect();
          return visible
            ? {
                top: `${rect.bottom}px`,
                left: `${rect.left}px`,
              }
            : {};
        }),
      ),
    ),
  );

  return merge(
    setElementText(titleElement$, titleText$),
    toggleElementClassList(buttonElement$, buttonClassName$),
    setElementHTML(dropdownListElement$, dropdownListHTML$),
    setElementClassName(dropdownListElement$, dropdownClassName$),
    assignElementStyle(dropdownListElement$, dropdownPositionStyle$),
    dropdownListIdSelected$,
    eventAction$,
  );
}
