/// <reference path="../utils/Types.js" />

import {chrome} from '../chrome';

import {Observer} from '../utils/Observer';

/**
 * Connect to chrome runtime through an observer.
 * @return {Utils.Observer<T>}
 * @template T
 */
export function connect() {
  return new Observer((onNext, ...args) => {
    const port = chrome.runtime.connect();
    port.onMessage.addListener((message) => {
      onNext(message);
    });
    return () => {
      port.disconnect();
    };
  });
}
