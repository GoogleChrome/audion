import {chrome} from '../chrome';
import {Observer} from '../utils/Observer';
import {
  CounterSubject,
  DebuggerAttachEventController,
  PermissionSubject,
} from './DebuggerAttachEventController';
import {Audion} from './Types';

/**
 * @memberof Audion
 * @alias WebAudioEventObserver
 */
export class WebAudioEventObserver extends Observer<Audion.WebAudioEvent> {
  debuggerAttachController: DebuggerAttachEventController;

  /** Does user permit extension to use `chrome.debugger`. */
  permission: PermissionSubject;
  /** How many subscriptions want to attach to `chrome.debugger`. */
  attachInterest: CounterSubject;
  /**
   * How many subscriptions want to receive events through
   * `chrome.debugger.onEvent`.
   */
  eventInterest: CounterSubject;

  /**
   * Observe WebAudio events from chrome.debugger.
   * @param debuggerAttachController
   */
  constructor(debuggerAttachController: DebuggerAttachEventController) {
    super((onNext, ...args) => {
      /**
       * @param {Chrome.DebuggerDebuggee} debuggeeId
       * @param {ChromeDebuggerWebAudioDomain.EventName} method
       * @param {ChromeDebuggerWebAudioDomain.Event} params
       */
      const onEvent = (debuggeeId, method, params) => {
        onNext({method, params});
      };
      const onDetach = () => {
        // TODO: Show a warning if the DevTools are still open and allow the
        // user to re-attach manually, e.g. by pressing a button.
        // See: https://developer.chrome.com/docs/extensions/reference/debugger/#type-DetachReason
      };

      chrome.debugger.onDetach.addListener(onDetach);
      chrome.debugger.onEvent.addListener(onEvent);

      this.attachInterest.increment();
      this.eventInterest.increment();

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);

        this.eventInterest.decrement();
        this.attachInterest.decrement();
      };
    });

    this.debuggerAttachController = debuggerAttachController;

    this.permission = debuggerAttachController.permission$;
    this.attachInterest = debuggerAttachController.attachInterest$;
    this.eventInterest = debuggerAttachController.webAudioEventInterest$;
  }

  /**
   * Attaches the chrome.debugger to start observing events.
   */
  attach() {
    this.permission.grantTemporary();
  }
}
