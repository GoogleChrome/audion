/**
 * @param {string} nodeType
 * @param {boolean} [isOffline]
 * @return {number}
 */
export const colorFromNodeType = (nodeType, isOffline = false) => {
  // AudioNodes are grouped into color categories based on their purposes.
  switch (nodeType) {
    case 'AudioDestination':
      // The destination nodes of OfflineAudioContexts are brown. Those of
      // "non-offline" AudioContexts are a dark grey.
      return isOffline ? 0x5d4037 : 0x37474f;
    case 'AudioBufferSource':
    case 'Oscillator':
      return 0x009688;
    case 'BiquadFilter':
    case 'Convolver':
    case 'Delay':
    case 'DynamicsCompressor':
    case 'IIRFilter':
    case 'Panner':
    case 'StereoPanner':
    case 'WaveShaper':
      return 0x2196f3;
    case 'Analyser':
      return 0x00bcd4;
    case 'Gain':
    case 'ChannelMerger':
    case 'ChannelSplitter':
      return 0x3f51b5;
    case 'MediaElementAudioSource':
    case 'MediaStreamAudioDestination':
    case 'MediaStreamAudioSource':
      return 0x9c27b0;
    case 'ScriptProcessor':
      return 0xc62828;
  }

  // Nothing matched. Odd. Highlight this node in dark red.
  return 0xc62828;
};
