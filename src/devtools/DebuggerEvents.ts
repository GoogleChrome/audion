import {filter, map, Observable} from 'rxjs';
import {chrome} from '../chrome';
import {fromChromeEvent} from '../utils/rxChrome';
import {DebuggerAttachEventController} from './DebuggerAttachEventController';
import {Audion} from './Types';

type DebuggerDomain = 'page' | 'webAudio';

interface DebuggerEventsOptions<D extends DebuggerDomain> {
  domain: D;
}

type DebuggerDomainEvent<D extends DebuggerDomain> = D extends 'page'
  ? Audion.PageEvent
  : D extends 'webAudio'
  ? Audion.WebAudioEvent
  : never;

export class DebuggerEventsObservable<
  D extends DebuggerDomain,
> extends Observable<DebuggerDomainEvent<D>> {
  constructor(
    public attachController: DebuggerAttachEventController,
    public options: DebuggerEventsOptions<D>,
  ) {
    super((subscriber) => {
      attachController.attachInterest$.increment();
      attachController[options.domain + 'EventInterest$'].increment();
      const subscription = fromChromeEvent(chrome.debugger.onEvent)
        .pipe(
          map(([debuggeeId, method, params]) => ({method, params})),
          filter(({method}) =>
            method.toLowerCase().startsWith(options.domain.toLowerCase()),
          ),
        )
        .subscribe(subscriber);
      subscription.add(() => {
        attachController.attachInterest$.decrement();
        attachController[options.domain + 'EventInterest$'].decrement();
      });
      return subscription;
    });
  }
}
