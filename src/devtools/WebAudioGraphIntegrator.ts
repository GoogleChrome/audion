import * as dagre from 'dagre';
import * as graphlib from 'graphlib';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {
  EMPTY,
  isObservable,
  merge,
  NEVER,
  Observable,
  of,
  OperatorFunction,
  pipe,
  Subject,
} from 'rxjs';
import {
  map,
  filter,
  catchError,
  mergeMap,
  takeUntil,
  take,
  ignoreElements,
  finalize,
  share,
} from 'rxjs/operators';

import {WebAudioDebuggerEvent} from '../chrome/DebuggerWebAudioDomain';

import {Audion} from './Types';
import {
  INITIAL_CONTEXT_REALTIME_DATA,
  RealtimeDataErrorMessage,
  WebAudioRealtimeData,
  WebAudioRealtimeDataReason,
} from './WebAudioRealtimeData';
import {
  ChromeDebuggerAPIEventName,
  ChromeDebuggerAPIEvent,
} from './DebuggerAttachEventController';
import {
  PageDebuggerEvent,
  PageDebuggerEventParams,
} from '../chrome/DebuggerPageDomain';

enum GraphContextDestroyReasonMessage {
  RECEIVE_WILL_DESTROY_EVENT = 'ReceiveWillDestroyEvent',
  CANNOT_FIND_REALTIME_DATA = 'CannotFindRealtimeData',
}

type MutableContexts = {
  [key: string]: {
    graphContext: Audion.GraphContext;
    graphContextDestroyed$: Subject<GraphContextDestroyReasonMessage>;
    realtimeDataGraphContext$: Observable<Audion.GraphContext>;
  };
};

interface EventHelpers {
  realtimeData: WebAudioRealtimeData;
}

type IntegratableEventName =
  | PageDebuggerEvent
  | WebAudioDebuggerEvent
  | ChromeDebuggerAPIEventName;

type IntegratableEvent =
  | Audion.PageEvent
  | Audion.WebAudioEvent
  | ChromeDebuggerAPIEvent;

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
      console.warn(
        `Unexpected ${
          WebAudioDebuggerEvent.contextChanged
        } event. Did not receive an event when Audio Context ${contextId.slice(
          -6,
        )} was created.`,
      );
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
    const {contextId, contextType} = contextCreated.context;
    if (contexts[contextId]) {
      // Duplicate or out of order context created event.
      console.warn(
        `Duplicate ${WebAudioDebuggerEvent.contextCreated} event.`,
        contextCreated,
      );
      return;
    } else {
      console.debug(
        `Audio Context (${contextId.slice(
          -6,
        )}-${contextType}) created. Adding the context to the tracked set.`,
      );
    }

    const graph = new dagre.graphlib.Graph({multigraph: true});
    graph.setGraph({});
    graph.setDefaultEdgeLabel(() => {
      return {};
    });

    // Request realtime data for realtime and offline contexts. We use this
    // information to help confirm the existence of this new context. Events
    // that normally mark when contexts are destroyed may not arrive and so we
    // need this extra way to determine when the contexts no longer exist.
    const realtimeData$ = helpers.realtimeData.pollContext(contextId);
    const graphContextDestroyed$ =
      new Subject<GraphContextDestroyReasonMessage>();

    const realtimeDataGraphContext$ = realtimeData$.pipe(
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
      catchError((reason, caught) => {
        reason = WebAudioRealtimeDataReason.parseReason(reason);

        if (WebAudioRealtimeDataReason.isCannotFindReason(reason)) {
          const space = contexts[contextId];
          space?.graphContextDestroyed$?.next(
            GraphContextDestroyReasonMessage.CANNOT_FIND_REALTIME_DATA,
          );

          if (!space) {
            console.warn(
              `Error requesting realtime data for context '${contextId}'.
Context was likely cleaned up during request for realtime data.
"${reason.message}"`,
            );
          }

          return EMPTY;
        } else if (WebAudioRealtimeDataReason.isRealtimeOnlyReason(reason)) {
          // Non-realtime/offline contexts do not have realtime data and will
          // produce this error when that data is requested.
        } else {
          console.error(
            `Unexpected error requesting realtime data for context '${contextId}'.
"${WebAudioRealtimeDataReason.toString(reason)}"`,
          );
        }

        // Redirect back to the caught observable. We want to keep receiving
        // realtime data values or errors until we receive CANNOT_FIND error.
        return caught;
      }),

      takeUntil(graphContextDestroyed$),
    );

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
      realtimeDataGraphContext$,
    };

    return merge(
      of(contexts[contextId].graphContext),
      graphContextDestroyed$.pipe(
        share(),
        take(1),
        mergeMap((message) => {
          if (
            message ===
            GraphContextDestroyReasonMessage.CANNOT_FIND_REALTIME_DATA
          ) {
            console.debug(
              `Audio Context (${contextId.slice(
                -6,
              )}-${contextType}) cannot be found. Removing the context from the tracked set.`,
            );
          } else if (
            message ===
            GraphContextDestroyReasonMessage.RECEIVE_WILL_DESTROY_EVENT
          ) {
            console.debug(
              `Audio Context (${contextId.slice(
                -6,
              )}-${contextType}) will be destroyed. Removing the context from the tracked set.`,
            );
          }

          const space = contexts[contextId];
          if (space) {
            delete contexts[contextId];
            return of({
              id: contextId,
              eventCount: space.graphContext?.eventCount + 1,
              context: null,
              realtimeData: null,
              nodes: null,
              params: null,
              graph: null,
            });
          } else {
            console.warn(
              `Audio Context (${contextId.slice(
                -6,
              )}-${contextType}) could not be removed from tracked set. It was not tracked.`,
            );
          }
          return EMPTY;
        }),
      ),
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
    space?.graphContextDestroyed$?.next(
      GraphContextDestroyReasonMessage.RECEIVE_WILL_DESTROY_EVENT,
    );
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
        sourceOutputIndex,
        destinationType: Audion.GraphEdgeType.PARAM,
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
      sourceId,
      destinationId,
      {
        sourceOutputIndex,
        destinationType: Audion.GraphEdgeType.NODE,
        destinationInputIndex,
      } as Audion.GraphNodeEdge,
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

  [PageDebuggerEvent.frameNavigated]: (helpers, contexts) => {
    console.debug(
      `Checking if tracked Audio Contexts (${Object.keys(contexts)
        .map((contextId) => contextId.slice(-6))
        .join(', ')}) exist after frame navigated.`,
    );

    return ensureContextsExist(contexts, helpers);
  },

  [PageDebuggerEvent.loadEventFired]: (helpers, contexts) => {
    console.debug(
      `Checking if tracked Audio Contexts (${Object.keys(contexts)
        .map((contextId) => contextId.slice(-6))
        .join(', ')}) exist after load event.`,
    );

    return ensureContextsExist(contexts, helpers);
  },

  [ChromeDebuggerAPIEventName.detached]: (
    helpers,
    contexts,
    debuggerDetached,
  ) => {
    if (debuggerDetached.reason === 'target_closed') {
      console.debug(
        `Checking if tracked Audio Contexts (${Object.keys(contexts)
          .map((contextId) => contextId.slice(-6))
          .join(
            ', ',
          )}) exist after debugger detached because target was closed.`,
      );

      return ensureContextsExist(contexts, helpers);
    }
  },
};

function ensureContextsExist(
  contexts: MutableContexts,
  helpers: EventHelpers,
): void | Audion.GraphContext | Observable<Audion.GraphContext> {
  return merge(
    ...Object.keys(contexts).map((contextId) =>
      helpers.realtimeData.pollContext(contextId).pipe(
        take(1),
        ignoreElements(),
        catchError((reason) => {
          reason = WebAudioRealtimeDataReason.parseReason(reason);

          if (WebAudioRealtimeDataReason.isCannotFindReason(reason)) {
            const space = contexts[contextId];
            if (space) {
              space?.graphContextDestroyed$?.next(
                GraphContextDestroyReasonMessage.CANNOT_FIND_REALTIME_DATA,
              );
            }
          } else if (WebAudioRealtimeDataReason.isRealtimeOnlyReason(reason)) {
            // OfflineAudioContexts emit this error if they are still alive.
          } else {
            console.error(`Unexpected error determining if context '${contextId}' is stale with devtools protocol WebAudio.getRealtimeData.
"${WebAudioRealtimeDataReason.toString(reason)}"`);
          }

          return EMPTY;
        }),
      ),
    ),
  );
}

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
