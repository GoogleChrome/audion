import {Observable} from 'rxjs';
import {share} from 'rxjs/operators';

import {chrome} from '../chrome';

/**
 * Connect to chrome runtime through an observable.
 * @param requests$ observable of requests to send to devtools extension context
 * @returns observable of messages recevied from devtools extension context
 */
export function connect<S, T>(requests$: Observable<S>): Observable<T> {
  return new Observable<T>((subscriber) => {
    const port = chrome.runtime.connect();

    // Send values pushed by requests$ to devtools context.
    const subjectSubscription = requests$.subscribe({
      next(value) {
        port.postMessage(value);
      },
    });

    // Publish messages from devtools context through returned observable.
    const onMessage: (arg0: any, arg1: Chrome.RuntimePort) => void = (
      message,
    ) => {
      subscriber.next(message);
    };
    const onDisconnect = () =>
      subscriber.error(new Error('chrome.runtime disconnected'));

    port.onMessage.addListener(onMessage);
    port.onDisconnect.addListener(onDisconnect);

    return () => {
      subjectSubscription.unsubscribe();

      port.onMessage.removeListener(onMessage);
      port.onDisconnect.removeListener(onDisconnect);
      port.disconnect();
    };
  }).pipe(share());
}
