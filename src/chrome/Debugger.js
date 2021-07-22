/// <reference path="Types.js" />

/**
 * @typedef Chrome.DebuggerDebuggee
 * @property {string} [extensionId]
 * @property {string} [tabId]
 * @property {string} [targetId]
 */
/**
 * @typedef Chrome.Debugger
 * @property {function(
 *   Chrome.DebuggerDebuggee, string, function(): void
 * ): void} attach
 * @property {function(Chrome.DebuggerDebuggee, function(): void): void} detach
 * @property {Chrome.Event<function(): void>} onDetach
 * @property {Chrome.Event<function(*, *, *): void>} onEvent
 * @property {function(Chrome.DebuggerDebuggee, string): void} sendCommand
 */
