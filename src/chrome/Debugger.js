/// <reference path="Types.js" />

/**
 * [Chrome extension api][1] to the [Chrome Debugger Protocol][2]. Used by this
 * extension to access the [Web Audio domain][3].
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/debugger/
 * [2]: https://chromedevtools.github.io/devtools-protocol/
 * [3]: ChromeDebuggerWebAudioDomain.html
 *
 * @typedef Chrome.Debugger
 * @property {function(
 *   Chrome.DebuggerDebuggee, string, function(): void
 * ): void} attach
 * @property {function(Chrome.DebuggerDebuggee, function(): void): void} detach
 * @property {Chrome.Event<function(): void>} onDetach
 * @property {Chrome.Event<Chrome.DebuggerOnEventListener>} onEvent
 * @property {function(Chrome.DebuggerDebuggee, string): void} sendCommand
 * @see https://developer.chrome.com/docs/extensions/reference/debugger/
 * @see https://chromedevtools.github.io/devtools-protocol/
 */

/**
 * A debuggee identifier.
 *
 * Either tabId or extensionId must be specified.
 *
 * @typedef Chrome.DebuggerDebuggee
 * @property {string} [extensionId]
 * @property {string} [tabId]
 * @property {string} [targetId]
 * @see https://developer.chrome.com/docs/extensions/reference/debugger/#type-Debuggee
 */

/**
 * Arguments passed to Debugger onEvent listeners.
 *
 * @callback Chrome.DebuggerOnEventListener
 * @param {Chrome.DebuggerDebuggee} source
 * @param {string} method
 * @param {*} [params]
 * @return {void}
 */
