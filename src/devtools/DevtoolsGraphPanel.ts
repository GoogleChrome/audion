/** DevTools panel that renders the Web Audio graph and more debugging information. */

import {chrome} from '../chrome';
import {Audion} from './Types';
import {fromEventPattern, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

type AllGraphsContext = {allGraphs: {[key: string]: Audion.GraphContext}};

function fromChromeEvent<T>(
  event: Chrome.Event<(msg: T) => void>,
): Observable<T> {
  return fromEventPattern(
    (handler) => event.addListener(handler),
    (handler) => event.removeListener(handler),
  );
}

/**
 * Manage a devtools panel rendering a graph of a web audio context.
 */
export class DevtoolsGraphPanel {
  requests$: Observable<Audion.DevtoolsRequest>;

  onPanelShown$: Observable<void>;

  /**
   * Create a DevtoolsGraphPanel.
   */
  constructor(graphs$: Observable<AllGraphsContext>) {
    this.requests$ = new Subject();

    const onPanelShown$ = (this.onPanelShown$ = new Subject<void>());
    chrome.devtools.panels.create('Web Audio', '', 'panel.html', (panel) => {
      fromChromeEvent(panel.onShown).subscribe(onPanelShown$);
    });

    fromChromeEvent(chrome.runtime.onConnect).subscribe({
      next(port) {
        fromChromeEvent(port.onMessage).subscribe(this.requests$);

        graphs$.pipe(takeUntil(fromChromeEvent(port.onDisconnect))).subscribe({
          next(graphs) {
            port.postMessage(graphs);
          },
        });
      },
    });
  }
}
