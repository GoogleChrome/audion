import Protocol from 'devtools-protocol';
import {bindCallback, concatMap, interval, map} from 'rxjs';

import {invariant} from '../utils/error';

import {chrome} from '../chrome';
import {WebAudioDebuggerMethod} from '../chrome/DebuggerWebAudioDomain';

import {Audion} from './Types';

const {tabId} = chrome.devtools.inspectedWindow;

const sendCommand = bindCallback<
  [{tabId: string}, WebAudioDebuggerMethod.getRealtimeData, any?],
  [{realtimeData: Protocol.WebAudio.ContextRealtimeData}]
>(chrome.debugger.sendCommand.bind(chrome.debugger));

export const INITIAL_CONTEXT_REALTIME_DATA = {
  callbackIntervalMean: 0,
  callbackIntervalVariance: 0,
  currentTime: 0,
  renderCapacity: 0,
} as Audion.ContextRealtimeData;

export class WebAudioRealtimeData {
  pollContext(contextId: string) {
    return interval(1000).pipe(
      concatMap(() =>
        sendCommand({tabId}, WebAudioDebuggerMethod.getRealtimeData, {
          contextId,
        }).pipe(
          map((result) => {
            if (chrome.runtime.lastError) {
              throw chrome.runtime.lastError;
            }
            invariant(
              result && result !== null,
              'ContextRealtimeData not returned for WebAudio context %0.',
              contextId,
            );
            return result.realtimeData;
          }),
        ),
      ),
    );
  }
}
