import {chrome} from '../chrome';
import {Methods} from '../chrome/DebuggerWebAudioDomain';
import {Audion} from './Types';

import {Observable} from 'rxjs';

const debuggerVersion = '1.3';
const {tabId} = chrome.devtools.inspectedWindow;

export const webAudioEvents$: Observable<Audion.WebAudioEvent> = new Observable(
  (subscriber) => {
    const onEvent: Chrome.DebuggerOnEventListener = (
      debuggeeId,
      method,
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

    chrome.debugger.attach({tabId}, debuggerVersion, () => {
      chrome.debugger.sendCommand({tabId}, Methods.enable);
    });

    return () => {
      chrome.debugger.onDetach.removeListener(onDetach);
      chrome.debugger.onEvent.removeListener(onEvent);
      chrome.debugger.sendCommand({tabId}, Methods.disable);
      chrome.debugger.detach({tabId}, () => {});
    };
  },
);
