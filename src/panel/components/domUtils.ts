import {defer, Observable, of} from 'rxjs';
import {finalize, map, scan, switchMap} from 'rxjs/operators';

/**
 * Create a factory that modifies the most latest element from an observable of elements to value from an observable of other values.
 * @param property html element property
 * @returns factory that modifies a latest element with the latest data
 */
export function setElementProperty<
  E extends HTMLElement,
  K extends keyof E,
  T extends E[K],
>(property: K) {
  return function (element$: Observable<E>, data$: Observable<T>) {
    return element$.pipe(
      switchMap((view) =>
        data$.pipe(
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

/**
 * Set that values can be added to and removed from.
 */
interface PropertySet<T> {
  add(value: T): any;
  remove(value: T): any;
}

/**
 * Description of a change to a PropertySet.
 */
interface PropertySetChange {
  /** Items to remove from the PropertySet. */
  deleteItems: string[];
  /** Items to add to the PropertySet. */
  addItems: string[];
  /** All items to remove if the element changes or finalizes. */
  allItems: string[];
}

/**
 * Create a factory that adds and removes the items contained in a observable of
 * array values to the latest element.
 * @param property html element property
 * @returns factory that adds and removes items on an elements property
 */
export function toggleElementPropertySet<
  E extends HTMLElement,
  K extends {
    [key in keyof E]: E[key] extends PropertySet<string> ? key : never;
  }[any],
  T extends string[],
>(property: K) {
  return function (element$: Observable<E>, data$: Observable<T>) {
    const valueDiff$ = data$.pipe(
      scan(
        ([previous], current) => {
          const allItems = current;
          const deleteItems = previous.filter(
            (value) => !current.includes(value),
          );
          const addItems = allItems.filter(
            (value) => !previous.includes(value),
          );

          return [current, {deleteItems, addItems, allItems}] as [
            T,
            PropertySetChange,
          ];
        },
        [[], {deleteItems: [], addItems: []}] as [T, PropertySetChange],
      ),
      map(([, change]) => change),
    );
    return element$.pipe(
      switchMap((view) =>
        valueDiff$.pipe(
          map((diff) => {
            if (view) {
              for (const value of diff.deleteItems) {
                (view[property] as PropertySet<string>).remove(value);
              }
              for (const value of diff.addItems) {
                (view[property] as PropertySet<string>).add(value);
              }
            }
            return view;
          }),
          finalize(() => {}),
        ),
      ),
    );
  };
}

/**
 * Change to a html element property's map structure.
 */
interface PropertyMapChange {
  /** Keys to remove from the property's map. */
  deleteKeys: string[];
  /** Keys to change to a given value. */
  setKeys: [string, any][];
  /** All keys. Used to remove all keys when the element changes or finalizes. */
  allKeys: string[];
}

export function assignElementProperty<
  E extends HTMLElement,
  K extends keyof E,
  T extends {[key in keyof E[K]]?: E[K][key]},
>(property: K) {
  return function (element$: Observable<E>, data$: Observable<T>) {
    const valueDiff$ = data$.pipe(
      scan(
        ([previous], current) => {
          const allKeys = Object.keys(current);
          const deleteKeys = Object.keys(previous).filter(
            (key) => !(key in current),
          );
          const setKeys = allKeys
            .filter((key) => current[key] !== previous[key])
            .map((key) => [key, current[key]]);

          return [current, {deleteKeys, setKeys, allKeys}] as [
            T,
            PropertyMapChange,
          ];
        },
        [{}, {deleteKeys: [], setKeys: []}] as [T, PropertyMapChange],
      ),
      map(([, change]) => change),
    );
    return element$.pipe(
      switchMap((view) => {
        let finalizeKeys = [];
        return valueDiff$.pipe(
          map((diff) => {
            if (view) {
              for (const key of diff.deleteKeys) {
                view[property][key] = undefined;
              }
              for (const [key, value] of diff.setKeys) {
                view[property][key] = value;
              }
              finalizeKeys = diff.allKeys;
            }
            return view;
          }),
          finalize(() => {
            if (view) {
              for (const key of finalizeKeys) {
                view[property][key] = undefined;
              }
            }
          }),
        );
      }),
    );
  };
}

/**
 * Set latest element's innerText property to latest data string value.
 */
export const setElementText = setElementProperty('innerText');

/**
 * Set latest element's innerHTML property to latest data string value.
 */
export const setElementHTML = setElementProperty('innerHTML');

/**
 * Set latest element's className property to latest data string value.
 */
export const setElementClassName = setElementProperty('className');

/**
 * Add and remove latest data string array to latest element's classList set
 * property.
 */
export const toggleElementClassList = toggleElementPropertySet('classList');

/**
 * Set and delete changes keys of latest data object to latest element's style
 * object map property.
 */
export const assignElementStyle = assignElementProperty('style');

/**
 * @param query css query selector to find an element for
 * @param dom document to query
 * @returns observable of a html element matching the query
 */
export function querySelector(
  query: string,
  dom: {querySelector(...args: any): any} = document,
): Observable<HTMLElement> {
  return defer(() => of(dom.querySelector(query)));
}
