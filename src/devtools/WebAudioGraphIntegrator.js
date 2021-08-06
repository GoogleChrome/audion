/// <reference path="../chrome/DebuggerWebAudioDomain.js" />
/// <reference path="../utils/Types.js" />
/// <reference path="WebAudioEventObserver.js" />

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
            edges: [],
          };
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
          delete context.nodes[audioNodeDestroyed.nodeId];
          onNext(context);
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
          this.contexts[contextCreated.context.contextId] = {
            id: contextCreated.context.contextId,
            context: contextCreated.context,
            nodes: {},
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
          });
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesConnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodesConnectedEvent} */
          const nodesConnected = message.params;
          const context = this.contexts[nodesConnected.contextId];
          context.nodes[nodesConnected.sourceId].edges.push(nodesConnected);
          onNext(context);
        }
        break;
      case ChromeDebuggerWebAudioDomain.Events.nodesDisconnected:
        {
          /** @type {ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent} */
          const nodesDisconnected = message.params;
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
          onNext(context);
        }
        break;
    }
  }
}
