import {fromEvent, merge, NEVER, Observable} from 'rxjs';
import {map, startWith, switchMap} from 'rxjs/operators';

import {Audion} from '../../devtools/Types';

import {setElementHTML} from './domUtils';
import style from './collectGarbage.css';

/**
 * @returns html representation of the collect garbage icon
 */
function collectGarbageImageHTML(): string {
  return `<span class="${style.collectIcon}"></span>`;
}

/**
 * @param buttonElement$ observable of html elements to listen to events and
 * render a icon in
 * @returns observable of elements when they are modified or actions to be acted
 * on by the extension's devtools context
 */
export function renderCollectGarbage(
  buttonElement$: Observable<HTMLElement>,
): Observable<HTMLElement | Audion.DevtoolsCollectGarbageRequest> {
  // Map clicks to actions to request devtools to collect garbage.
  const collectGarbageAction$ = buttonElement$.pipe(
    switchMap((element) => fromEvent(element, 'click')),
    map(
      () => ({type: 'collectGarbage'} as Audion.DevtoolsCollectGarbageRequest),
    ),
  );

  // Observable that pushs the button icon once and never completes. If the
  // observable completes, setElementHTML will clean up and remove the html.
  const collectGarbageIcon$ = NEVER.pipe(startWith(collectGarbageImageHTML()));

  return merge(
    setElementHTML(buttonElement$, collectGarbageIcon$),
    collectGarbageAction$,
  );
}
