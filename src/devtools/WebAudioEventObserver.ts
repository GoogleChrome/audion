import {chrome} from '../chrome';
import {Methods} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';

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
        chrome.debugger.attach({tabId}, debuggerVersion, () => {
          chrome.debugger.sendCommand({tabId}, Methods.enable);
        });
      };
      const onNavigated = () => {
        chrome.debugger.sendCommand({tabId}, Methods.enable);
      };

      chrome.debugger.attach({tabId}, debuggerVersion, () => {
        chrome.debugger.sendCommand({tabId}, Methods.enable);
      });
      chrome.debugger.onDetach.addListener(onDetach);
      chrome.debugger.onEvent.addListener(onEvent);
      chrome.devtools.network.onNavigated.addListener(onNavigated);

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);
        chrome.devtools.network.onNavigated.removeListener(onNavigated);
        chrome.debugger.sendCommand({tabId}, Methods.disable);
        chrome.debugger.detach({tabId}, () => {});
      };
    });
  }
}
