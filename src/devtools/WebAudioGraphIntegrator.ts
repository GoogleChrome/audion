import dagre from 'dagre';

import {Events} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';
import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';

type WebAudioEventName = keyof ProtocolMapping.Events & `WebAudio.${string}`;

type EventHandlers = {
  readonly [K in WebAudioEventName]: (
    onNext: Utils.SubscribeOnNext<Audion.GraphContext>,
    event: ProtocolMapping.Events[K][0],
  ) => void;
};

/**
 * Collect WebAudio debugger events into per context graphs.
 * @memberof Audion
 * @alias WebAudioGraphIntegrator
 */
export class WebAudioGraphIntegrator extends Observer<Audion.GraphContext> {
  readonly contexts: {[key: string]: Audion.GraphContext} = {};

  /**
   * Create a WebAudioGraphIntegrator.
   */
  constructor(webAudioEvents: Audion.WebAudioEventObserver) {
    super((onNext, ...args) => {
      return webAudioEvents.observe((event) => {
        this.eventHandlers[event.method]?.(onNext, event.params);
      }, ...args);
    });
  }

  private readonly eventHandlers: Partial<EventHandlers> = {
    [Events.audioNodeCreated]: (onNext, audioNodeCreated) => {
      const context = this.contexts[audioNodeCreated.node.contextId];
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

    [Events.audioNodeWillBeDestroyed]: (onNext, audioNodeDestroyed) => {
      const context = this.contexts[audioNodeDestroyed.contextId];
      context.graph.removeNode(audioNodeDestroyed.nodeId);
      delete context.nodes[audioNodeDestroyed.nodeId];
      onNext(context);
    },

    [Events.audioParamCreated]: (onNext, audioParamCreated) => {
      const context = this.contexts[audioParamCreated.param.contextId];
      const node = context.nodes[audioParamCreated.param.nodeId];
      if (!node) {
        return;
      }
      node.params.push(audioParamCreated.param);
      context.params[audioParamCreated.param.paramId] = audioParamCreated.param;
    },

    [Events.audioParamWillBeDestroyed]: (onNext, audioParamWillBeDestroyed) => {
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

    [Events.contextChanged]: (onNext, contextChanged) => {
      this.contexts[contextChanged.context.contextId].context =
        contextChanged.context;
      onNext(this.contexts[contextChanged.context.contextId]);
    },

    [Events.contextCreated]: (onNext, contextCreated) => {
      const graph = new dagre.graphlib.Graph({multigraph: true});
      graph.setGraph({});
      graph.setDefaultEdgeLabel(() => {
        return {};
      });
      this.contexts[contextCreated.context.contextId] = {
        id: contextCreated.context.contextId,
        context: contextCreated.context,
        nodes: {},
        params: {},
        graph,
      };
      onNext(this.contexts[contextCreated.context.contextId]);
    },

    [Events.contextWillBeDestroyed]: (onNext, contextDestroyed) => {
      delete this.contexts[contextDestroyed.contextId];

      onNext({
        id: contextDestroyed.contextId,
        context: null,
        nodes: null,
        params: null,
        graph: null,
      });
    },

    [Events.nodeParamConnected]: (onNext, nodeParamConnected) => {
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

    [Events.nodeParamDisconnected]: (onNext, nodesDisconnected) => {
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

    [Events.nodesConnected]: (onNext, nodesConnected) => {
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

    [Events.nodesDisconnected]: (onNext, nodesDisconnected) => {
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
