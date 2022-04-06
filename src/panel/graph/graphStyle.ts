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
  TITLE: {
    fill: GraphColor.TEXT,
    fontSize: 16,
  },
  PARAM: {
    fill: GraphColor.TEXT,
    fontSize: 9,
  },
};

export const GraphPortStyle = {
  /** Stroke width around port radius. */
  STROKE_WIDTH: 2,
  /** Inner color for ports without connecting edges. */
  DISCONNECTED_FILL_COLOR: 0xffffff,
  /** Padding around input ports. */
  INPUT_GROUP_MARGIN: 2,
  /** Height of input output ports. */
  INPUT_HEIGHT: 20,
  /** Radius of the visible port icon. */
  INPUT_RADIUS: 6,
  /** Padding around the group of params. */
  PARAM_GROUP_MARGIN: 2,
  /** Height of audio parameter ports. */
  PARAM_HEIGHT: 12,
  /** Radius of visible port icon. */
  PARAM_RADIUS: 4,
};

export const GraphNodeStyle = {
  /** Padding above and below title text. */
  TITLE_PADDING: 4,
  /** Stroke width around node when highlighted. */
  HIGHLIGHT_STROKE_WIDTH: 5,
  /** Stroke color around node when highlighted. */
  HIGHLIGHT_STROKE_COLOR: 0x000000,
  /** Node background corner radius. */
  CORNER_RADIUS: 3,
  /** Node background padding around contained text. */
  PADDING: 10,
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
