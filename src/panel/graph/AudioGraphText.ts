import * as PIXI from 'pixi.js';

export class AudioGraphText {
  bounds: PIXI.Rectangle;
  content: string;
  text: PIXI.Text;
  textStyle: PIXI.TextStyle;
  texture: PIXI.Texture;

  constructor(textStyle: PIXI.TextStyle, content: string) {
    this.textStyle = textStyle;
    this.content = content;

    this.text = new PIXI.Text(content, this.textStyle);
    this.bounds = this.text.getLocalBounds(new PIXI.Rectangle());
    this.texture = this.text.texture;
  }

  createSprite() {
    return new PIXI.Sprite(this.texture);
  }
}
