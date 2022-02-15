import {defer, finalize, map, Observable, of, switchMap} from 'rxjs';

export function setElementProperty<
  E extends HTMLElement,
  K extends keyof E,
  T extends E[K],
>(property: K) {
  return function (element$: Observable<E>, property$: Observable<T>) {
    return element$.pipe(
      switchMap((view) =>
        property$.pipe(
          map((value) => {
            if (view) {
              view[property] = value;
            }
            return view;
          }),
          finalize(() => {
            if (view) {
              view[property] = null;
            }
          }),
        ),
      ),
    );
  };
}

export const setElementText = setElementProperty('innerText');

export const setElementHTML = setElementProperty('innerHTML');

export function querySelector(
  query: string,
  dom: {querySelector(...args: any): any} = document,
): Observable<HTMLElement> {
  return defer(() => of(dom.querySelector(query)));
}
