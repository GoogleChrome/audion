import {
  deserializeGraphContext,
  SerializedGraphContext,
} from './deserializeGraphContext';
import {Audion} from './Types';

export function patchGraphContext(
  hydratedGraphContext: Audion.GraphContext,
  serializedGraphContext: SerializedGraphContext,
) {
  if (
    hydratedGraphContext.id !== serializedGraphContext.id ||
    hydratedGraphContext.eventCount !== serializedGraphContext.eventCount
  ) {
    return deserializeGraphContext(serializedGraphContext);
  }

  const nodeIdSet = new Set(hydratedGraphContext.graph.nodes());
  const edgeIdSet = new Set(hydratedGraphContext.graph.edges());

  for (let i = 0; i < serializedGraphContext.graph.nodes.length; i++) {
    const serializedNode = serializedGraphContext.graph.nodes[i];
    if (!hydratedGraphContext.graph.hasNode(serializedNode.v)) {
      nodeIdSet.delete(serializedNode.v);
      hydratedGraphContext.graph.setNode(
        serializedNode.v,
        serializedNode.value,
      );
    } else {
      Object.assign(
        hydratedGraphContext.graph.node(serializedNode.v),
        serializedNode.value,
      );
    }
  }
  for (let i = 0; i < serializedGraphContext.graph.edges.length; i++) {
    const serializedEdge = serializedGraphContext.graph.edges[i];
    if (!hydratedGraphContext.graph.hasEdge(serializedEdge)) {
      edgeIdSet.delete(hydratedGraphContext.graph.edge(serializedEdge));
      hydratedGraphContext.graph.setEdge(
        serializedEdge.v,
        serializedEdge.w,
        serializedEdge.value,
        serializedEdge.name,
      );
    } else {
      Object.assign(
        hydratedGraphContext.graph.edge(serializedEdge),
        serializedEdge.value,
      );
    }
  }

  for (const nodeId of nodeIdSet) {
    hydratedGraphContext.graph.removeNode(nodeId);
  }
  for (const edgeId of edgeIdSet) {
    hydratedGraphContext.graph.removeEdge(edgeId);
  }

  return hydratedGraphContext;
}
