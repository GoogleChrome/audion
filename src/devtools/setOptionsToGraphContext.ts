import * as dagre from 'dagre';

import {Audion} from './Types';

export function setOptionsToGraphContext([context, layoutOptions]: [
  Audion.GraphContext,
  dagre.GraphLabel,
]): Audion.GraphContext {
  if (context.context && context.graph) {
    context.graph.setGraph(layoutOptions);
  }
  return context;
}
