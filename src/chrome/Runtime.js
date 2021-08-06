/// <reference path="Types.js" />

/**
 * [Chrome extension api][1] about the extension the host platform and
 * communication betwen different extension contexts.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/runtime/
 *
 * @typedef Chrome.Runtime
 * @property {function(): Chrome.RuntimePort} connect
 * @property {function(string): string} getURL
 * @property {Chrome.Event<Chrome.RuntimeOnConnectCallback>} onConnect
 */

/**
 * Callback passed to [`chrome.runtime.onConnect`][1].
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onConnect
 *
 * @callback Chrome.RuntimeOnConnectCallback
 * @param {Chrome.RuntimePort} port
 * @return {void}
 */

/**
 * [Port][1] to another chrome extension runtime context.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/runtime/#type-Port
 *
 * @typedef Chrome.RuntimePort
 * @property {function(): void} disconnect
 * @property {Chrome.Event<function(Chrome.RuntimePort): void>} onDisconnect
 * @property {Chrome.Event<function(*, Chrome.RuntimePort): void>} onMessage
 * @property {function(*): void} postMessage
 */
