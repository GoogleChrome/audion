/** @namespace ChromeDebuggerWebAudio */

export const ChromeDebuggerWebAudio = {
  Methods: {
    /** @type {"WebAudio.disable"} */
    disable: 'WebAudio.disable',
    /** @type {"WebAudio.enable"} */
    enable: 'WebAudio.enable',
    /** @type {"WebAudio.getRealtimeData"} */
    getRealtimeData: 'WebAudio.getRealtimeData',
  },

  Events: {
    /** @type {ChromeDebuggerWebAudio.audioListenerCreated} */
    audioListenerCreated: 'WebAudio.audioListenerCreated',
    /** @type {ChromeDebuggerWebAudio.audioListenerWillBeDestroyed} */
    audioListenerWillBeDestroyed: 'WebAudio.audioListenerWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudio.audioNodeCreated} */
    audioNodeCreated: 'WebAudio.audioNodeCreated',
    /** @type {ChromeDebuggerWebAudio.audioNodeWillBeDestroyed} */
    audioNodeWillBeDestroyed: 'WebAudio.audioNodeWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudio.audioParamCreated} */
    audioParamCreated: 'WebAudio.audioParamCreated',
    /** @type {ChromeDebuggerWebAudio.audioParamWillBeDestroyed} */
    audioParamWillBeDestroyed: 'WebAudio.audioParamWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudio.contextChanged} */
    contextChanged: 'WebAudio.contextChanged',
    /** @type {ChromeDebuggerWebAudio.contextCreated} */
    contextCreated: 'WebAudio.contextCreated',
    /** @type {ChromeDebuggerWebAudio.contextWillBeDestroyed} */
    contextWillBeDestroyed: 'WebAudio.contextWillBeDestroyed',
    /** @type {ChromeDebuggerWebAudio.nodeParamConnected} */
    nodeParamConnected: 'WebAudio.nodeParamConnected',
    /** @type {ChromeDebuggerWebAudio.nodeParamDisconnected} */
    nodeParamDisconnected: 'WebAudio.nodeParamDisconnected',
    /** @type {ChromeDebuggerWebAudio.nodesConnected} */
    nodesConnected: 'WebAudio.nodesConnected',
    /** @type {ChromeDebuggerWebAudio.nodesDisconnected} */
    nodesDisconnected: 'WebAudio.nodesDisconnected',
  },
};

/**
 * @typedef {"WebAudio.audioListenerCreated"}
 *   ChromeDebuggerWebAudio.audioListenerCreated
 */
/**
 * @typedef {"WebAudio.audioListenerWillBeDestroyed"}
 *   ChromeDebuggerWebAudio.audioListenerWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.audioNodeCreated"}
 *   ChromeDebuggerWebAudio.audioNodeCreated
 */
/**
 * @typedef {"WebAudio.audioNodeWillBeDestroyed"}
 *   ChromeDebuggerWebAudio.audioNodeWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.audioParamCreated"}
 *   ChromeDebuggerWebAudio.audioParamCreated
 */
/**
 * @typedef {"WebAudio.audioParamWillBeDestroyed"}
 *   ChromeDebuggerWebAudio.audioParamWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.contextChanged"}
 *   ChromeDebuggerWebAudio.contextChanged
 */
/**
 * @typedef {"WebAudio.contextCreated"}
 *   ChromeDebuggerWebAudio.contextCreated
 */
/**
 * @typedef {"WebAudio.contextWillBeDestroyed"}
 *   ChromeDebuggerWebAudio.contextWillBeDestroyed
 */
/**
 * @typedef {"WebAudio.nodeParamConnected"}
 *   ChromeDebuggerWebAudio.nodeParamConnected
 */
/**
 * @typedef {"WebAudio.nodeParamDisconnected"}
 *   ChromeDebuggerWebAudio.nodeParamDisconnected
 */
/**
 * @typedef {"WebAudio.nodesConnected"}
 *   ChromeDebuggerWebAudio.nodesConnected
 */
/**
 * @typedef {"WebAudio.nodesDisconnected"}
 *   ChromeDebuggerWebAudio.nodesDisconnected
 */
/**
 * @typedef {ChromeDebuggerWebAudio.audioListenerCreated
 *   | ChromeDebuggerWebAudio.audioListenerWillBeDestroyed
 *   | ChromeDebuggerWebAudio.audioNodeCreated
 *   | ChromeDebuggerWebAudio.audioNodeWillBeDestroyed
 *   | ChromeDebuggerWebAudio.audioParamCreated
 *   | ChromeDebuggerWebAudio.audioParamWillBeDestroyed
 *   | ChromeDebuggerWebAudio.contextChanged
 *   | ChromeDebuggerWebAudio.contextCreated
 *   | ChromeDebuggerWebAudio.contextWillBeDestroyed
 *   | ChromeDebuggerWebAudio.nodeParamConnected
 *   | ChromeDebuggerWebAudio.nodeParamDisconnected
 *   | ChromeDebuggerWebAudio.nodesConnected
 *   | ChromeDebuggerWebAudio.nodesDisconnected
 *   } ChromeDebuggerWebAudio.EventName
 */

/**
 * @typedef ChromeDebuggerWebAudio.AudioListenerCreatedEvent
 * @property {ChromeDebuggerWebAudio.AudioListener} listener
 */
/**
 * @typedef ChromeDebuggerWebAudio.AudioListenerWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} listenerId
 */
/**
 * @typedef ChromeDebuggerWebAudio.AudioNodeCreatedEvent
 * @property {ChromeDebuggerWebAudio.AudioNode} node
 */
/**
 * @typedef ChromeDebuggerWebAudio.AudioNodeWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} nodeId
 */
/**
 * @typedef ChromeDebuggerWebAudio.AudioParamCreatedEvent
 * @property {ChromeDebuggerWebAudio.AudioParam} param
 */
/**
 * @typedef ChromeDebuggerWebAudio.AudioParamWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} paramId
 */
/**
 * @typedef ChromeDebuggerWebAudio.ContextChangedEvent
 * @property {ChromeDebuggerWebAudio.BaseAudioContext} context
 */
/**
 * @typedef ChromeDebuggerWebAudio.ContextCreatedEvent
 * @property {ChromeDebuggerWebAudio.BaseAudioContext} context
 */
/**
 * @typedef ChromeDebuggerWebAudio.ContextWillBeDestroyedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 */
/**
 * @typedef ChromeDebuggerWebAudio.NodeParamConnectedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudio.NodeParamDisconnectedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudio.NodesConnectedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 * @property {number} [parameters.destinationInputIndex]
 */
/**
 * @typedef ChromeDebuggerWebAudio.NodesDisconnectedEvent
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} sourceId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} destinationId
 * @property {number} [parameters.sourceOutputIndex]
 * @property {number} [parameters.destinationInputIndex]
 */
/**
 * @typedef {ChromeDebuggerWebAudio.AudioListenerCreatedEvent
 *   | ChromeDebuggerWebAudio.AudioListenerWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudio.AudioNodeCreatedEvent
 *   | ChromeDebuggerWebAudio.AudioNodeWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudio.AudioParamCreatedEvent
 *   | ChromeDebuggerWebAudio.AudioParamWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudio.ContextChangedEvent
 *   | ChromeDebuggerWebAudio.ContextCreatedEvent
 *   | ChromeDebuggerWebAudio.ContextWillBeDestroyedEvent
 *   | ChromeDebuggerWebAudio.NodeParamConnectedEvent
 *   | ChromeDebuggerWebAudio.NodeParamDisconnectedEvent
 *   | ChromeDebuggerWebAudio.NodesConnectedEvent
 *   | ChromeDebuggerWebAudio.NodesDisconnectedEvent
 *   } ChromeDebuggerWebAudio.Event
 */
/**
 * Protocol object for AudioListener
 * @typedef ChromeDebuggerWebAudio.AudioListener
 * @property {ChromeDebuggerWebAudio.GraphObjectId} listenerId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 */
/**
 * Protocol object for AudioNode
 * @typedef ChromeDebuggerWebAudio.AudioNode
 * @property {ChromeDebuggerWebAudio.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.NodeType} nodeType
 * @property {number} numberOfInputs
 * @property {number} numberOfOutputs
 * @property {ChromeDebuggerWebAudio.ChannelCountMode} channelCountMode
 * @property {ChromeDebuggerWebAudio.ChannelInterpretation}
 *   channelInterpretation
 */
/**
 * Protocol object for AudioParam
 * @typedef ChromeDebuggerWebAudio.AudioParam
 * @property {ChromeDebuggerWebAudio.GraphObjectId} paramId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} nodeId
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.ParamType} paramType
 * @property {ChromeDebuggerWebAudio.AutomationRate} rate
 * @property {number} defaultValue
 * @property {number} minValue
 * @property {number} maxValue
 */
/**
 * Enum of AudioParam::AutomationRate from the spec
 * @typedef {"a-rate" | "k-rate"} ChromeDebuggerWebAudio.AutomationRate
 */
/**
 * Protocol object for BaseAudioContext
 * @typedef ChromeDebuggerWebAudio.BaseAudioContext
 * @property {ChromeDebuggerWebAudio.GraphObjectId} contextId
 * @property {ChromeDebuggerWebAudio.ContextType} contextType
 * @property {ChromeDebuggerWebAudio.ContextState} contextState
 * @property {ChromeDebuggerWebAudio.ContextRealtimeData} [realtimeData]
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
 *   | "max"} ChromeDebuggerWebAudio.ChannelCountMode
 */
/**
 * Enum of AudioNode::ChannelInterpretation from the spec
 * @typedef {"discrete" | "speakers"}
 *   ChromeDebuggerWebAudio.ChannelInterpretation
 */
/**
 * Fields in AudioContext that change in real-time.
 * @typedef ChromeDebuggerWebAudio.ContextRealtimeData
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
 *   ChromeDebuggerWebAudio.ContextState
 */
/**
 * Enum of BaseAudioContext types
 * @typedef {"realtime" | "offline"} ChromeDebuggerWebAudio.ContextType
 */
/**
 * An unique ID for a graph object (AudioContext, AudioNode, AudioParam) in
 * Web Audio API
 * @typedef {string} ChromeDebuggerWebAudio.GraphObjectId
 */
/**
 * Enum of AudioNode types
 * @typedef {string} ChromeDebuggerWebAudio.NodeType
 */
/**
 * Enum of AudioParam types
 * @typedef {string} ChromeDebuggerWebAudio.ParamType
 */
