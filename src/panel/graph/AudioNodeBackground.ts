import * as PIXI from 'pixi.js';

import {Audion} from '../../devtools/Types';

import {AudionPanel} from '../Types';

import {AudioGraphTextCacheGroup} from './AudioGraphTextCacheGroup';
import {AudioNodePort} from './AudioNodePort';
import {
  GraphColor,
  colorFromNodeType,
  GraphPortStyle,
  GraphNodeStyle,
} from './graphStyle';

export interface AudioNodeBackgroundStyle {
  isHighlighted: boolean;
}

export class AudioNodeTextMetrics {
  title: PIXI.Rectangle = null;
  param: PIXI.Rectangle[] = [];

  static from(
    node: Audion.GraphNode,
    textCacheGroup: AudioGraphTextCacheGroup,
  ) {
    const metrics = new AudioNodeTextMetrics();
    metrics.title = textCacheGroup.titleText.getTextBounds(node.node.nodeType);
    for (let i = 0; i < node.params.length; i++) {
      metrics.param.push(
        textCacheGroup.paramText.getTextBounds(node.params[i].paramType),
      );
    }
    return metrics;
  }
}

export class AudioNodeMetrics {
  nodeType: string;
  text: AudioNodeTextMetrics;
  numberOfInputs: number;
  numberOfOutputs: number;
  numberOfParams: number;

  static from(
    node: Audion.GraphNode,
    textCacheGroup: AudioGraphTextCacheGroup,
  ) {
    const metrics = new AudioNodeMetrics();
    metrics.nodeType = node.node.nodeType;
    metrics.text = AudioNodeTextMetrics.from(node, textCacheGroup);
    metrics.numberOfInputs = node.node.numberOfInputs;
    metrics.numberOfOutputs = node.node.numberOfOutputs;
    metrics.numberOfParams = node.params.length;
    return metrics;
  }
}

export class AudioNodeBackground {
  metrics: AudioNodeMetrics;

  input: AudioNodePort[] = [];
  output: AudioNodePort[] = [];
  param: AudioNodePort[] = [];
  size: PIXI.Point = new PIXI.Point();

  /** Padding around input ports. */
  static get INPUT_GROUP_MARGIN() {
    return GraphPortStyle.INPUT_GROUP_MARGIN;
  }

  /** Height of input output ports. */
  static get INPUT_HEIGHT() {
    return GraphPortStyle.INPUT_HEIGHT;
  }

  /** Radius of the visible port icon. */
  static get INPUT_RADIUS() {
    return GraphPortStyle.INPUT_RADIUS;
  }

  /** Padding around the group of params. */
  static get PARAM_GROUP_MARGIN() {
    return GraphPortStyle.PARAM_GROUP_MARGIN;
  }

  /** Height of audio parameter ports. */
  static get PARAM_HEIGHT() {
    return GraphPortStyle.PARAM_HEIGHT;
  }

  /** Radius of visible port icon. */
  static get PARAM_RADIUS() {
    return GraphPortStyle.PARAM_RADIUS;
  }

  init(metrics: AudioNodeMetrics) {
    this.metrics = metrics;
    const {numberOfInputs, numberOfOutputs, numberOfParams} = metrics;

    const {input, output, param, size} = this;

    this._getSize(metrics, size);

    for (let i = input.length; i < numberOfInputs; i++) {
      input[i] = new AudioNodePort({
        node: null,
        portType: AudionPanel.PortType.INPUT,
        portIndex: i,
        point: new PIXI.Point(
          0,
          AudioNodeBackground.INPUT_GROUP_MARGIN +
            (i + 0.5) * AudioNodeBackground.INPUT_HEIGHT,
        ),
        radius: AudioNodeBackground.INPUT_RADIUS,
        color: GraphColor.INPUT_OUTPUT,
      });
    }

    for (let i = output.length; i < numberOfOutputs; i++) {
      output[i] = new AudioNodePort({
        node: null,
        portType: AudionPanel.PortType.OUTPUT,
        portIndex: i,
        point: new PIXI.Point(
          size.x,
          AudioNodeBackground.INPUT_GROUP_MARGIN +
            (i + 0.5) * AudioNodeBackground.INPUT_HEIGHT,
        ),
        radius: AudioNodeBackground.INPUT_RADIUS,
        color: GraphColor.INPUT_OUTPUT,
      });
    }

    const paramYStart = this._getParamYStart(metrics);

    for (let i = 0; i < numberOfParams; i++) {
      param[i] = new AudioNodePort({
        node: null,
        portType: AudionPanel.PortType.PARAM,
        portIndex: i,
        point: new PIXI.Point(
          0,
          paramYStart + (i + 0.5) * AudioNodeBackground.PARAM_HEIGHT,
        ),
        radius: AudioNodeBackground.PARAM_RADIUS,
        color: GraphColor.AUDIO_PARAM,
      });
    }
  }

  private _getParamYStart({
    text: textMetrics,
    numberOfInputs,
  }: AudioNodeMetrics) {
    return Math.max(
      textMetrics.title.height + GraphNodeStyle.TITLE_PADDING,
      AudioNodeBackground.INPUT_GROUP_MARGIN +
        numberOfInputs * AudioNodeBackground.INPUT_HEIGHT +
        Math.max(
          AudioNodeBackground.INPUT_GROUP_MARGIN,
          AudioNodeBackground.PARAM_GROUP_MARGIN,
        ),
    );
  }

  private _getSize(
    {
      text: textMetrics,
      numberOfInputs,
      numberOfOutputs,
      numberOfParams,
    }: AudioNodeMetrics,
    size: PIXI.Point,
  ) {
    const maxParamTextSize = new PIXI.Point();

    for (let i = 0; i < numberOfParams; i++) {
      const param = textMetrics.param[i];
      maxParamTextSize.x = Math.max(maxParamTextSize.x, param.width);
      maxParamTextSize.y = Math.max(maxParamTextSize.y, param.height);
    }

    size.set(
      Math.max(textMetrics.title.width, maxParamTextSize.x) +
        2 * GraphNodeStyle.PADDING,
      Math.max(
        Math.max(
          textMetrics.title.height + 2 * GraphNodeStyle.TITLE_PADDING,
          AudioNodeBackground.INPUT_GROUP_MARGIN +
            AudioNodeBackground.INPUT_HEIGHT * numberOfInputs +
            Math.max(
              AudioNodeBackground.INPUT_GROUP_MARGIN,
              AudioNodeBackground.PARAM_GROUP_MARGIN,
            ),
        ) +
          AudioNodeBackground.PARAM_HEIGHT * numberOfParams +
          AudioNodeBackground.PARAM_GROUP_MARGIN,
        AudioNodeBackground.INPUT_GROUP_MARGIN +
          AudioNodeBackground.INPUT_HEIGHT * numberOfOutputs +
          AudioNodeBackground.INPUT_GROUP_MARGIN,
      ),
    );
  }
}

export class AudioNodeBackgroundRender {
  background: AudioNodeBackground;
  style: AudioNodeBackgroundStyle;

  geometry: PIXI.GraphicsGeometry = null;
  material: PIXI.MeshMaterial;

  constructor(
    background: AudioNodeBackground,
    style: AudioNodeBackgroundStyle,
    material: PIXI.MeshMaterial,
  ) {
    this.background = background;
    this.style = style;
    this.material = material;
  }

  draw(graphics: PIXI.Graphics) {
    graphics.clear();

    if (this.style.isHighlighted) {
      graphics.lineStyle({
        width: GraphNodeStyle.HIGHLIGHT_STROKE_WIDTH,
        color: GraphNodeStyle.HIGHLIGHT_STROKE_COLOR,
      });
    } else {
      graphics.lineStyle(0);
    }
    graphics.beginFill(colorFromNodeType(this.background.metrics.nodeType));
    graphics.drawRoundedRect(
      0,
      0,
      this.background.size.x,
      this.background.size.y,
      GraphNodeStyle.CORNER_RADIUS,
    );
    graphics.endFill();

    for (let i = 0; i < this.background.input.length; i++) {
      this.background.input[i].drawSocket(graphics);
    }

    for (let i = 0; i < this.background.output.length; i++) {
      this.background.output[i].drawSocket(graphics);
    }

    for (let i = 0; i < this.background.param.length; i++) {
      this.background.param[i].drawSocket(graphics);
    }
  }

  getGeometry() {
    if (this.geometry === null) {
      const graphics = new PIXI.Graphics();
      this.draw(graphics);
      this.geometry = graphics.geometry;
    }
    return this.geometry;
  }

  createMesh() {
    return new PIXI.Graphics(this.getGeometry());
  }
}
