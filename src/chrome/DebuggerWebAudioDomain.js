/** @namespace ChromeDebuggerWebAudioDomain */

export const ChromeDebuggerWebAudioDomain = {
  Methods: {
    /** @type {"WebAudio.disable"} */
    disable: 'WebAudio.disable',
    /** @type {"WebAudio.enable"} */
    enable: 'WebAudio.enable',
    /** @type {"WebAudio.getRealtimeData"} */
    getRealtimeData: 'WebAudio.getRealtimeData',
  },

  Events: {
    /** @type {ChromeDebuggerWebAudioDomain.audioListenerCreated} */
    audioListenerCreated: 'WebAudio.audioListenerCreated',
    /** @type {ChromeDebuggerWebAudioDomain.audioListenerWillBeDestroyed} */
    audioListenerWillBeDestroyed: 'WebAudio.audioListenerWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudioDomain.audioNodeCreated} */
    audioNodeCreated: 'WebAudio.audioNodeCreated',
    /** @type {ChromeDebuggerWebAudioDomain.audioNodeWillBeDestroyed} */
    audioNodeWillBeDestroyed: 'WebAudio.audioNodeWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudioDomain.audioParamCreated} */
    audioParamCreated: 'WebAudio.audioParamCreated',
    /** @type {ChromeDebuggerWebAudioDomain.audioParamWillBeDestroyed} */
    audioParamWillBeDestroyed: 'WebAudio.audioParamWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudioDomain.contextChanged} */
    contextChanged: 'WebAudio.contextChanged',
    /** @type {ChromeDebuggerWebAudioDomain.contextCreated} */
    contextCreated: 'WebAudio.contextCreated',
    /** @type {ChromeDebuggerWebAudioDomain.contextWillBeDestroyed} */
    contextWillBeDestroyed: 'WebAudio.contextWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudioDomain.nodeParamConnected} */
    nodeParamConnected: 'WebAudio.nodeParamConnected',
    /** @type {ChromeDebuggerWebAudioDomain.nodeParamDisconnected} */
    nodeParamDisconnected: 'WebAudio.nodeParamDisconnected',
    /** @type {ChromeDebuggerWebAudioDomain.nodesConnected} */
    nodesConnected: 'WebAudio.nodesConnected',
    /** @type {ChromeDebuggerWebAudioDomain.nodesDisconnected} */
    nodesDisconnected: 'WebAudio.nodesDisconnected',
  },
};

/**
 * @typedef {"WebAudio.audioListenerCreated"}
 *   ChromeDebuggerWebAudioDomain.audioListenerCreated
 */
/**
 * @typedef {"WebAudio.audioListenerWillBeDestroyed"}
 *   ChromeDebuggerWebAudioDomain.audioListenerWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.audioNodeCreated"}
 *   ChromeDebuggerWebAudioDomain.audioNodeCreated
 */
/**
 * @typedef {"WebAudio.audioNodeWillBeDestroyed"}
 *   ChromeDebuggerWebAudioDomain.audioNodeWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.audioParamCreated"}
 *   ChromeDebuggerWebAudioDomain.audioParamCreated
 */
/**
 * @typedef {"WebAudio.audioParamWillBeDestroyed"}
 *   ChromeDebuggerWebAudioDomain.audioParamWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.contextChanged"}
 *   ChromeDebuggerWebAudioDomain.contextChanged
 */
/**
 * @typedef {"WebAudio.contextCreated"}
 *   ChromeDebuggerWebAudioDomain.contextCreated
 */
/**
 * @typedef {"WebAudio.contextWillBeDestroyed"}
 *   ChromeDebuggerWebAudioDomain.contextWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.nodeParamConnected"}
 *   ChromeDebuggerWebAudioDomain.nodeParamConnected
 */
/**
 * @typedef {"WebAudio.nodeParamDisconnected"}
 *   ChromeDebuggerWebAudioDomain.nodeParamDisconnected
 */
/**
 * @typedef {"WebAudio.nodesConnected"}
 *   ChromeDebuggerWebAudioDomain.nodesConnected
 */
/**
 * @typedef {"WebAudio.nodesDisconnected"}
 *   ChromeDebuggerWebAudioDomain.nodesDisconnected
 */
/**
 * @typedef {ChromeDebuggerWebAudioDomain.audioListenerCreated
 *   | ChromeDebuggerWebAudioDomain.audioListenerWillBeDestroyed
 *   | ChromeDebuggerWebAudioDomain.audioNodeCreated
 *   | ChromeDebuggerWebAudioDomain.audioNodeWillBeDestroyed
 *   | ChromeDebuggerWebAudioDomain.audioParamCreated
 *   | ChromeDebuggerWebAudioDomain.audioParamWillBeDestroyed
 *   | ChromeDebuggerWebAudioDomain.contextChanged
 *   | ChromeDebuggerWebAudioDomain.contextCreated
 *   | ChromeDebuggerWebAudioDomain.contextWillBeDestroyed
 *   | ChromeDebuggerWebAudioDomain.nodeParamConnected
 *   | ChromeDebuggerWebAudioDomain.nodeParamDisconnected
 *   | ChromeDebuggerWebAudioDomain.nodesConnected
 *   | ChromeDebuggerWebAudioDomain.nodesDisconnected
 *   } ChromeDebuggerWebAudioDomain.EventName
 */

/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioListenerCreatedEvent
 * @property {ChromeDebuggerWebAudioDomain.AudioListener} listener
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioListenerWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} listenerId
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent
 * @property {ChromeDebuggerWebAudioDomain.AudioNode} node
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioNodeWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} nodeId
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioParamCreatedEvent
 * @property {ChromeDebuggerWebAudioDomain.AudioParam} param
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.AudioParamWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} paramId
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.ContextChangedEvent
 * @property {ChromeDebuggerWebAudioDomain.BaseAudioContext} context
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.ContextCreatedEvent
 * @property {ChromeDebuggerWebAudioDomain.BaseAudioContext} context
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.ContextWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.NodeParamConnectedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.NodeParamDisconnectedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.NodesConnectedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 * @property {number} [parameters.destinationInputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 * @property {number} [parameters.destinationInputIndex]
 */
/**
 * @typedef {ChromeDebuggerWebAudioDomain.AudioListenerCreatedEvent
 *   | ChromeDebuggerWebAudioDomain.AudioListenerWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudioDomain.AudioNodeCreatedEvent
 *   | ChromeDebuggerWebAudioDomain.AudioNodeWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudioDomain.AudioParamCreatedEvent
 *   | ChromeDebuggerWebAudioDomain.AudioParamWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudioDomain.ContextChangedEvent
 *   | ChromeDebuggerWebAudioDomain.ContextCreatedEvent
 *   | ChromeDebuggerWebAudioDomain.ContextWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudioDomain.NodeParamConnectedEvent
 *   | ChromeDebuggerWebAudioDomain.NodeParamDisconnectedEvent
 *   | ChromeDebuggerWebAudioDomain.NodesConnectedEvent
 *   | ChromeDebuggerWebAudioDomain.NodesDisconnectedEvent
 *   } ChromeDebuggerWebAudioDomain.Event
 */
/**
 * Protocol object for AudioListener
 * @typedef ChromeDebuggerWebAudioDomain.AudioListener
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} listenerId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 */
/**
 * Protocol object for AudioNode
 * @typedef ChromeDebuggerWebAudioDomain.AudioNode
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.NodeType} nodeType
 * @property {number} numberOfInputs
 * @property {number} numberOfOutputs
 * @property {ChromeDebuggerWebAudioDomain.ChannelCountMode} channelCountMode
 * @property {ChromeDebuggerWebAudioDomain.ChannelInterpretation}
 *   channelInterpretation
 */
/**
 * Protocol object for AudioParam
 * @typedef ChromeDebuggerWebAudioDomain.AudioParam
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} paramId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.ParamType} paramType
 * @property {ChromeDebuggerWebAudioDomain.AutomationRate} rate
 * @property {number} defaultValue
 * @property {number} minValue
 * @property {number} maxValue
 */
/**
 * Enum of AudioParam::AutomationRate from the spec
 * @typedef {"a-rate" | "k-rate"} ChromeDebuggerWebAudioDomain.AutomationRate
 */
/**
 * Protocol object for BaseAudioContext
 * @typedef ChromeDebuggerWebAudioDomain.BaseAudioContext
 * @property {ChromeDebuggerWebAudioDomain.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudioDomain.ContextType} contextType
 * @property {ChromeDebuggerWebAudioDomain.ContextState} contextState
 * @property {ChromeDebuggerWebAudioDomain.ContextRealtimeData} [realtimeData]
 * @property {number} callbackBufferSize
 *   Platform-dependent callback buffer size.
 * @property {number} maxOutputChannelCount
 *   Number of output channels supported by audio hardware in use.
 * @property {number} sampleRate
 *   Context sample rate.
 */
/**
 * Enum of AudioNode::ChannelCountMode from the spec
 * @typedef {"clamped-max"
 *   | "explicit"
 *   | "max"} ChromeDebuggerWebAudioDomain.ChannelCountMode
 */
/**
 * Enum of AudioNode::ChannelInterpretation from the spec
 * @typedef {"discrete" | "speakers"}
 *   ChromeDebuggerWebAudioDomain.ChannelInterpretation
 */
/**
 * Fields in AudioContext that change in real-time.
 * @typedef ChromeDebuggerWebAudioDomain.ContextRealtimeData
 * @property {number} currentTime
 *   The current context time in second in BaseAudioContext.
 * @property {number} renderCapacity
 *   The time spent on rendering graph divided by render quantum duration, and
 *   multiplied by 100. 100 means the audio renderer reached the full capacity
 *   and glitch may occur.
 * @property {number} callbackIntervalMean
 *   A running mean of callback interval.
 * @property {number} callbackIntervalVariance
 *   A running variance of callback interval.
 */
/**
 * Enum of AudioContextState from the spec
 * @typedef {"suspended" | "running" | "closed"}
 *   ChromeDebuggerWebAudioDomain.ContextState
 */
/**
 * Enum of BaseAudioContext types
 * @typedef {"realtime" | "offline"} ChromeDebuggerWebAudioDomain.ContextType
 */
/**
 * An unique ID for a graph object (AudioContext, AudioNode, AudioParam) in
 * Web Audio API
 * @typedef {string} ChromeDebuggerWebAudioDomain.GraphObjectId
 */
/**
 * Enum of AudioNode types
 * @typedef {string} ChromeDebuggerWebAudioDomain.NodeType
 */
/**
 * Enum of AudioParam types
 * @typedef {string} ChromeDebuggerWebAudioDomain.ParamType
 */
