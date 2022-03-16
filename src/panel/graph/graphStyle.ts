/** @enum {number} */
export enum GraphColor {
  PROCESSOR = 0x64b5f6,
  MEDIA = 0xba68c8,
  SOURCE = 0x81c784,
  DESTINATION = 0x90a4ad,
  ANALYSER = 0xf48fb1,
  AUDIO_WORKLET = 0x9fa8da,
  OFFLINE_DESTINATION = 0x5d4037,

  DEPRECATED = 0xe0e0e0,
  AUDIO_PARAM = 0xffa726,
  TEXT = 0x263238,
  INPUT_OUTPUT = 0x455a63,
  EDGE = 0x455a63,

  UNKNOWN = 0xc62828,
}

export const GraphTextStyle = {
  PARAM_TEXT: {
    fill: GraphColor.TEXT,
    fontSize: 12,
  },

  TITLE_TEXT: {
    fill: GraphColor.TEXT,
    fontSize: 24,
  },
};

/**
 * @param nodeType
 * @param isOffline
 */
export const colorFromNodeType = (nodeType: string, isOffline = false) => {
  // AudioNodes are grouped into color categories based on their purposes.
  switch (nodeType) {
    case 'AudioDestination':
      // The destination nodes of OfflineAudioContexts are brown. Those of
      // "non-offline" AudioContexts are a dark grey.
      return isOffline
        ? GraphColor.OFFLINE_DESTINATION
        : GraphColor.DESTINATION;
    case 'AudioBufferSource':
    case 'ConstantSource':
    case 'Oscillator':
      return GraphColor.SOURCE;
    case 'Analyser':
      return GraphColor.ANALYSER;
    case 'BiquadFilter':
    case 'Convolver':
    case 'Delay':
    case 'DynamicsCompressor':
    case 'IIRFilter':
    case 'Panner':
    case 'StereoPanner':
    case 'WaveShaper':
    case 'Gain':
    case 'ChannelMerger':
    case 'ChannelSplitter':
      return GraphColor.PROCESSOR;
    case 'MediaElementAudioSource':
    case 'MediaStreamAudioDestination':
    case 'MediaStreamAudioSource':
      return GraphColor.MEDIA;
    case 'AudioWorklet':
      return GraphColor.AUDIO_WORKLET;
    case 'ScriptProcessor':
      return GraphColor.DEPRECATED;
  }

  // Nothing matched. Odd. Highlight this node in dark red.
  return GraphColor.UNKNOWN;
};
