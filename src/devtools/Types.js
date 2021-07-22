/// <reference path="../chrome/DebuggerWebAudio.js" />

/** @namespace Audion */

/**
 * @typedef Audion.WebAudioEvent
 * @property {ChromeDebuggerWebAudio.EventName} method
 * @property {ChromeDebuggerWebAudio.Event} params
 */

/**
 * @typedef Audion.GraphContext
 * @property {ChromeDebuggerWebAudio.GraphObjectId} id
 * @property {ChromeDebuggerWebAudio.BaseAudioContext} context
 * @property {Object<string, Audion.GraphNode>} nodes
 */

/**
 * @typedef Audion.GraphNode
 * @property {ChromeDebuggerWebAudio.AudioNode} node
 * @property {Array<ChromeDebuggerWebAudio.NodesConnectedEvent>} edges
 */

/**
 * @typedef {Utils.Observer<Audion.WebAudioEvent>}
 *   Audion.WebAudioEventObserver
 */
