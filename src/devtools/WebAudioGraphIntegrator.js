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
          const audioNodeCreated =
            /** @type {ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent} */ (
              message.params
            );
          const context = this.contexts[audioNodeCreated.node.contextId];
          context.nodes[audioNodeCreated.node.nodeId] = {
            node: audioNodeCreated.node,
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
          const audioNodeDestroyed = /**
           * @type {ChromeDebuggerWebAudioDomain.AudioNodeWillBeDestroyedEvent}
           */ (message.params);
          const context = this.contexts[audioNodeDestroyed.contextId];
          context.graph.removeNode(audioNodeDestroyed.nodeId);
          delete context.nodes[audioNodeDestroyed.nodeId];
          onNext(context);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextChanged:
        {
          const contextChanged =
            /** @type {ChromeDebuggerWebAudioDomain.ContextChangedEvent} */ (
              message.params
            );
          this.contexts[contextChanged.context.contextId].context =
            contextChanged.context;
          onNext(this.contexts[contextChanged.context.contextId]);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextCreated:
        {
          const contextCreated =
            /** @type {ChromeDebuggerWebAudioDomain.ContextCreatedEvent} */ (
              message.params
            );
          const graph = new dagre.graphlib.Graph();
          graph.setGraph({});
          graph.setDefaultEdgeLabel(() => {
            return {};
          });
          this.contexts[contextCreated.context.contextId] = {
            id: contextCreated.context.contextId,
            context: contextCreated.context,
            nodes: {},
            graph,
          };
          onNext(this.contexts[contextCreated.context.contextId]);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.contextWillBeDestroyed:
        {
          const contextDestroyed = /**
           * @type {ChromeDebuggerWebAudioDomain.ContextWillBeDestroyedEvent}
           */ (message.params);
          delete this.contexts[contextDestroyed.contextId];

          onNext({
            id: contextDestroyed.contextId,
            context: null,
            nodes: null,
            graph: null,
          });
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesConnected:
        {
          const nodesConnected =
            /** @type {ChromeDebuggerWebAudioDomain.NodesConnectedEvent} */ (
              message.params
            );
          const context = this.contexts[nodesConnected.contextId];
          context.nodes[nodesConnected.sourceId].edges.push(nodesConnected);
          const {sourceId, destinationId} = nodesConnected;
          context.graph.setEdge(`${sourceId}`, `${destinationId}`);
          onNext(context);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesDisconnected:
        {
          const nodesDisconnected =
            /** @type {ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent} */ (
              message.params
            );
          const context = this.contexts[nodesDisconnected.contextId];
          const {edges} = context.nodes[nodesDisconnected.sourceId];
          edges.splice(
            edges.findIndex(
              (edge) =>
                edge.destinationId === nodesDisconnected.destinationId &&
                edge.sourceOutputIndex ===
                  nodesDisconnected.sourceOutputIndex &&
                edge.destinationInputIndex ===
                  nodesDisconnected.destinationInputIndex,
            ),
          );
          context.graph.removeEdge(
            nodesDisconnected.sourceId,
            nodesDisconnected.destinationId,
          );
          onNext(context);
        }
        break;
    }
  }
}
