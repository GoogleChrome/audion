/// <reference path="../chrome/DebuggerWebAudioDomain.js" />
/// <reference path="Types.js" />

import {chrome} from '../chrome';
import {ChromeDebuggerWebAudioDomain} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';

const debuggerVersion = '1.3';
const {tabId} = chrome.devtools.inspectedWindow;

/**
 * @memberof Audion
 * @extends {Observer<Audion.WebAudioEvent>}
 * @alias WebAudioEventObserver
 */
export class WebAudioEventObserver extends Observer {
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
      const onDetach = ({tabId}, detachReason) => {
        // TODO: Show a warning if the DevTools are still open and allow the
        // user to re-attach manually, e.g. by pressing a button.
        // See: https://developer.chrome.com/docs/extensions/reference/debugger/#type-DetachReason
      };
      const onNavigated = () => {
        chrome.debugger.sendCommand(
          {tabId},
          ChromeDebuggerWebAudioDomain.Methods.enable,
        );
      };

      chrome.debugger.attach({tabId}, debuggerVersion, () => {
        chrome.debugger.sendCommand(
          {tabId},
          ChromeDebuggerWebAudioDomain.Methods.enable,
        );
      });
      chrome.debugger.onDetach.addListener(onDetach);
      chrome.debugger.onEvent.addListener(onEvent);
      chrome.devtools.network.onNavigated.addListener(onNavigated);

      return () => {
        chrome.debugger.onDetach.removeListener(onDetach);
        chrome.debugger.onEvent.removeListener(onEvent);
        chrome.devtools.network.onNavigated.removeListener(onNavigated);
        chrome.debugger.sendCommand(
          {tabId},
          ChromeDebuggerWebAudioDomain.Methods.disable,
        );
        chrome.debugger.detach({tabId}, () => {});
      };
    });
  }
}
