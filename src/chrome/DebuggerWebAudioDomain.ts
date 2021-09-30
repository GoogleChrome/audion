import {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';

export const Methods: {[K in string]: keyof ProtocolMapping.Commands & `WebAudio.${K}`} = {
  disable: 'WebAudio.disable',
  enable: 'WebAudio.enable',
  getRealtimeData: 'WebAudio.getRealtimeData',
};

export const Events: {[K in string]: keyof ProtocolMapping.Events & `WebAudio.${K}`} = {
  audioListenerCreated: 'WebAudio.audioListenerCreated',
  audioListenerWillBeDestroyed: 'WebAudio.audioListenerWillBeDestroyed',
  audioNodeCreated: 'WebAudio.audioNodeCreated',
  audioNodeWillBeDestroyed: 'WebAudio.audioNodeWillBeDestroyed',
  audioParamCreated: 'WebAudio.audioParamCreated',
  audioParamWillBeDestroyed: 'WebAudio.audioParamWillBeDestroyed',
  contextChanged: 'WebAudio.contextChanged',
  contextCreated: 'WebAudio.contextCreated',
  contextWillBeDestroyed: 'WebAudio.contextWillBeDestroyed',
  nodeParamConnected: 'WebAudio.nodeParamConnected',
  nodeParamDisconnected: 'WebAudio.nodeParamDisconnected',
  nodesConnected: 'WebAudio.nodesConnected',
  nodesDisconnected: 'WebAudio.nodesDisconnected',
};
