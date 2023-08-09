/**
 * [Chrome extension api][1] about using storage in extensions.
 * It can be used to store, retrieve, and track changes to user data.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/storage/
 *
 * @typedef Chrome.Storage
 * @property {Chrome.StorageArea} local
 * @property {Chrome.StorageArea} sync
 * @property {Chrome.StorageArea} managed
 * @property {Chrome.Event<Chrome.StorageOnChangeCallback>} onChanged
 */

/**
 * Represents a storage area.
 *
 * @typedef Chrome.StorageArea
 * @property {function(string | Object | string[],
 *     function(Object): void): void} get
 * @property {function(Object, function(): void): void} set
 * @property {function(string | string[], function(): void): void} remove
 * @property {function(function(): void): void} clear
 * @property {function(function(number): void): void} getBytesInUse
 */

/**
 * Callback for changes to storage area.
 *
 * @callback Chrome.StorageOnChangeCallback
 * @param {Object} changes
 * @param {string} areaName
 * @return {void}
 */
