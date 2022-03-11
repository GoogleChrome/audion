import {Observable} from 'rxjs';

import {Observer} from './Observer';
import {Utils} from './Types';

/**
 * Wrap a `Utils.Observer` instance with `rxjs.Observable` instance.
 *
 * This is a workaround so `rxjs.Observable` can use `Utils.Observer` as a source
 * until said `Observer` instances can be replaced with `Observable` instances.
 *
 * @param observer observer to wrap
 * @returns observable wrapping an observer
 */
export function toRX<T>(observer: Utils.Observer<T>): Observable<T> {
  return new Observable((subscriber) =>
    observer.observe(
      (value) => subscriber.next(value),
      () => subscriber.complete(),
      (err) => subscriber.error(err),
    ),
  );
}

export function toUtilsObserver<T>(
  observable: Observable<T>,
): Utils.Observer<T> {
  return new Observer((next, complete, error) => {
    const subscription = observable.subscribe({next, complete, error});
    return () => {
      subscription.unsubscribe();
    };
  });
}
