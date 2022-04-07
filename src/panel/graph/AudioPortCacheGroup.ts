import * as PIXI from 'pixi.js';
import {AudionPanel} from '../Types';
import {AudioNodePort} from './AudioNodePort';
import {GraphColor} from './graphStyle';

export class AudioPortCache {
  port: AudioNodePort;

  geometry: PIXI.GraphicsGeometry = null;

  constructor(port: AudioNodePort) {
    this.port = port;
  }

  getGeometry() {
    if (this.geometry === null) {
      const graphics = new PIXI.Graphics();
      this.port.drawSocket(graphics, this.port.color);
      this.geometry = graphics.geometry;
    }
    return this.geometry;
  }

  createGraphics(position = new PIXI.Point()) {
    const graphics = new PIXI.Graphics(this.getGeometry());
    graphics.position.set(position.x, position.y);
    graphics.visible = false;
    return graphics;
  }
}

export class AudioPortCacheGroup {
  inputOutput: AudioPortCache;
  param: AudioPortCache;

  constructor() {
    this.inputOutput = new AudioPortCache(
      new AudioNodePort({
        node: null,
        portType: AudionPanel.PortType.INPUT,
        portIndex: -1,
        point: new PIXI.Point(),
        radius: AudioNodePort.INPUT_RADIUS,
        color: GraphColor.INPUT_OUTPUT,
      }),
    );

    this.param = new AudioPortCache(
      new AudioNodePort({
        node: null,
        portType: AudionPanel.PortType.PARAM,
        portIndex: -1,
        point: new PIXI.Point(),
        radius: AudioNodePort.PARAM_RADIUS,
        color: GraphColor.AUDIO_PARAM,
      }),
    );
  }
}
