/// <reference path="Types.js" />

/**
 * @typedef Chrome.DevTools
 * @property {Chrome.DevToolsInspectedWindow} inspectedWindow
 * @property {Chrome.DevToolsPanels} panels
 */
/**
 * @typedef Chrome.DevToolsInspectedWindow
 * @property {string} tabId
 */
/**
 * @typedef Chrome.DevToolsPanels
 * @property {Chrome.DevToolsPanelsCreateFunction} create
 */
/**
 * @callback Chrome.DevToolsPanelsCreateFunction
 * @param {string} title
 * @param {string} icon
 * @param {string} pageUrl
 * @param {function(Chrome.DevToolsPanel): void} onPanelCreated
 * @return {void}
 */
/**
 * @typedef Chrome.DevToolsPanel
 * @property {Chrome.Event<function(): void>} onHidden
 * @property {Chrome.Event<function(): void>} onShown
 */
