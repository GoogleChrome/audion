/// <reference path="Types.js" />

/**
 * @typedef Chrome.Runtime
 * @property {function(string): string} getUrl
 * @property {Chrome.Event<function(Chrome.RuntimePort): void>} onConnect
 */
/**
 * @typedef Chrome.RuntimePort
 * @property {Chrome.Event<function(Chrome.RuntimePort): void>} onDisconnect
 * @property {Chrome.Event<function(*, Chrome.RuntimePort): void>} onMessage
 * @property {function(*): void} postMessage
 */
