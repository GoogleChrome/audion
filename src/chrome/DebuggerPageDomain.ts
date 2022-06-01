/**
 * @file
 * Strings passed to `chrome.debugger.sendCommand` and received from
 * `chrome.debugger.onEvent` callbacks.
 */

import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';

/** @see https://chromedevtools.github.io/devtools-protocol/tot/Page/#methods */
export enum PageDebuggerMethod {
  disable = 'Page.disable',
  enable = 'Page.enable',
}

/** @see https://chromedevtools.github.io/devtools-protocol/tot/Page/#events */
export enum PageDebuggerEvent {
  domContentEventFired = 'Page.domContentEventFired',
  frameAttached = 'Page.frameAttached',
  frameDetached = 'Page.frameDetached',
  frameNavigated = 'Page.frameNavigated',
  frameRequestedNavigation = 'Page.frameRequestedNavigation',
  frameStartedLoading = 'Page.frameStartedLoading',
  frameStoppedLoading = 'Page.frameStoppedLoading',
  lifecycleEvent = 'Page.lifecycleEvent',
  loadEventFired = 'Page.loadEventFired',
}

/** @see https://chromedevtools.github.io/devtools-protocol/tot/Page/#types */
export type PageDebuggerEventParams<Name extends PageDebuggerEvent> =
  ProtocolMapping.Events[Name];
