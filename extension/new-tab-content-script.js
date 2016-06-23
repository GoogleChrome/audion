/**
 * This content script runs before the content script that injects tracing. This
 * script merely issues a message indicating that the URL of a tab changed. This
 * is run once per tab (at the start of it).
 */


chrome.runtime.sendMessage({'type': 'page_changed'});
