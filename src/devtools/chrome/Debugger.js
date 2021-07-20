/// <reference path="Types.js" />

/**
 * @typedef Chrome.Debugger
 * @property {function(string, string, function(): void): void} attach
 * @property {function(string, function(): void): void} detach
 * @property {Chrome.Event<function(): void>} onDetach
 * @property {Chrome.Event<function(*, *, *): void>} onEvent
 * @property {function(string, string): void} sendCommand
 */
