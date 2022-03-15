import {chrome} from '../chrome';
import {Audion} from './Types';

import {Observable} from 'rxjs';
import {
  CounterSubject,
  DebuggerAttachEventController,
  PermissionSubject,
} from './DebuggerAttachEventController';
import {WebAudioDebuggerEvent} from '../chrome/DebuggerWebAudioDomain';

/**
 * @memberof Audion
 * @alias WebAudioEventObserver
 */
export class WebAudioEventObservable extends Observable<Audion.WebAudioEvent> {
  debuggerAttachController: DebuggerAttachEventController;

  /** Does user permit extension to use `chrome.debugger`. */
  permission$: PermissionSubject;
  /** How many subscriptions want to attach to `chrome.debugger`. */
  attachInterest$: CounterSubject;
  /**
   * How many subscriptions want to receive events through
   * `chrome.debugger.onEvent`.
   */
  webAudioEventInterest$: CounterSubject;

  constructor(debuggerAttachController: DebuggerAttachEventController) {
    super((subscriber) => {
      this.debuggerAttachController = debuggerAttachController;
      this.permission$ = debuggerAttachController.permission$;
      this.attachInterest$ = debuggerAttachController.attachInterest$;
      this.webAudioEventInterest$ =
        debuggerAttachController.webAudioEventInterest$;

      const onEvent: Chrome.DebuggerOnEventListener = (
        debuggeeId,
        method: WebAudioDebuggerEvent,
        params,
      ) => {
        subscriber.next({method, params});
      };

      const onDetach = () => {
        // TODO: Show a warning if the DevTools are still open and allow the
        // user to re-attach manually, e.g. by pressing a button.
        // See: https://developer.chrome.com/docs/extensions/reference/debugger/#type-DetachReason
      };

      chrome.debugger.onDetach.addListener(onDetach);
      chrome.debugger.onEvent.addListener(onEvent);

      this.attachInterest$.increment();
      this.webAudioEventInterest$.increment();

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);

        this.attachInterest$.decrement();
        this.webAudioEventInterest$.decrement();
      };
    });
  }
}
