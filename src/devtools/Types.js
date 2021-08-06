/// <reference path="../chrome/DebuggerWebAudioDomain.js" />

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
 */

/**
 * @typedef Audion.GraphNode
 * @property {ChromeDebuggerWebAudioDomain.AudioNode} node
 * @property {Array<ChromeDebuggerWebAudioDomain.NodesConnectedEvent>} edges
 */

/**
 * @typedef {Utils.Observer<Audion.WebAudioEvent>}
 *   Audion.WebAudioEventObserver
 */
