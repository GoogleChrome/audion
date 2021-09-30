/// <reference path="../chrome/DebuggerWebAudioDomain.ts" />

/** @namespace Audion */

/**
 * @typedef Audion.WebAudioEvent
 * @property {ChromeDebuggerWebAudioDomain.EventName} method
 * @property {ChromeDebuggerWebAudioDomain.Event} params
 */

/**
 * @typedef Audion.GraphContext
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} id
 * @property {ChromeDebuggerWebAudioDomain.BaseAudioContext} context
 * @property {Object<string, Audion.GraphNode>} nodes
 * @property {Object<string, ChromeDebuggerWebAudioDomain.AudioParam>} params
 * @property {object} graph
 */

/**
 * @typedef Audion.GraphNode
 * @property {ChromeDebuggerWebAudioDomain.AudioNode} node
 * @property {Array<ChromeDebuggerWebAudioDomain.AudioParam>} params
 * @property {Array<ChromeDebuggerWebAudioDomain.NodesConnectedEvent>} edges
 */

/**
 * @typedef {Utils.Observer<Audion.WebAudioEvent>}
 *   Audion.WebAudioEventObserver
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
