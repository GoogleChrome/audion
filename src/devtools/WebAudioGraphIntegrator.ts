import * as dagre from 'dagre';
import * as graphlib from 'graphlib';

import {Events} from '../chrome/DebuggerWebAudioDomain';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {Audion} from './Types';
import {pipe, OperatorFunction} from 'rxjs';
import {map, filter} from 'rxjs/operators';

type WebAudioEventName = keyof ProtocolMapping.Events & `WebAudio.${string}`;

type MutableContexts = {[key: string]: Audion.GraphContext};

type EventHandlers = {
  readonly [K in WebAudioEventName]: (
    contexts: MutableContexts,
    event: ProtocolMapping.Events[K][0],
  ) => Audion.GraphContext | void;
};

const EVENT_HANDLERS: Partial<EventHandlers> = {
  [Events.audioNodeCreated]: (contexts, audioNodeCreated) => {
    const context = contexts[audioNodeCreated.node.contextId];
    context.nodes[audioNodeCreated.node.nodeId] = {
      node: audioNodeCreated.node,
      params: [],
      edges: [],
    };
    const {nodeId} = audioNodeCreated.node;
    context.graph.setNode(nodeId, {
      id: nodeId,
      label: audioNodeCreated.node.nodeType,
      type: audioNodeCreated.node.nodeType,
      color: null,
      width: 150,
      height: 50,
    });
    return context;
  },

  [Events.audioNodeWillBeDestroyed]: (contexts, audioNodeDestroyed) => {
    const context = contexts[audioNodeDestroyed.contextId];
    context.graph.removeNode(audioNodeDestroyed.nodeId);
    delete context.nodes[audioNodeDestroyed.nodeId];
    return context;
  },

  [Events.audioParamCreated]: (contexts, audioParamCreated) => {
    const context = contexts[audioParamCreated.param.contextId];
    const node = context.nodes[audioParamCreated.param.nodeId];
    if (!node) {
      return;
    }
    node.params.push(audioParamCreated.param);
    context.params[audioParamCreated.param.paramId] = audioParamCreated.param;
  },

  [Events.audioParamWillBeDestroyed]: (contexts, audioParamWillBeDestroyed) => {
    const context = contexts[audioParamWillBeDestroyed.contextId];
    const node = context.nodes[audioParamWillBeDestroyed.nodeId];
    if (node) {
      const index = node.params.findIndex(
        ({paramId}) => paramId === audioParamWillBeDestroyed.paramId,
      );
      if (index >= 0) {
        node.params.splice(index, 1);
      }
    }
  },

  [Events.contextChanged]: (contexts, contextChanged) => {
    contexts[contextChanged.context.contextId].context = contextChanged.context;
    return contexts[contextChanged.context.contextId];
  },

  [Events.contextCreated]: (contexts, contextCreated) => {
    const graph = new dagre.graphlib.Graph({multigraph: true});
    graph.setGraph({});
    graph.setDefaultEdgeLabel(() => {
      return {};
    });
    contexts[contextCreated.context.contextId] = {
      id: contextCreated.context.contextId,
      context: contextCreated.context,
      nodes: {},
      params: {},
      // TODO: dagre's graphlib typings are inaccurate, which is why we use
      // graphlib's types. Revert to dagre's types once the issue is fixed:
      // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47439
      graph: graph as unknown as graphlib.Graph,
    };
    return contexts[contextCreated.context.contextId];
  },

  [Events.contextWillBeDestroyed]: (contexts, contextDestroyed) => {
    delete contexts[contextDestroyed.contextId];

    return {
      id: contextDestroyed.contextId,
      context: null,
      nodes: null,
      params: null,
      graph: null,
    };
  },

  [Events.nodeParamConnected]: (contexts, nodeParamConnected) => {
    const context = contexts[nodeParamConnected.contextId];
    context.nodes[nodeParamConnected.sourceId].edges.push(nodeParamConnected);
    const {
      sourceId,
      sourceOutputIndex = 0,
      destinationId: destinationParamId,
    } = nodeParamConnected;
    const destinationId = context.params[destinationParamId].nodeId;
    context.graph.setEdge(
      `${sourceId}`,
      `${destinationId}`,
      {
        type: 'param',
        sourceOutputIndex,
        destinationInputIndex: -1,
        destinationParamId,
      },
      sourceOutputIndex.toString(),
    );
    return context;
  },

  [Events.nodeParamDisconnected]: (contexts, nodesDisconnected) => {
    const context = contexts[nodesDisconnected.contextId];
    const {edges} = context.nodes[nodesDisconnected.sourceId];
    const {sourceId, sourceOutputIndex = 0, destinationId} = nodesDisconnected;
    edges.splice(
      edges.findIndex(
        (edge) =>
          edge.destinationId === destinationId &&
          edge.sourceOutputIndex === sourceOutputIndex,
      ),
    );
    context.graph.removeEdge(
      sourceId,
      destinationId,
      sourceOutputIndex.toString(),
    );
    return context;
  },

  [Events.nodesConnected]: (contexts, nodesConnected) => {
    const context = contexts[nodesConnected.contextId];
    context.nodes[nodesConnected.sourceId].edges.push(nodesConnected);
    const {
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
      destinationInputIndex = 0,
    } = nodesConnected;
    context.graph.setEdge(
      `${sourceId}`,
      `${destinationId}`,
      {
        type: 'node',
        sourceOutputIndex,
        destinationInputIndex,
        destinationParamId: '',
      },
      `${sourceOutputIndex},${destinationInputIndex}`,
    );
    return context;
  },

  [Events.nodesDisconnected]: (contexts, nodesDisconnected) => {
    const context = contexts[nodesDisconnected.contextId];
    const {edges} = context.nodes[nodesDisconnected.sourceId];
    const {
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
      destinationInputIndex = 0,
    } = nodesDisconnected;
    edges.splice(
      edges.findIndex(
        (edge) =>
          edge.destinationId === destinationId &&
          edge.sourceOutputIndex === sourceOutputIndex &&
          edge.destinationInputIndex === destinationInputIndex,
      ),
    );
    context.graph.removeEdge(
      sourceId,
      destinationId,
      `${sourceOutputIndex},${destinationInputIndex}`,
    );
    return context;
  },
};

/**
 * Collect WebAudio debugger events into per context graphs.
 */
export function integrateWebAudioGraph(): OperatorFunction<
  Audion.WebAudioEvent,
  Audion.GraphContext
> {
  const contexts: MutableContexts = {};
  return pipe(
    map((event) => EVENT_HANDLERS[event.method]?.(contexts, event.params)),
    filter((context) => !!context),
  );
}
