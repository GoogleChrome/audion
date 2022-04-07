/**
 * Event sequences that would be produced by an audio context with oscillator
 * and gain nodes connecting outputs to params.
 *
 * @file
 */

import {WebAudioDebuggerEvent} from '../src/chrome/DebuggerWebAudioDomain';
import {Audion} from '../src/devtools/Types';

/**
 * A sequence of events produced by WebAudioEventObservable from a context
 * connect some oscillator and gain nodes, especially connecting an output to
 * another gain node's gain param.
 *
 * @example
 *   // unit and integration tests can replace
 *   new WebAudioEventObservable()
 *   // with something like
 *   from(OSCILLATOR_GAIN_PARAM_EVENTS)
 *   // or something over time such as
 *   interval(50).pipe(map((_, i) =>
 *     OSCILLATOR_GAIN_PARAM_EVENTS[i]))
 *
 * @example
 *   // context that creates this sequence from
 *   // WebAudioEventObservable
 *   const audioContext = new AudioContext();
 *   const delayNode = new DelayNode(audioContext,
 *     {delayTime: delayTime});
 *   const inputNode = new GainNode(audioContext);
 *   const outputNode = new GainNode(audioContext);
 *   const depthNode = new GainNode(audioContext,
 *     {gain: width});
 *   const oscillatorNode = new OscillatorNode(audioContext,
 *     {type: "sine", frequency: speed});
 *   inputNode.connect(delayNode);
 *   delayNode.connect(outputNode);
 *   oscillatorNode.connect(depthNode);
 *   depthNode.connect(delayNode.delayTime);
 *
 * @see https://github.com/GoogleChrome/audion/issues/117
 */
export const OSCILLATOR_GAIN_PARAM_EVENTS: Audion.WebAudioEvent[] = [
  {
    method: WebAudioDebuggerEvent.contextCreated,
    params: {
      context: {
        callbackBufferSize: 256,
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        contextState: 'suspended',
        contextType: 'realtime',
        maxOutputChannelCount: 2,
        sampleRate: 48000,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: '57a4d84b-6165-495e-9ad7-2ad82497d423',
        nodeType: 'AudioDestination',
        numberOfInputs: 1,
        numberOfOutputs: 0,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioListenerCreated,
    params: {
      listener: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        listenerId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '63a77a6c-1779-42df-bedc-c68c5171722f',
        paramType: 'positionX',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: 'e15f2c0e-f466-4d2a-92a2-c3fe23e591f5',
        paramType: 'positionY',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: 'bbabbcc8-91eb-4014-9351-43e1742644e9',
        paramType: 'positionZ',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '4e3f5c2d-6b59-4a69-ab4f-da62db30e7db',
        paramType: 'forwardX',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: 'd2425aaa-dc91-4e60-ba57-22be7b26f941',
        paramType: 'forwardY',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: -1,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '1842fc18-6b51-402b-97f1-c56d4681866a',
        paramType: 'forwardZ',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '872a56b9-ed99-47ea-9957-bda9307fac5b',
        paramType: 'upX',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 1,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '4acf61c7-363f-44af-9857-c5e8c8ea5629',
        paramType: 'upY',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'bb5255e5-5bd3-4290-b714-ecd3ff57be28',
        paramId: '4b818074-5b96-42c3-b2e6-fcdd350e37bb',
        paramType: 'upZ',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: 'e5bd5ec5-abb8-426a-bad8-65f723970c76',
        nodeType: 'Delay',
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 1,
        minValue: 0,
        nodeId: 'e5bd5ec5-abb8-426a-bad8-65f723970c76',
        paramId: 'a88ea483-fc15-4c2b-ab0c-597af8e069b9',
        paramType: 'delayTime',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: '61b107eb-24ad-4f11-b811-72b2c5e7e79f',
        nodeType: 'Gain',
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 1,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: '61b107eb-24ad-4f11-b811-72b2c5e7e79f',
        paramId: '03e13b59-a58f-4883-8479-d7a048ebe80a',
        paramType: 'gain',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: '78b78fae-b32e-4993-a2b4-7523c08e16c0',
        nodeType: 'Gain',
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 1,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: '78b78fae-b32e-4993-a2b4-7523c08e16c0',
        paramId: 'b6ea1b98-2dda-43d0-8a52-49492fcafdde',
        paramType: 'gain',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: 'd8ac44f0-f099-40ff-9cf4-949148fca53f',
        nodeType: 'Gain',
        numberOfInputs: 1,
        numberOfOutputs: 1,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 1,
        maxValue: 3.4028234663852886e38,
        minValue: -3.4028234663852886e38,
        nodeId: 'd8ac44f0-f099-40ff-9cf4-949148fca53f',
        paramId: '38ec329f-650c-4c35-805c-32c559b47ea7',
        paramType: 'gain',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioNodeCreated,
    params: {
      node: {
        channelCount: 2,
        channelCountMode: 'max',
        channelInterpretation: 'speakers',
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        nodeId: '59200b98-60e1-43cf-88f6-d0a33d5643cf',
        nodeType: 'Oscillator',
        numberOfInputs: 0,
        numberOfOutputs: 1,
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 0,
        maxValue: 153600,
        minValue: -153600,
        nodeId: '59200b98-60e1-43cf-88f6-d0a33d5643cf',
        paramId: '0b2b73d2-bc98-423b-a19c-1a0651e06d20',
        paramType: 'detune',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.audioParamCreated,
    params: {
      param: {
        contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
        defaultValue: 440,
        maxValue: 24000,
        minValue: -24000,
        nodeId: '59200b98-60e1-43cf-88f6-d0a33d5643cf',
        paramId: '42dddc62-c058-473e-9f48-a678a708c001',
        paramType: 'frequency',
        rate: 'a-rate',
      },
    },
  },
  {
    method: WebAudioDebuggerEvent.nodesConnected,
    params: {
      contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
      destinationId: 'e5bd5ec5-abb8-426a-bad8-65f723970c76',
      destinationInputIndex: 0,
      sourceId: '61b107eb-24ad-4f11-b811-72b2c5e7e79f',
      sourceOutputIndex: 0,
    },
  },
  {
    method: WebAudioDebuggerEvent.nodesConnected,
    params: {
      contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
      destinationId: '78b78fae-b32e-4993-a2b4-7523c08e16c0',
      destinationInputIndex: 0,
      sourceId: 'e5bd5ec5-abb8-426a-bad8-65f723970c76',
      sourceOutputIndex: 0,
    },
  },
  {
    method: WebAudioDebuggerEvent.nodesConnected,
    params: {
      contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
      destinationId: 'd8ac44f0-f099-40ff-9cf4-949148fca53f',
      destinationInputIndex: 0,
      sourceId: '59200b98-60e1-43cf-88f6-d0a33d5643cf',
      sourceOutputIndex: 0,
    },
  },
  {
    method: WebAudioDebuggerEvent.nodeParamConnected,
    params: {
      contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62',
      destinationId: 'a88ea483-fc15-4c2b-ab0c-597af8e069b9',
      sourceId: 'd8ac44f0-f099-40ff-9cf4-949148fca53f',
      sourceOutputIndex: 0,
    },
  },
  {
    method: WebAudioDebuggerEvent.contextWillBeDestroyed,
    params: {contextId: '9d36b0e0-4251-41a6-89cb-876b0fbe1b62'},
  },
];
