/// <reference path="Types.js" />

/**
 * @typedef Chrome.Runtime
 * @property {function(): Chrome.RuntimePort} connect
 * @property {function(string): string} getURL
 * @property {Chrome.Event<function(Chrome.RuntimePort): void>} onConnect
 */
/**
 * @typedef Chrome.RuntimePort
 * @property {function(): void} disconnect
 * @property {Chrome.Event<function(Chrome.RuntimePort): void>} onDisconnect
 * @property {Chrome.Event<function(*, Chrome.RuntimePort): void>} onMessage
 * @property {function(*): void} postMessage
 */
