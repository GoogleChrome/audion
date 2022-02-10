import {Observable} from 'rxjs';

import {Utils} from './Types';

export function toRX<T>(observer: Utils.Observer<T>): Observable<T> {
  return new Observable((subscriber) =>
    observer.observe(
      (value) => subscriber.next(value),
      () => subscriber.complete(),
      (err) => subscriber.error(err),
    ),
  );
}
