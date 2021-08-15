/// <reference path="../chrome/DebuggerWebAudioDomain.js" />
/// <reference path="../utils/Types.js" />
/// <reference path="WebAudioEventObserver.js" />

import dagre from 'dagre';

import {ChromeDebuggerWebAudioDomain} from '../chrome/DebuggerWebAudioDomain';
import {Observer} from '../utils/Observer';

/**
 * Collect WebAudio debugger events into per context graphs.
 * @extends {Observer<Audion.GraphContext>}
 * @memberof Audion
 * @alias WebAudioGraphIntegrator
 */
export class WebAudioGraphIntegrator extends Observer {
  /**
   * Create a WebAudioGraphIntegrator.
   * @param {Audion.WebAudioEventObserver} webAudioEvents
   */
  constructor(webAudioEvents) {
    /**
     * @type {Object<string, Audion.GraphContext>}
     */
    const contexts = {};
    super((onNext, ...args) => {
      this.contexts = contexts;
      return webAudioEvents.observe(
        this._onMessage.bind(this, onNext),
        ...args,
      );
    });
  }

  /**
   * @param {Utils.SubscribeOnNext<Audion.GraphContext>} onNext
   * @param {Audion.WebAudioEvent} message
   */
  _onMessage(onNext, message) {
    switch (message.method) {
      case ChromeDebuggerWebAudioDomain.Events.audioNodeCreated:
        {
          /** @type {ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent} */
          const audioNodeCreated = message.params;
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.audioNodeWillBeDestroyed:
        {
          /**
           * @type {ChromeDebuggerWebAudioDomain.AudioNodeWillBeDestroyedEvent}
           */
          const audioNodeDestroyed = message.params;
          const context = this.contexts[audioNodeDestroyed.contextId];
          context.graph.removeNode(audioNodeDestroyed.nodeId);
          delete context.nodes[audioNodeDestroyed.nodeId];
          onNext(context);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.audioParamCreated:
        {
          /** @type {ChromeDebuggerWebAudioDomain.AudioParamCreatedEvent} */
          const audioParamCreated = message.params;
          const context = this.contexts[audioParamCreated.param.contextId];
          const node = context.nodes[audioParamCreated.param.nodeId];
          if (!node) {
            break;
          }
          node.params.push(audioParamCreated.param);
          context.params[audioParamCreated.param.paramId] =
            audioParamCreated.param;
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.audioParamWillBeDestroyed:
        {
          /**
           * @type {ChromeDebuggerWebAudioDomain.AudioParamWillBeDestroyedEvent}
           */
          const audioParamWillBeDestroyed = message.params;
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextChanged:
        {
          /** @type {ChromeDebuggerWebAudioDomain.ContextChangedEvent} */
          const contextChanged = message.params;
          this.contexts[contextChanged.context.contextId].context =
            contextChanged.context;
          onNext(this.contexts[contextChanged.context.contextId]);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextCreated:
        {
          /** @type {ChromeDebuggerWebAudioDomain.ContextCreatedEvent} */
          const contextCreated = message.params;
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextWillBeDestroyed:
        {
          /**
           * @type {ChromeDebuggerWebAudioDomain.ContextWillBeDestroyedEvent}
           */
          const contextDestroyed = message.params;
          delete this.contexts[contextDestroyed.contextId];

          onNext({
            id: contextDestroyed.contextId,
            context: null,
            nodes: null,
            params: null,
            graph: null,
          });
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodeParamConnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodeParamConnectedEvent} */
          const nodeParamConnected = message.params;
          const context = this.contexts[nodeParamConnected.contextId];
          context.nodes[nodeParamConnected.sourceId].edges.push(
            nodeParamConnected,
          );
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodeParamDisconnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodeParamDisconnectedEvent} */
          const nodesDisconnected = message.params;
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesConnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodesConnectedEvent} */
          const nodesConnected = message.params;
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
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesDisconnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent} */
          const nodesDisconnected = message.params;
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
        }
        break;
    }
  }
}
