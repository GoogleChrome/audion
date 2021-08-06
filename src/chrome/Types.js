/**
 * Types provided by the [chrome extension api][1].
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/
 *
 * @namespace Chrome
 */

/**
 * Generic [event emitter][1] in chrome extension types.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/events/#type-Event
 *
 * @typedef Chrome.Event
 * @property {Chrome.EventCallback<T>} addListener
 * @property {Chrome.EventCallback<T>} removeListener
 * @template {function} T
 */

/**
 * Function taking an event listener passed to a {@link Chrome.Event} instance.
 *
 * @callback Chrome.EventCallback
 * @param {T} callback
 * @template {function} T
 */
