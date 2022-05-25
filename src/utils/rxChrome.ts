import {Observable} from 'rxjs';
import {chrome} from '../chrome';

/**
 * Create a function that returns an observable that completes when the api
 * calls back.
 * @param method `chrome` api method whose last argument is a callback
 * @param thisArg `this` inside of the method
 * @returns observable that completes when the method is done
 */
export function bindChromeCallback<P extends any[], R extends any[]>(
  method: (...args: [...params: P, callback: (...values: R) => void]) => void,
  thisArg = null,
) {
  return (...args: P) =>
    new Observable<R extends [] ? void : R extends [infer R1] ? R1 : R>(
      (subscriber) => {
        method.call(thisArg, ...args, (...returnValues: R) => {
          if (chrome.runtime.lastError) {
            subscriber.error(chrome.runtime.lastError);
          } else {
            if (returnValues.length === 0) {
              subscriber.next();
            } else if (returnValues.length === 1) {
              subscriber.next(returnValues[0]);
            } else if (returnValues.length > 1) {
              subscriber.next(returnValues as any);
            }
            subscriber.complete();
          }
        });
      },
    );
}
