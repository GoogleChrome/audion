import {chrome} from '../chrome';
import {Audion} from './Types';
import {combineLatest, fromEventPattern, Observable, Subject} from 'rxjs';
import {take, takeUntil, switchMap, map} from 'rxjs/operators';

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
  /**
   * Create a DevtoolsGraphPanel.
   */
  constructor(graphs$: Observable<AllGraphsContext>) {
    const onPanelShown$ = new Subject<void>();
    chrome.devtools.panels.create('Web Audio', '', 'panel.html', (panel) => {
      fromChromeEvent(panel.onShown).subscribe(onPanelShown$);
    });

    combineLatest([fromChromeEvent(chrome.runtime.onConnect), onPanelShown$])
      .pipe(
        // As soon as the runtime has connect and the panel has been shown for the first time,
        take(1),
        // subscribe to graphs$. Do not subscribe before panel has been shown to avoid showing a
        // warning bar about attached debuggers to the user.
        switchMap(([port]) =>
          graphs$.pipe(
            takeUntil(fromChromeEvent(port.onDisconnect)),
            map((graphs) => ({graphs, port})),
          ),
        ),
      )
      .subscribe(({graphs, port}) => {
        port.postMessage(graphs);
      });
  }
}
