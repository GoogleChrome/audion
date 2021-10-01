import * as graphlib from 'graphlib';
import {Audion} from './Types';

export interface SerializedGraphContext extends Audion.GraphContext {
  graph: any;
}

export function deserializeGraphContext(
  graphContext: SerializedGraphContext,
): Audion.GraphContext {
  if (graphContext.graph) {
    return {
      ...graphContext,
      // TODO: dagre's graphlib typings are inaccurate, which is why we use
      // graphlib directly here. Revert to dagre's types once the issue is fixed:
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47439
      graph: graphlib.json.read(graphContext.graph),
    };
  } else {
    return graphContext;
  }
}
