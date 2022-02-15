/**
 * @file
 * Strings passed to `chrome.debugger.sendCommand` and received from
 * `chrome.debugger.onEvent` callbacks.
 */

import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';

/** @see https://chromedevtools.github.io/devtools-protocol/tot/WebAudio/#methods */
export enum WebAudioDebuggerMethod {
  disable = 'WebAudio.disable',
  enable = 'WebAudio.enable',
  getRealtimeData = 'WebAudio.getRealtimeData',
}

/** @see https://chromedevtools.github.io/devtools-protocol/tot/WebAudio/#events */
export enum WebAudioDebuggerEvent {
  audioListenerCreated = 'WebAudio.audioListenerCreated',
  audioListenerWillBeDestroyed = 'WebAudio.audioListenerWillBeDestroyed',
  audioNodeCreated = 'WebAudio.audioNodeCreated',
  audioNodeWillBeDestroyed = 'WebAudio.audioNodeWillBeDestroyed',
  audioParamCreated = 'WebAudio.audioParamCreated',
  audioParamWillBeDestroyed = 'WebAudio.audioParamWillBeDestroyed',
  contextChanged = 'WebAudio.contextChanged',
  contextCreated = 'WebAudio.contextCreated',
  contextWillBeDestroyed = 'WebAudio.contextWillBeDestroyed',
  nodeParamConnected = 'WebAudio.nodeParamConnected',
  nodeParamDisconnected = 'WebAudio.nodeParamDisconnected',
  nodesConnected = 'WebAudio.nodesConnected',
  nodesDisconnected = 'WebAudio.nodesDisconnected',
}

/** @see https://chromedevtools.github.io/devtools-protocol/tot/WebAudio/#types */
export type WebAudioDebuggerEventParams<Name extends WebAudioDebuggerEvent> =
  ProtocolMapping.Events[Name];
