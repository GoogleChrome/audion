import * as dagre from 'dagre';
import * as graphlib from 'graphlib';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {
  EMPTY,
  isObservable,
  merge,
  Observable,
  of,
  OperatorFunction,
  pipe,
} from 'rxjs';
import {map, filter, catchError, mergeMap} from 'rxjs/operators';

import {
  WebAudioDebuggerEvent,
  WebAudioDebuggerEventParams,
} from '../chrome/DebuggerWebAudioDomain';

import {Audion} from './Types';
import {
  INITIAL_CONTEXT_REALTIME_DATA,
  WebAudioRealtimeData,
} from './WebAudioRealtimeData';

type MutableContexts = {
  [key: string]: {
    graphContext: Audion.GraphContext;
    realtimeDataGraphContext$: Observable<Audion.GraphContext>;
  };
};

interface EventHelpers {
  realtimeData: WebAudioRealtimeData;
}

type EventHandlers = {
  readonly [K in WebAudioDebuggerEvent]: (
    helpers: EventHelpers,
    contexts: MutableContexts,
    event: ProtocolMapping.Events[K][0],
  ) => Observable<Audion.GraphContext> | Audion.GraphContext | void;
};

const EVENT_HANDLERS: Partial<EventHandlers> = {
  [WebAudioDebuggerEvent.audioNodeCreated]: (
    helpers,
    contexts,
    audioNodeCreated,
  ) => {
    const node = audioNodeCreated.node;
    const {contextId, nodeId, nodeType} = node;
    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    if (context.nodes[nodeId]) {
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.audioNodeCreated} event.`,
        audioNodeCreated,
      );
      return;
    }

    context.nodes[nodeId] = {
      node,
      params: [],
      edges: [],
    };
    context.graph.setNode(nodeId, {
      id: nodeId,
      label: nodeType,
      type: nodeType,
      color: null,
      width: 150,
      height: 50,
    });
    return context;
  },

  [WebAudioDebuggerEvent.audioNodeWillBeDestroyed]: (
    helpers,
    contexts,
    audioNodeDestroyed,
  ) => {
    const {contextId, nodeId} = audioNodeDestroyed;
    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    context.graph.removeNode(nodeId);
    const node = context.nodes[nodeId];
    if (node && node.params) {
      for (const audioParam of node.params) {
        delete context.params[audioParam.paramId];
      }
    }
    delete context.nodes[nodeId];
    return context;
  },

  [WebAudioDebuggerEvent.audioParamCreated]: (
    helpers,
    contexts,
    audioParamCreated,
  ) => {
    const {param} = audioParamCreated;
    const {contextId, nodeId, paramId: paramIdCreated} = param;
    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const node = context.nodes[nodeId];
    if (!node) {
      return;
    }

    if (node.params.some(({paramId}) => paramId === paramIdCreated)) {
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.audioParamCreated} event.`,
        audioParamCreated,
      );
      return;
    }

    node.params.push(param);
    context.params[paramIdCreated] = param;
    return context;
  },

  [WebAudioDebuggerEvent.audioParamWillBeDestroyed]: (
    helpers,
    contexts,
    audioParamWillBeDestroyed,
  ) => {
    const {
      contextId,
      nodeId,
      paramId: paramIdCreated,
    } = audioParamWillBeDestroyed;

    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const node = context.nodes[nodeId];
    if (node && node.params) {
      removeAll(node.params, ({paramId}) => paramId === paramIdCreated);
    }
    delete context.params[paramIdCreated];
    return context;
  },

  [WebAudioDebuggerEvent.contextChanged]: (
    helpers,
    contexts,
    contextChanged,
  ) => {
    const {contextId} = contextChanged.context;
    const space = contexts[contextId];
    if (!space) {
      return;
    }

    space.graphContext.context = contextChanged.context;
    space.graphContext.eventCount += 1;
    return space.graphContext;
  },

  [WebAudioDebuggerEvent.contextCreated]: (
    helpers,
    contexts,
    contextCreated,
  ) => {
    const {contextId} = contextCreated.context;
    if (contexts[contextId]) {
      // Duplicate or out of order context created event.
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.contextCreated} event.`,
        contextCreated,
      );
      return;
    }

    const graph = new dagre.graphlib.Graph({multigraph: true});
    graph.setGraph({});
    graph.setDefaultEdgeLabel(() => {
      return {};
    });

    const realtimeData$ = helpers.realtimeData.pollContext(contextId);

    contexts[contextId] = {
      graphContext: {
        id: contextId,
        eventCount: 1,
        context: contextCreated.context,
        realtimeData: INITIAL_CONTEXT_REALTIME_DATA,
        nodes: {},
        params: {},
        // TODO: dagre's graphlib typings are inaccurate, which is why we use
        // graphlib's types. Revert to dagre's types once the issue is fixed:
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47439
        graph: graph as unknown as graphlib.Graph,
      },
      realtimeDataGraphContext$: realtimeData$.pipe(
        map((realtimeData) => {
          const space = contexts[contextId];
          if (space) {
            space.graphContext = {
              ...space.graphContext,
              realtimeData,
            };
            return space.graphContext;
          }
        }),
        filter((context): context is Audion.GraphContext => Boolean(context)),
        catchError((reason) => {
          console.error(
            `Error requesting realtime data context for ${contextId}.${
              reason ? `\n${reason.message}` : reason
            }`,
          );
          return EMPTY;
        }),
      ),
    };

    return merge(
      of(contexts[contextId].graphContext),
      contexts[contextId].realtimeDataGraphContext$,
    );
  },

  [WebAudioDebuggerEvent.contextWillBeDestroyed]: (
    helpers,
    contexts,
    contextDestroyed,
  ) => {
    const {contextId} = contextDestroyed;
    const space = contexts[contextId];
    delete contexts[contextId];

    return {
      id: contextId,
      eventCount: space?.graphContext?.eventCount + 1,
      context: null,
      realtimeData: null,
      nodes: null,
      params: null,
      graph: null,
    };
  },

  [WebAudioDebuggerEvent.nodeParamConnected]: (
    helpers,
    contexts,
    nodeParamConnected,
  ) => {
    const {
      contextId,
      sourceId: sourceNodeId,
      sourceOutputIndex = 0,
      destinationId: destinationParamId,
    } = nodeParamConnected;

    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const sourceNode = context.nodes[sourceNodeId];
    if (!sourceNode) {
      return;
    }
    const destinationParam = context.params[destinationParamId];
    if (!destinationParam) {
      return;
    }
    const destinationNodeId = destinationParam.nodeId;
    const destinationNode = context.nodes[destinationNodeId];
    if (!destinationNode) {
      return;
    }

    sourceNode.edges.push(nodeParamConnected);
    context.graph.setEdge(
      sourceNodeId,
      destinationNodeId,
      {
        type: 'param',
        sourceOutputIndex,
        destinationInputIndex: -1,
        destinationParamId,
        destinationParamIndex: destinationNode.params.findIndex(
          ({paramId}) => paramId === destinationParamId,
        ),
      } as Audion.GraphEdge,
      sourceOutputIndex.toString(),
    );
    return context;
  },

  [WebAudioDebuggerEvent.nodeParamDisconnected]: (
    helpers,
    contexts,
    nodesDisconnected,
  ) => {
    const {
      contextId,
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
    } = nodesDisconnected;
    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const sourceNode = context.nodes[sourceId];
    if (!sourceNode) {
      return;
    }

    const {edges} = sourceNode;
    removeAll(
      edges,
      (edge) =>
        edge.destinationId === destinationId &&
        edge.sourceOutputIndex === sourceOutputIndex,
    );
    context.graph.removeEdge(
      sourceId,
      destinationId,
      sourceOutputIndex.toString(),
    );
    return context;
  },

  [WebAudioDebuggerEvent.nodesConnected]: (
    helpers,
    contexts,
    nodesConnected,
  ) => {
    const {
      contextId,
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
      destinationInputIndex = 0,
    } = nodesConnected;

    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const sourceNode = context.nodes[sourceId];
    if (!sourceNode) {
      return;
    }
    const destinationNode = context.nodes[destinationId];
    if (!destinationNode) {
      return;
    }

    sourceNode.edges.push(nodesConnected);
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

  [WebAudioDebuggerEvent.nodesDisconnected]: (
    helpers,
    contexts,
    nodesDisconnected,
  ) => {
    const {
      contextId,
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
      destinationInputIndex = 0,
    } = nodesDisconnected;

    const space = contexts[contextId];
    if (!space) {
      return;
    }

    const context = space.graphContext;
    context.eventCount += 1;

    const sourceNode = context.nodes[sourceId];
    if (!sourceNode) {
      return;
    }

    const {edges} = sourceNode;
    removeAll(
      edges,
      (edge) =>
        edge.destinationId === destinationId &&
        edge.sourceOutputIndex === sourceOutputIndex &&
        edge.destinationInputIndex === destinationInputIndex,
    );
    context.graph.removeEdge(
      sourceId,
      destinationId,
      `${sourceOutputIndex},${destinationInputIndex}`,
    );
    return context;
  },
};

function removeAll<T>(array: T[], fn: (value: T) => boolean) {
  if (array) {
    let index = array.findIndex(fn);
    while (index >= 0) {
      array.splice(index, 1);
      index = array.findIndex(fn);
    }
  }
}

/**
 * Collect WebAudio debugger events into per context graphs.
 */
export function integrateWebAudioGraph(
  webAudioRealtimeData: WebAudioRealtimeData,
): OperatorFunction<Audion.WebAudioEvent, Audion.GraphContext> {
  const helpers = {realtimeData: webAudioRealtimeData};
  const contexts: MutableContexts = {};
  return pipe(
    mergeMap(({method, params}) => {
      if (EVENT_HANDLERS[method]) {
        const result = EVENT_HANDLERS[method]?.(
          helpers,
          contexts,
          params as WebAudioDebuggerEventParams<any>,
        );
        if (typeof result !== 'object' || result === null) return EMPTY;
        if (isObservable(result)) {
          return result;
        }
        return of(result);
      }
      return EMPTY;
    }),
  );
}
