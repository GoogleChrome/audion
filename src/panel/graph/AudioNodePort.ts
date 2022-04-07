import * as PIXI from 'pixi.js';

import {AudionPanel} from '../Types';
import {GraphPortStyle} from './graphStyle';

const ZERO_POINT = new PIXI.Point();

export enum AudioNodePortType {
  INPUT = 'input',
  OUTPUT = 'output',
  PARAM = 'param',
}

/**
 * Port.
 */
export class AudioNodePort {
  node: AudionPanel.Node;
  portType: AudionPanel.PortType;
  portIndex: number;
  offset: AudionPanel.Point;
  radius: number;
  color: number;
  edges: any[];

  /** Radius of the visible port icon. */
  static get INPUT_RADIUS() {
    return GraphPortStyle.INPUT_RADIUS;
  }

  /** Radius of visible port icon. */
  static get PARAM_RADIUS() {
    return GraphPortStyle.PARAM_RADIUS;
  }

  /**
   * Create a port.
   * @param options
   */
  constructor({
    node,
    portType,
    portIndex,
    point,
    radius,
    color,
  }: {
    node: AudionPanel.Node;
    portType: AudionPanel.PortType;
    portIndex: number;
    point: AudionPanel.Point;
    radius: number;
    color: number;
  }) {
    this.node = node;
    this.portType = portType;
    this.portIndex = portIndex;
    this.offset = point;
    this.radius = radius;
    this.color = color;
    this.edges = [];
  }

  updateNodeDisplay() {
    this.node.updatePortDisplay(this.portType, this.portIndex);
  }

  /**
   * @param graphics
   */
  drawSocket(
    graphics: PIXI.Graphics,
    fill: number = GraphPortStyle.DISCONNECTED_FILL_COLOR,
    offset: AudionPanel.Point = ZERO_POINT,
  ) {
    graphics.lineStyle(GraphPortStyle.STROKE_WIDTH, this.color);
    graphics.beginFill(fill);
    graphics.drawCircle(
      offset.x + this.offset.x,
      offset.y + this.offset.y,
      this.radius,
    );
    graphics.endFill();
  }

  /**
   * @param graphics
   */
  drawConnect(graphics: PIXI.Graphics) {
    this.drawSocket(graphics, this.color, this.node.position);
  }
}
