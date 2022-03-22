import * as dagre from 'dagre';
import {fromEvent, Observable} from 'rxjs';
import {
  auditTime,
  distinctUntilChanged,
  filter,
  map,
  mergeWith,
  scan,
  startWith,
  withLatestFrom,
} from 'rxjs/operators';

import {serializeGraphContext} from '../devtools/serializeGraphContext';
import {
  deserializeGraphContext,
  SerializedGraphContext,
} from '../devtools/deserializeGraphContext';
import {patchGraphContext} from '../devtools/patchGraphContext';

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
    scan(patchGraphContext, {id: ''}),
    withLatestFrom(layoutOptions$),
    map(([context, layoutOptions]) => {
      if (context.context && context.graph) {
        context.graph.setGraph(layoutOptions);
        // TODO: dagre's graphlib typings are inaccurate, which is why we use
        // graphlib's types. Revert to dagre's types once the issue is fixed:
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47439
        dagre.layout(context.graph as unknown as dagre.graphlib.Graph);
      }
      return context;
    }),
    map(serializeGraphContext),
  )
  .subscribe((context) => {
    self.postMessage(context);
  });
