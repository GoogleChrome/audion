import dagre from 'dagre';

/**
 * @param {Audion.GraphContext} graphContext
 * @return {Audion.GraphContext}
 */
export function serializeGraphContext(graphContext) {
  if (graphContext.graph) {
    return {
      ...graphContext,
      graph: dagre.graphlib.json.write(graphContext.graph),
    };
  }
  return graphContext;
}
