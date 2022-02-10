/// <reference path="API.js" />
/// <reference path="Types.js" />

/**
 * Global chrome extension api instance.
 *
 * Normally available on the global context `chrome` identifier. Use this export
 * to assist in testing use of the chrome extension api from inside this
 * extension.
 *
 * @type {Chrome.API}
 * @memberof Chrome
 * @alias chrome
 */
export const chrome = getChrome();

/**
 * Return a no-operation implementation of Chrome.API. Used in testing.
 *
 * @return {Chrome.API}
 * @memberof Chrome
 */
function noopChrome() {
  /**
   * @return {Chrome.Event<*>}
   */
  function noopEvent() {
    return {addListener() {}, removeListener() {}};
  }
  return {
    debugger: {
      attach() {},
      detach() {},
      onDetach: noopEvent(),
      onEvent: noopEvent(),
      sendCommand() {},
    },
    devtools: {
      inspectedWindow: {tabId: 'tab'},
      network: {onNavigated: noopEvent()},
      panels: {create() {}},
    },
    runtime: {
      connect() {
        return {
          onDisconnect: noopEvent(),
          onMessage: noopEvent(),
          disconnect() {},
          postMessage(message) {},
        };
      },
      getURL(url) {
        return url;
      },
      lastError: undefined,
      onConnect: noopEvent(),
    },
  };
}

/**
 * Return the global scope.
 *
 * @return {*}
 * @memberof Chrome
 */
function getGlobal() {
  if (typeof window === 'object') return window;
  if (typeof self === 'object') return self;
  if (typeof globalThis === 'object') return globalThis;
  if (typeof global === 'object') return global;
  if (typeof process === 'object') return process;
  throw new Error('Cannot find global object');
}

/**
 * Return a {@link Chrome.API} instance. Return a copy from
 * {@link Chrome.noopChrome} if running under a unit test environment.
 *
 * @return {Chrome.API}
 * @memberof Chrome
 */
function getChrome() {
  const g = getGlobal();
  if ('chrome' in g && typeof g.chrome === 'object') return g.chrome;
  return noopChrome();
}
