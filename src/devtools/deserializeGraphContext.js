import dagre from 'dagre';

/**
 * @param {Audion.GraphContext} graphContext
 * @return {Audion.GraphContext}
 */
export function deserializeGraphContext(graphContext) {
  if (graphContext.graph) {
    return {
      ...graphContext,
      graph: dagre.graphlib.json.read(graphContext.graph),
    };
  } else {
    return graphContext;
  }
}
