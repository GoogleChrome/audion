/// <reference path="Types.ts" />

import * as dagre from 'dagre';
import * as graphlib from 'graphlib';

import {Event, Method} from '../chrome/DebuggerWebAudioDomain';
import {Utils} from '../utils/Types';
import {Observer} from '../utils/Observer';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {Audion} from './Types';
import {WebAudioEventObserver} from './WebAudioEventObserver';
import {invariant} from '../utils/error';
import {chrome} from '../chrome';
import {WebAudioRealtimeData} from './WebAudioRealtimeData';
import Protocol from 'devtools-protocol';
import {Observable, Subscription} from 'rxjs';

type WebAudioEventName = keyof ProtocolMapping.Events & `WebAudio.${string}`;

type EventHandlers = {
  readonly [K in WebAudioEventName]: (
    onNext: Utils.SubscribeOnNext<Audion.GraphContext>,
    event: ProtocolMapping.Events[K][0],
  ) => void;
};

const CONTEXT_REALTIME_DATA_ZEROED = {
  callbackIntervalMean: 0,
  callbackIntervalVariance: 0,
  currentTime: 0,
  renderCapacity: 0,
};

const {tabId} = chrome.devtools.inspectedWindow;

/**
 * Collect WebAudio debugger events into per context graphs.
 * @memberof Audion
 * @alias WebAudioGraphIntegrator
 */
export class WebAudioGraphIntegrator extends Observer<Audion.GraphContext> {
  readonly contexts: {[key: string]: Audion.GraphContext} = {};
  readonly realtimeDataPoll: {[key: string]: Subscription} = {};

  /**
   * Create a WebAudioGraphIntegrator.
   */
  constructor(
    webAudioEvents: WebAudioEventObserver,
    private webAudioRealtimeData: WebAudioRealtimeData,
  ) {
    super((onNext, ...args) => {
      return webAudioEvents.observe((event) => {
        this.eventHandlers[event.method]?.(onNext, event.params as any);
      }, ...args);
    });
  }

  private readonly eventHandlers: Partial<EventHandlers> = {
    [Event.audioNodeCreated]: (onNext, audioNodeCreated) => {
      const context = this.contexts[audioNodeCreated.node.contextId];
      invariant(
        context && context !== null,
        'context %0 must exist',
        audioNodeCreated.node.contextId,
      );
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
      onNext(context);
    },

    [Event.audioNodeWillBeDestroyed]: (onNext, audioNodeDestroyed) => {
      const context = this.contexts[audioNodeDestroyed.contextId];
      context.graph.removeNode(audioNodeDestroyed.nodeId);
      delete context.nodes[audioNodeDestroyed.nodeId];
      onNext(context);
    },

    [Event.audioParamCreated]: (onNext, audioParamCreated) => {
      const context = this.contexts[audioParamCreated.param.contextId];
      const node = context.nodes[audioParamCreated.param.nodeId];
      if (!node) {
        return;
      }
      node.params.push(audioParamCreated.param);
      context.params[audioParamCreated.param.paramId] = audioParamCreated.param;
    },

    [Event.audioParamWillBeDestroyed]: (onNext, audioParamWillBeDestroyed) => {
      const context = this.contexts[audioParamWillBeDestroyed.contextId];
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

    [Event.contextChanged]: (onNext, contextChanged) => {
      this.contexts[contextChanged.context.contextId].context =
        contextChanged.context;
      onNext(this.contexts[contextChanged.context.contextId]);
    },

    [Event.contextCreated]: (onNext, contextCreated) => {
      const contextId = contextCreated.context.contextId;

      const graph = new dagre.graphlib.Graph({multigraph: true});
      graph.setGraph({});
      graph.setDefaultEdgeLabel(() => {
        return {};
      });
      this.contexts[contextId] = {
        id: contextId,
        context: contextCreated.context,
        realtimeData: CONTEXT_REALTIME_DATA_ZEROED,
        nodes: {},
        params: {},
        // TODO: dagre's graphlib typings are inaccurate, which is why we use
        // graphlib's types. Revert to dagre's types once the issue is fixed:
        // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/47439
        graph: graph as unknown as graphlib.Graph,
      };
      onNext(this.contexts[contextId]);

      this.realtimeDataPoll[contextId] = this.webAudioRealtimeData
        .pollContext(contextId)
        .subscribe({
          next: (realtimeData) => {
            if (this.contexts[contextId]) {
              this.contexts[contextId] = {
                ...this.contexts[contextId],
                realtimeData,
              };
              onNext(this.contexts[contextId]);
            }
          },
          error(reason) {
            console.error(
              `Error requesting realtime data context for ${contextId}.${
                reason ? `\n${reason.message}` : reason
              }`,
            );
          },
        });
    },

    [Event.contextWillBeDestroyed]: (onNext, contextDestroyed) => {
      const contextId = contextDestroyed.contextId;

      delete this.contexts[contextId];

      onNext({
        id: contextDestroyed.contextId,
        context: null,
        realtimeData: null,
        nodes: null,
        params: null,
        graph: null,
      });

      this.realtimeDataPoll[contextId].unsubscribe();
    },

    [Event.nodeParamConnected]: (onNext, nodeParamConnected) => {
      const context = this.contexts[nodeParamConnected.contextId];
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
      onNext(context);
    },

    [Event.nodeParamDisconnected]: (onNext, nodesDisconnected) => {
      const context = this.contexts[nodesDisconnected.contextId];
      const {edges} = context.nodes[nodesDisconnected.sourceId];
      const {
        sourceId,
        sourceOutputIndex = 0,
        destinationId,
      } = nodesDisconnected;
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
      onNext(context);
    },

    [Event.nodesConnected]: (onNext, nodesConnected) => {
      const context = this.contexts[nodesConnected.contextId];
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
      onNext(context);
    },

    [Event.nodesDisconnected]: (onNext, nodesDisconnected) => {
      const context = this.contexts[nodesDisconnected.contextId];
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
      onNext(context);
    },
  };
}
