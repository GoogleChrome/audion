import {chrome} from '../chrome';
import {Methods} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';
import {Audion} from './Types';

const debuggerVersion = '1.3';
const {tabId} = chrome.devtools.inspectedWindow;

/**
 * @memberof Audion
 * @alias WebAudioEventObserver
 */
export class WebAudioEventObserver extends Observer<Audion.WebAudioEvent> {
  /**
   * Observe WebAudio events from chrome.debugger.
   */
  constructor() {
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

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);
        chrome.debugger.sendCommand({tabId}, Methods.disable);
        chrome.debugger.detach({tabId}, () => {});
      };
    });
  }

  /** Attaches the chrome.debugger to start observing events. */
  attach() {
    chrome.debugger.attach({tabId}, debuggerVersion, () => {
      chrome.debugger.sendCommand({tabId}, Methods.enable);
    });
  }
}
