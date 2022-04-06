import * as PIXI from 'pixi.js';

import {AudioGraphText} from './AudioGraphText';
import {GraphTextStyle} from './graphStyle';

export class AudioGraphTextCache {
  textStyle: PIXI.TextStyle;

  cache: Map<string, AudioGraphText> = new Map();

  constructor({textStyle}: {textStyle: PIXI.TextStyle}) {
    this.textStyle = textStyle;
  }

  getText(content: string) {
    if (!this.cache.has(content)) {
      const newText = new AudioGraphText(this.textStyle, content);
      this.cache.set(content, newText);
    }
    return this.cache.get(content);
  }

  getTextBounds(content: string) {
    return this.getText(content).bounds;
  }
}

export class AudioGraphTextCacheGroup {
  paramText: AudioGraphTextCache;
  titleText: AudioGraphTextCache;

  constructor() {
    this.paramText = new AudioGraphTextCache({
      textStyle: new PIXI.TextStyle(GraphTextStyle.PARAM_TEXT),
    });

    this.titleText = new AudioGraphTextCache({
      textStyle: new PIXI.TextStyle(GraphTextStyle.TITLE_TEXT),
    });
  }
}
