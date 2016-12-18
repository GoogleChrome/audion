/**
 * @fileoverview An extern for the API for Chrome Developer Tools extensions.
 * TODO: Move into central repo.
 * @externs
 */


chrome.devtools = {};


chrome.devtools.inspectedWindow = {};


/**
 * The ID of the tab being inspected.
 * See http://developer.chrome.com/extensions/devtools.inspectedWindow.html#property-tabId
 * @type {number}
 */
chrome.devtools.inspectedWindow.tabId;


/**
 * A resource fetched from the network.
 * @constructor
 */
var ChromeResource = function() {};


/**
 * Gets the content of a resource.
 * @param {function(string, string)} callback A callback that takes content of
 *     the resource (potentially encoded) and the name of the encoding if
 *     applicable.
 */
ChromeResource.prototype.getContent = function(callback) {};


/**
 * Sets the content of a resource.
 * @param {string} content New content of the resource. Only resources with the
 *     text type are currently supported.
 * @param {boolean} commit True if the user has finished editing the resource,
 *     and the new content of the resource should be persisted; false if this is
 *     a minor change sent in progress of the user editing the resource.
 * @param {function(!Object=)=} opt_callback A function called upon request
 *     completion. If you specify the callback parameter, it should be a
 *     function that looks like this: function(object error) {...};
 */
ChromeResource.prototype.setContent = function(
    content, commit, opt_callback) {};


/**
 * A function for retrieving resources from the network.
 * @param {function(!Array.<!ChromeResource>)} callback
 */
chrome.devtools.inspectedWindow.getResources = function(callback) {};


chrome.devtools.network = {};


/**
 * Fired when a request finishes. Usage:
 * chrome.devtools.network.onRequestFinished.addListener(
 *     function(request) {...});
 * @type {ChromeEvent}
 */
chrome.devtools.network.onRequestFinished;


chrome.devtools.panels = {};



/**
 * A panel created by an extension.
 * @constructor
 */
function ExtensionPanel() {}


/**
 * A listener that fires when the user switches to the panel.
 * @type {ChromeEvent}
 */
ExtensionPanel.prototype.onShown;


/**
 * A listener that fires when the user switches away from the panel.
 * @type {ChromeEvent}
 */
ExtensionPanel.prototype.onHidden;


/**
 * Represents a panel window in the developer tools.
 */
ExtensionPanel.enabledPanelWindow;


/**
 * Appends a button to the status bar of the panel.
 * @param {string} iconPath Path to the icon of the button. The file should
 *     contain a 64x24-pixel image composed of two 32x24 icons. The left icon is
 *     used when the button is inactive; the right icon is displayed when the
 *     button is pressed.
 * @param {string} tooltipText Text shown as a tooltip when user hovers the
 *     mouse over the button.
 * @param {boolean} disabled Whether the button is disabled.
 */
ExtensionPanel.prototype.createStatusBarButton = function(
    iconPath, tooltipText, disabled) {};


/**
 * Creates an extension panel.
 * @param {string} title Title that is displayed next to the extension icon in
 *     the Developer Tools toolbar.
 * @param {string} iconPath Path of the panel's icon relative to the extension
 *     directory. The file should contain a 56x64-pixel image composed of four
 *     icons. The top-left icon is used for the undocked passive state, the
 *     bottom-left for the undocked pressed state, the top-right for the docked
 *     passive state, and the bottom-right for the docked pressed state.
 * @param {string} pagePath Path of the panel's HTML page relative to the
 *     extension directory.
 * @param {function(!ExtensionPanel)=} opt_callback A function that is called
 *     when the panel is created.
 */
chrome.devtools.panels.create = function(
    title, iconPath, pagePath, opt_callback) {};


/**
 * Opens a resource in the dev tools Sources panel.
 * @param {string} scriptUrl the URL of the script.
 * @param {number} lineNumber The line number to go to.
 * @param {function()} opt_callback Runs after we navigate to the resource.
 */
chrome.devtools.panels.openResource = function(
    scriptUrl, lineNumber, opt_callback) {};



/**
 * Represents a network request for a document resource (script, image and so
 * on) in HAR entry format
 * {@link http://www.softwareishard.com/blog/har-12-spec/#entries}.
 * @constructor
 */
function BrowserRequest() {}


/**
 * Detailed info about the request.
 * @type {{url: string}}
 */
BrowserRequest.prototype.request;


/**
 * Detailed info about the response.
 * @type {{headers: !Array<HttpHeader>}}
 */
BrowserRequest.prototype.response;


/**
 * Returns content of the response body.
 * @param {function(string, string)} A function that receives the response body
 *     when the request completes. The first argument is the content of the
 *     response body (potentially encoded). The second argument is empty if
 *     content is not encoded, encoding name otherwise. Currently, only base64
 *     is supported.
 */
BrowserRequest.prototype.getContent;
