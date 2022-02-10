import Protocol from 'devtools-protocol';
import {bindCallback, concatMap, interval, map} from 'rxjs';

import {chrome} from '../chrome';
import {Method} from '../chrome/DebuggerWebAudioDomain';
import {invariant} from '../utils/error';

const {tabId} = chrome.devtools.inspectedWindow;

const sendCommand = bindCallback<
  [{tabId: string}, Method.getRealtimeData, any?],
  [{realtimeData: Protocol.WebAudio.ContextRealtimeData}]
>(chrome.debugger.sendCommand.bind(chrome.debugger));

export class WebAudioRealtimeData {
  pollContext(contextId: string) {
    return interval(1000).pipe(
      concatMap(() =>
        sendCommand({tabId}, Method.getRealtimeData, {
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
