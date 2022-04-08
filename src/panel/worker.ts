import * as dagre from 'dagre';
import {fromEvent, Observable} from 'rxjs';
import {
  auditTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';

import {serializeGraphContext} from '../devtools/serializeGraphContext';
import {
  deserializeGraphContext,
  SerializedGraphContext,
} from '../devtools/deserializeGraphContext';
import {setOptionsToGraphContext} from '../devtools/setOptionsToGraphContext';
import {layoutGraphContext} from '../devtools/layoutGraphContext';

interface LayoutOptionsMessage {
  layoutOptions: dagre.GraphLabel;
}

interface GraphContextMessage {
  graphContext: SerializedGraphContext;
}

type PanelMessage = MessageEvent<LayoutOptionsMessage | GraphContextMessage>;

const messages$ = fromEvent<PanelMessage>(self, 'message').pipe(
  map((message) => message.data),
);

const layoutOptions$: Observable<dagre.GraphLabel> = messages$.pipe(
  filter((msg): msg is LayoutOptionsMessage => 'layoutOptions' in msg),
  map((message) => message.layoutOptions),
  startWith({rankdir: 'LR'}),
);

messages$
  .pipe(
    filter((msg): msg is GraphContextMessage => 'graphContext' in msg),
    map((message) => message.graphContext),
    distinctUntilChanged(
      (a, b) => a?.id === b?.id && a?.eventCount === b?.eventCount,
    ),
    auditTime(16),
    map((graphContext) => deserializeGraphContext(graphContext)),
    withLatestFrom(layoutOptions$),
    map(setOptionsToGraphContext),
    map(layoutGraphContext),
    map(serializeGraphContext),
  )
  .subscribe((context) => {
    self.postMessage(context);
  });
