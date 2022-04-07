import {
  deserializeGraphContext,
  SerializedGraphContext,
} from './deserializeGraphContext';
import {Audion} from './Types';

/**
 * Patch and update a deserialized graph context or create a new one.
 *
 * If the given graph contexts have matching contextId the already deserialized
 * graph context will be updated by patching the differences. This will add
 * nodes and edges to the graphlib graph that are listed in the serialized graph
 * and not in the hydrated graph. As well nodes and edges that are not in the
 * serialized graph will be removed from the hydrated graph.
 *
 * @param hydratedGraphContext previously deserialized graph context
 * @param serializedGraphContext currently serialized graph context
 * @returns updated previously deserialized graph context or a brand new
 * deserialized graph context
 */
export function patchGraphContext(
  hydratedGraphContext: Audion.GraphContext,
  serializedGraphContext: SerializedGraphContext,
) {
  if (hydratedGraphContext.id !== serializedGraphContext.id) {
    return deserializeGraphContext(serializedGraphContext);
  }

  // Create sets of possilby stale nodes and edges. While iterating the
  // serialized nodes and edges, nodes and edges that are carrying over will be
  // removed from these sets. After those iterations these sets will only
  // contain nodes and edges that should be removed from the hydrated graph.
  const staleNodeIdSet = new Set(hydratedGraphContext.graph.nodes());
  const staleEdgeIdSet = new Set(hydratedGraphContext.graph.edges());

  // Iterate over the nodes of the serialized graph. If a node is missing in the
  // hydrated graph, add the missing node. If the node is present, update its
  // value with the value stored in the serialized graph. This will ensure a
  // node is present in the hydrated graph for each one in the serialized graph
  // and they will share the same info like position and size.
  for (let i = 0; i < serializedGraphContext.graph.nodes.length; i++) {
    const serializedNode = serializedGraphContext.graph.nodes[i];
    if (!hydratedGraphContext.graph.hasNode(serializedNode.v)) {
      hydratedGraphContext.graph.setNode(
        serializedNode.v,
        serializedNode.value,
      );
    } else {
      staleNodeIdSet.delete(serializedNode.v);
      Object.assign(
        hydratedGraphContext.graph.node(serializedNode.v),
        serializedNode.value,
      );
    }
  }

  // Iterate the edges in the serialized graph. If the edge is not present in
  // the hydrated graph, add it. If the edge is present, update its value with
  // the value stored in the serialized graph. Whether the edge was added or
  // already present its value will match the one stored in the serialized
  // graph.
  for (let i = 0; i < serializedGraphContext.graph.edges.length; i++) {
    const serializedEdge = serializedGraphContext.graph.edges[i];
    if (!hydratedGraphContext.graph.hasEdge(serializedEdge)) {
      hydratedGraphContext.graph.setEdge(
        serializedEdge.v,
        serializedEdge.w,
        serializedEdge.value,
        serializedEdge.name,
      );
    } else {
      staleEdgeIdSet.delete(hydratedGraphContext.graph.edge(serializedEdge));
      Object.assign(
        hydratedGraphContext.graph.edge(serializedEdge),
        serializedEdge.value,
      );
    }
  }

  // Remove stale nodes and edges.
  for (const staleNodeId of staleNodeIdSet) {
    hydratedGraphContext.graph.removeNode(staleNodeId);
  }
  for (const staleEdgeId of staleEdgeIdSet) {
    hydratedGraphContext.graph.removeEdge(staleEdgeId);
  }

  // Replace other fields in the hydrated graph with the values in the
  // serialized graph.
  Object.assign(hydratedGraphContext, {
    eventCount: serializedGraphContext.eventCount,
    context: serializedGraphContext.context,
    realtimeData: serializedGraphContext.realtimeData,
    nodes: serializedGraphContext.nodes,
    params: serializedGraphContext.params,
  });

  return hydratedGraphContext;
}
