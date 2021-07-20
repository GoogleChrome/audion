/** @namespace Utils */

/**
 * @typedef Utils.Observer
 * @property {Utils.ObserverObserveMethod<T>} observe
 * @template T
 */

/**
 * @callback Utils.ObserverObserveMethod
 * @param {Utils.SubscribeOnNext<T>} onNext
 * @param {function(): void} [onComplete]
 * @param {function(*): void} [onError]
 * @return {function(): void}
 * @template T
 */

/**
 * @callback Utils.SubscribeCallback
 * @param {Utils.SubscribeOnNext<T>} onNext
 * @param {function(): void} onComplete
 * @param {function(*): void} onError
 * @return {function(): void}
 * @template T
 * @alias SubscribeCallback
 */

/**
 * @callback Utils.SubscribeOnNext
 * @param {T} value
 * @return {void}
 * @template T
 * @alias SubscribeOnNext
 */

/**
 * @typedef Utils.Cancelable
 * @property {T} [value]
 * @property {boolean} canceled
 * @template T
 * @alias Cancelable
 */

/**
 * @typedef Utils.CancelablePromise
 * @property {Promise<Utils.Cancelable<T>>} promise
 * @property {function(): void} cancel
 * @template T
 * @alias CancelablePromise
 */

/**
 * @typedef Utils.ThrottleObserverOptions
 * @property {function(): Promise<void>} [timeout]
 * @alias ThrottleObserverOptions
 */

/**
 * @typedef Utils.RetryOptions
 * @property {function(): Promise<void>} [timeout]
 * @property {number} [times=10]
 */
