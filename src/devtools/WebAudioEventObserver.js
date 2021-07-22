/// <reference path="../chrome/DebuggerWebAudio.js" />
/// <reference path="Types.js" />

import {chrome} from '../chrome';
import {ChromeDebuggerWebAudio} from '../chrome/DebuggerWebAudio';
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
       * @param {string} debuggeeId
       * @param {ChromeDebuggerWebAudio.EventName} method
       * @param {ChromeDebuggerWebAudio.Event} params
       */
      const onEvent = (debuggeeId, method, params) => {
        onNext({method, params});
      };

      chrome.debugger.attach({tabId}, debuggerVersion, () => {});
      chrome.debugger.sendCommand(
        {tabId},
        ChromeDebuggerWebAudio.Methods.enable,
      );
      chrome.debugger.onEvent.addListener(onEvent);

      return () => {
        chrome.debugger.onEvent.removeListener(onEvent);
        chrome.debugger.sendCommand(
          {tabId},
          ChromeDebuggerWebAudio.Methods.disable,
        );
        chrome.debugger.detach({tabId}, () => {});
      };
    });
  }
}
