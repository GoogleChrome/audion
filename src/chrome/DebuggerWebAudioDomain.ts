import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';

export enum WebAudioDebuggerMethod {
  disable = 'WebAudio.disable',
  enable = 'WebAudio.enable',
  getRealtimeData = 'WebAudio.getRealtimeData',
}

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

export type WebAudioDebuggerEventParams<Name extends WebAudioDebuggerEvent> =
  ProtocolMapping.Events[Name];
