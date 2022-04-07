import {fromEvent, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

export function mapThruWorker<T2>(worker: Worker) {
  return <T1>(source: Observable<T1>) => {
    const messages = fromEvent<MessageEvent<T2>>(worker, 'message').pipe(
      map(({data}) => data),
    );
    return new Observable<T2>((subscriber) => {
      const subscription = new Subscription();
      subscription.add(messages.subscribe(subscriber));
      subscription.add(
        source.subscribe({
          next(value) {
            worker.postMessage(value);
          },
        }),
      );
      return subscription;
    });
  };
}
