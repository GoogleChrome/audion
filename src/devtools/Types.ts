/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

import {Protocol} from 'devtools-protocol/types/protocol';
import {Graph} from 'graphlib';

/** @namespace Audion */
/**
 * @typedef Audion.WebAudioEvent
 * @property {ChromeDebuggerWebAudioDomain.EventName} method
 * @property {ChromeDebuggerWebAudioDomain.Event} params
 */

export namespace Audion {
  export interface GraphContext {
    id: Protocol.WebAudio.GraphObjectId;
    context: Protocol.WebAudio.BaseAudioContext;
    nodes: {[key: string]: GraphNode};
    params: {[key: string]: Protocol.WebAudio.AudioParam};
    graph: Graph;
  }

  export interface GraphNode {
    node: Protocol.WebAudio.AudioNode;
    params: Protocol.WebAudio.AudioParam[];
    edges: Protocol.WebAudio.NodesConnectedEvent[];
  }

  export interface WebAudioEvent {
    method: string;
    params: any;
  }
}

/**
 * @typedef Audion.GraphContext
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} id
 * @property {ChromeDebuggerWebAudioDomain.BaseAudioContext} context
 * @property {Object<string, Audion.GraphNode>} nodes
 * @property {Object<string, ChromeDebuggerWebAudioDomain.AudioParam>} params
 * @property {object} graph
 */

/**
 * @typedef Audion.GraphContextMessage
 * @property {Audion.GraphContext} graphContext
 */

/**
 * @typedef Audion.AllGraphsMessage
 * @property {Object<string, Audion.GraphContext>} allGraphs
 */

/**
 * @typedef {Audion.GraphContextMessage
 *   | Audion.AllGraphsMessage
 *   } Audion.DevtoolsMessage
 */

/**
 * @typedef {Utils.Observer<Audion.DevtoolsMessage>} Audion.DevtoolsObserver
 */
