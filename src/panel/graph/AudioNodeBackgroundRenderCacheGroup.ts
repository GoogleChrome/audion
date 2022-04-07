import * as PIXI from 'pixi.js';
import {MeshMaterial} from 'pixi.js';

import {Audion} from '../../devtools/Types';

import {AudioGraphTextCacheGroup} from './AudioGraphTextCacheGroup';
import {
  AudioNodeBackground,
  AudioNodeBackgroundRender,
  AudioNodeBackgroundStyle,
  AudioNodeMetrics,
} from './AudioNodeBackground';

export class AudioNodeBackgroundCache {
  textCacheGroup: AudioGraphTextCacheGroup;

  cache: Map<string, AudioNodeBackground> = new Map();

  constructor(textCacheGroup: AudioGraphTextCacheGroup) {
    this.textCacheGroup = textCacheGroup;
  }

  getBackground(node: Audion.GraphNode) {
    if (!this.cache.has(node.node.nodeType)) {
      console.log(node);
      const background = new AudioNodeBackground();
      background.init(AudioNodeMetrics.from(node, this.textCacheGroup));
      this.cache.set(node.node.nodeType, background);
    }
    return this.cache.get(node.node.nodeType);
  }
}

export class AudioNodeBackgroundRenderCache {
  material: PIXI.MeshMaterial;

  textCacheGroup: AudioGraphTextCacheGroup;
  background: AudioNodeBackgroundCache;

  style: AudioNodeBackgroundStyle;

  cache: Map<string, AudioNodeBackgroundRender> = new Map();

  constructor({
    background,
    style,
    material,
  }: {
    background: AudioNodeBackgroundCache;
    style: AudioNodeBackgroundStyle;
    material: PIXI.MeshMaterial;
  }) {
    this.material = material;

    this.background = background;

    this.style = style;
  }

  getBackground(node: Audion.GraphNode) {
    if (!this.cache.has(node.node.nodeType)) {
      const background = this.background.getBackground(node);
      const backgroundRender = new AudioNodeBackgroundRender(
        background,
        this.style,
        this.material,
      );
      this.cache.set(node.node.nodeType, backgroundRender);
    }
    return this.cache.get(node.node.nodeType);
  }
}

export class AudioNodeBackgroundRenderCacheGroup {
  textCacheGroup: AudioGraphTextCacheGroup;
  defaultMaterial: PIXI.MeshMaterial;

  plain: AudioNodeBackgroundRenderCache;
  highlight: AudioNodeBackgroundRenderCache;

  constructor({textCacheGroup}: {textCacheGroup: AudioGraphTextCacheGroup}) {
    this.textCacheGroup = textCacheGroup;

    const material = (this.defaultMaterial = new MeshMaterial(
      PIXI.Texture.EMPTY,
    ));

    const background = new AudioNodeBackgroundCache(textCacheGroup);

    this.plain = new AudioNodeBackgroundRenderCache({
      background,
      style: {isHighlighted: false},
      material,
    });
    this.highlight = new AudioNodeBackgroundRenderCache({
      background,
      style: {isHighlighted: true},
      material,
    });
  }
}
