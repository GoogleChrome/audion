import * as dagre from 'dagre';

import {serializeGraphContext} from '../devtools/serializeGraphContext';
import {
  deserializeGraphContext,
  SerializedGraphContext,
} from '../devtools/deserializeGraphContext';
import {
  filter,
  fromEvent,
  map,
  Observable,
  startWith,
  throttleTime,
  withLatestFrom,
} from 'rxjs';

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
    throttleTime(16),
    map((message) => deserializeGraphContext(message.graphContext)),
    withLatestFrom(layoutOptions$),
    map(([context, layoutOptions]) => {
      if (context.context && context.graph) {
        context.graph.setGraph(layoutOptions);
        // TODO: dagre's graphlib typings are inacurate, which is why we use
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
