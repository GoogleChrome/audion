/// <reference path="Types.js" />

/**
 * [Chrome extension api][1] to devtool inspector available to a extension's
 * devtools page specified by the extension manifest's `"devtools_page"`.
 *
 * [1]: https://developer.chrome.com/docs/extensions/mv3/devtools/
 *
 * @typedef Chrome.DevTools
 * @property {Chrome.DevToolsInspectedWindow} inspectedWindow
 * @property {Chrome.DevToolsPanels} panels
 */

/**
 * [Extension api][1] for the tab inspected by this `"devtools_page"` instance.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/devtools_inspectedWindow/
 *
 * @typedef Chrome.DevToolsInspectedWindow
 * @property {string} tabId
 */

/**
 * [Extension api][1] to manage panels this extension adds.
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/devtools_panels/
 *
 * @typedef Chrome.DevToolsPanels
 * @property {Chrome.DevToolsPanelsCreateFunction} create
 */

/**
 * [`chrome.devtools.panels.create(...)`][1]
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/devtools_panels/#method-create
 *
 * @callback Chrome.DevToolsPanelsCreateFunction
 * @param {string} title
 * @param {string} icon
 * @param {string} pageUrl
 * @param {Chrome.DevToolsPanelsCreateCallback} onPanelCreated
 * @return {void}
 */

/**
 * @callback Chrome.DevToolsPanelsCreateCallback
 * @param {Chrome.DevToolsPanel} panel
 * @return {void}
 */

/**
 * [Panel][1] created by [`chrome.devtools.panels.create`][2].
 *
 * [1]: https://developer.chrome.com/docs/extensions/reference/devtools_panels/#type-ExtensionPanel
 * [2]: Chrome.html#.DevToolsPanelsCreateFunction
 *
 * @typedef Chrome.DevToolsPanel
 * @property {Chrome.Event<function(): void>} onHidden
 * @property {Chrome.Event<function(): void>} onShown
 */
