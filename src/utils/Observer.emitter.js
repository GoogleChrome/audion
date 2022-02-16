/// <reference path="Types.ts" />

import {Observer} from './Observer';

/**
 * @param {Utils.DataEmitter<T>} emitter
 * @return {Utils.Observer<T>}
 * @template T
 */
export function observeMessageEvents(emitter) {
  return new Observer((onNext) => {
    const onMessage = (message) => onNext(message.data);
    emitter.addEventListener('message', onMessage);
    return () => {
      emitter.removeEventListener('message', onMessage);
    };
  });
}

/**
 * @param {Utils.Observer<T>} observer
 * @param {Utils.Poster<T>} poster
 * @return {function(): void} stop posting observations
 * @template T
 */
export function postObservations(observer, poster) {
  return observer.observe((message) => poster.postMessage(message));
}
