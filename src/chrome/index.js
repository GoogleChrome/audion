/// <reference path="API.js" />
/// <reference path="Types.js" />

/**
 * @type {Chrome.API}
 * @memberof Chrome
 * @alias chrome
 */
export const chrome = getChrome();

/**
 * Return a no-operation implementation of Chrome.API.
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
    devtools: {inspectedWindow: {tabId: 'tab'}, panels: {create() {}}},
    runtime: {
      getURL(url) {
        return url;
      },
      onConnect: noopEvent(),
    },
  };
}

/**
 * Return the global scope.
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
 * @return {Chrome.API}
 * @memberof Chrome
 */
function getChrome() {
  const g = getGlobal();
  if ('chrome' in g && typeof g.chrome === 'object') return g.chrome;
  return noopChrome();
}
