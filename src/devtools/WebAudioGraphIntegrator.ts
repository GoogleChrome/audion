import * as dagre from 'dagre';
import * as graphlib from 'graphlib';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {
  EMPTY,
  from,
  isObservable,
  merge,
  Observable,
  of,
  OperatorFunction,
  pipe,
  Subject,
} from 'rxjs';
import {map, filter, catchError, mergeMap, takeUntil} from 'rxjs/operators';

import {invariant} from '../utils/error';

import {
  WebAudioDebuggerEvent,
  WebAudioDebuggerEventParams,
} from '../chrome/DebuggerWebAudioDomain';

import {Audion} from './Types';
import {
  INITIAL_CONTEXT_REALTIME_DATA,
  WebAudioRealtimeData,
} from './WebAudioRealtimeData';
import {
  ChromeDebuggerAPIDetachEvent,
  ChromeDebuggerAPIDetachEventParams,
  ChromeDebuggerAPIEventName,
  ChromeDebuggerAPIEvent,
  ChromeDebuggerAPIEventParams,
} from './DebuggerAttachEventController';

type MutableContexts = {
  [key: string]: {
    graphContext: Audion.GraphContext;
    graphContextDestroyed$: Subject<void>;
    realtimeDataGraphContext$: Observable<Audion.GraphContext>;
  };
};

interface EventHelpers {
  realtimeData: WebAudioRealtimeData;
}

type IntegratableEventName = WebAudioDebuggerEvent | ChromeDebuggerAPIEventName;

type IntegratableEvent = Audion.WebAudioEvent | ChromeDebuggerAPIEvent;

type IntegratableEventMapping = {
  [K in IntegratableEventName]: ProtocolMapping.Events extends {
    [key in K]: [infer P];
  }
    ? P
    : ChromeDebuggerAPIEvent extends {method: K; params: infer P}
    ? P
    : never;
};

type EventHandlers =
  | {
      readonly [K in IntegratableEventName]: (
        helpers: EventHelpers,
        contexts: MutableContexts,
        event: IntegratableEventMapping[K],
      ) => Observable<Audion.GraphContext> | Audion.GraphContext | void;
    };

const EVENT_HANDLERS: Partial<EventHandlers> = {
  [WebAudioDebuggerEvent.audioNodeCreated]: (
    helpers,
    contexts,
    audioNodeCreated,
  ) => {
    const space = contexts[audioNodeCreated.node.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    if (context.nodes[audioNodeCreated.node.nodeId]) {
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.audioNodeCreated} event.`,
        audioNodeCreated,
      );
      return;
    }
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

  [WebAudioDebuggerEvent.audioNodeWillBeDestroyed]: (
    helpers,
    contexts,
    audioNodeDestroyed,
  ) => {
    const space = contexts[audioNodeDestroyed.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    context.graph.removeNode(audioNodeDestroyed.nodeId);
    const node = context.nodes[audioNodeDestroyed.nodeId];
    if (node && node.params) {
      for (const audioParam of node.params) {
        delete context.params[audioParam.paramId];
      }
    }
    delete context.nodes[audioNodeDestroyed.nodeId];
    return context;
  },

  [WebAudioDebuggerEvent.audioParamCreated]: (
    helpers,
    contexts,
    audioParamCreated,
  ) => {
    const space = contexts[audioParamCreated.param.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    const node = context.nodes[audioParamCreated.param.nodeId];
    if (!node) {
      return;
    }
    if (
      node.params.some(
        ({paramId}) => paramId === audioParamCreated.param.paramId,
      )
    ) {
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.audioParamCreated} event.`,
        audioParamCreated,
      );
      return;
    }
    node.params.push(audioParamCreated.param);
    context.params[audioParamCreated.param.paramId] = audioParamCreated.param;
  },

  [WebAudioDebuggerEvent.audioParamWillBeDestroyed]: (
    helpers,
    contexts,
    audioParamWillBeDestroyed,
  ) => {
    const space = contexts[audioParamWillBeDestroyed.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    const node = context.nodes[audioParamWillBeDestroyed.nodeId];
    removeAll(
      node?.params,
      ({paramId}) => paramId === audioParamWillBeDestroyed.paramId,
    );
    delete context.params[audioParamWillBeDestroyed.paramId];
  },

  [WebAudioDebuggerEvent.contextChanged]: (
    helpers,
    contexts,
    contextChanged,
  ) => {
    const space = contexts[contextChanged.context.contextId];
    if (!space) {
      return;
    }
    space.graphContext.context = contextChanged.context;
    space.graphContext.eventCount += 1;
    return contexts[contextChanged.context.contextId].graphContext;
  },

  [WebAudioDebuggerEvent.contextCreated]: (
    helpers,
    contexts,
    contextCreated,
  ) => {
    if (contexts[contextCreated.context.contextId]) {
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

    const contextId = contextCreated.context.contextId;
    const realtimeData$ = helpers.realtimeData.pollContext(contextId);

    const graphContextDestroyed$ = new Subject<void>();

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
      graphContextDestroyed$,
      realtimeDataGraphContext$: realtimeData$.pipe(
        map((realtimeData) => {
          if (contexts[contextId]) {
            contexts[contextId].graphContext = {
              ...contexts[contextId].graphContext,
              realtimeData,
            };
            return contexts[contextId].graphContext;
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
        takeUntil(graphContextDestroyed$),
      ),
    };

    return merge(
      of(contexts[contextCreated.context.contextId].graphContext),
      contexts[contextCreated.context.contextId].realtimeDataGraphContext$,
    );
  },

  [WebAudioDebuggerEvent.contextWillBeDestroyed]: (
    helpers,
    contexts,
    contextDestroyed,
  ) => {
    const context = contexts[contextDestroyed.contextId];
    delete contexts[contextDestroyed.contextId];

    space?.graphContextDestroyed$?.next();

    return {
      id: contextDestroyed.contextId,
      eventCount: context?.graphContext?.eventCount + 1,
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
    const space = contexts[nodeParamConnected.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.nodes[nodeParamConnected.sourceId].edges.push(nodeParamConnected);
    context.eventCount += 1;
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

  [WebAudioDebuggerEvent.nodeParamDisconnected]: (
    helpers,
    contexts,
    nodesDisconnected,
  ) => {
    const space = contexts[nodesDisconnected.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    const {edges} = context.nodes[nodesDisconnected.sourceId];
    const {sourceId, sourceOutputIndex = 0, destinationId} = nodesDisconnected;
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
    const space = contexts[nodesConnected.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.nodes[nodesConnected.sourceId].edges.push(nodesConnected);
    context.eventCount += 1;
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

  [WebAudioDebuggerEvent.nodesDisconnected]: (
    helpers,
    contexts,
    nodesDisconnected,
  ) => {
    const space = contexts[nodesDisconnected.contextId];
    if (!space) {
      return;
    }
    const context = space.graphContext;
    context.eventCount += 1;
    const {edges} = context.nodes[nodesDisconnected.sourceId];
    const {
      sourceId,
      sourceOutputIndex = 0,
      destinationId,
      destinationInputIndex = 0,
    } = nodesDisconnected;
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

  [ChromeDebuggerAPIEventName.detached]: (
    helpers,
    contexts,
    debuggerDetached,
  ) => {
    return;
    if (debuggerDetached.reason === 'target_closed') {
      const spaces = Object.entries(contexts);

      for (const [contextId, space] of spaces) {
        delete contexts[contextId];
        space?.graphContextDestroyed$?.next();
      }

      return from(
        spaces.map(([contextId, space]) => ({
          id: contextId,
          eventCount: space?.graphContext?.eventCount + 1,
          context: null,
          realtimeData: null,
          nodes: null,
          params: null,
          graph: null,
        })),
      );
    }
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
): OperatorFunction<IntegratableEvent, Audion.GraphContext> {
  const helpers = {realtimeData: webAudioRealtimeData};
  const contexts: MutableContexts = {};
  return pipe(
    mergeMap(({method, params}) => {
      console.log(method, params);
      if (EVENT_HANDLERS[method]) {
        const result = EVENT_HANDLERS[method]?.(
          helpers,
          contexts,
          params as any,
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
