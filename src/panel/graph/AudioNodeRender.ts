import * as PIXI from 'pixi.js';

import {Audion} from '../../devtools/Types';

import {
  GraphColor,
  colorFromNodeType,
  GraphNodeStyle,
  GraphPortStyle,
  GraphTextStyle,
} from './graphStyle';
import {AudioNodePort, AudioNodePortType} from './AudioNodePort';
import {AudioGraphTextCacheGroup} from './AudioGraphTextCacheGroup';
import {AudioNodeBackgroundRenderCacheGroup} from './AudioNodeBackgroundRenderCacheGroup';
import {AudioPortCacheGroup} from './AudioPortCacheGroup';
import {AudionPanel} from '../Types';

/**
 * Manage the rendered representation of a WebAudio node.
 */
export class AudioNodeRender {
  id: string;
  node: Audion.GraphNode;

  backgroundCacheGroup: AudioNodeBackgroundRenderCacheGroup;

  parent: PIXI.Container;
  container: PIXI.Container;
  title: PIXI.DisplayObject;
  labelContainer: PIXI.Container;
  background: PIXI.DisplayObject;
  portContainer: PIXI.Container;
  inputPortDisplays: PIXI.DisplayObject[];
  outputPortDisplays: PIXI.DisplayObject[];
  paramPortDisplays: PIXI.DisplayObject[];

  size: PIXI.Point;
  position: PIXI.Point;
  input: AudioNodePort[];
  output: AudioNodePort[];
  param: AudioNodePort[];
  isHighlighted: boolean;

  /**
   * Create a AudioNodeRender instance.
   * @param id
   */
  constructor(id: string) {
    this.id = id;
    this.node = null;
    this.parent = null;
    this.container = null;
    this.title = null;
    this.labelContainer = null;
    this.background = null;
    this.backgroundCacheGroup = null;
    this.inputPortDisplays = [];
    this.outputPortDisplays = [];
    this.paramPortDisplays = [];
    this.size = new PIXI.Point();
    this.position = null;
    this.input = [];
    this.output = [];
    this.param = [];
  }

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

  /**
   * @param node
   * @return
   */
  init(
    node: Audion.GraphNode,
    {
      textCacheGroup,
      backgroundCacheGroup,
      portCacheGroup,
    }: {
      textCacheGroup: AudioGraphTextCacheGroup;
      backgroundCacheGroup: AudioNodeBackgroundRenderCacheGroup;
      portCacheGroup: AudioPortCacheGroup;
    },
  ): AudioNodeRender {
    if (this.node && node.params.length === Object.keys(this.param).length) {
      return this;
    }

    this.node = node;
    this.backgroundCacheGroup = backgroundCacheGroup;

    const container = (this.container = new PIXI.Container());
    this.position = container.position;

    container.visible = false;

    const title = (this.title = textCacheGroup.titleText
      .getText(node.node.nodeType)
      .createSprite());
    title.position.set(GraphNodeStyle.PADDING, GraphNodeStyle.TITLE_PADDING);

    const background = (this.background = backgroundCacheGroup.plain
      .getBackground(node)
      .createMesh());

    const labelContainer = (this.labelContainer = new PIXI.Container());
    const portContainer = (this.portContainer = new PIXI.Container());
    container.addChild(background);
    container.addChild(labelContainer);
    container.addChild(title);
    container.addChild(portContainer);

    this.initSize(textCacheGroup);
    this.initPorts(portCacheGroup);

    this.draw();

    return this;
  }

  /**
   * @param parent
   */
  setPixiParent(parent: PIXI.Container) {
    this.parent = parent;
    parent.addChild(this.container);
  }

  /**
   * Remove from the rendering hierarchy.
   */
  remove() {
    this.container.parent.removeChild(this.container);
  }

  /** Deteremine the size of the node. */
  initSize(textCacheGroup: AudioGraphTextCacheGroup) {
    const {node, title} = this;
    const localBounds = new PIXI.Rectangle();

    this.labelContainer.removeChildren();

    const maxParamTextSize = new PIXI.Point();
    for (let i = 0; i < node.params.length; i++) {
      const param = node.params[i];

      const label = textCacheGroup.paramText
        .getText(param.paramType)
        .createSprite();
      this.labelContainer.addChild(label);

      label.getLocalBounds(localBounds);
      maxParamTextSize.x = Math.max(maxParamTextSize.x, localBounds.width);
      maxParamTextSize.y = Math.max(maxParamTextSize.y, localBounds.height);
    }

    title.getLocalBounds(localBounds);

    this.size.set(
      Math.max(localBounds.width, maxParamTextSize.x) +
        2 * GraphNodeStyle.PADDING,
      Math.max(
        Math.max(
          localBounds.height + 2 * GraphNodeStyle.TITLE_PADDING,
          AudioNodeRender.INPUT_GROUP_MARGIN +
            AudioNodeRender.INPUT_HEIGHT * node.node.numberOfInputs +
            Math.max(
              AudioNodeRender.INPUT_GROUP_MARGIN,
              AudioNodeRender.PARAM_GROUP_MARGIN,
            ),
        ) +
          AudioNodeRender.PARAM_HEIGHT * node.params.length +
          AudioNodeRender.PARAM_GROUP_MARGIN,
        AudioNodeRender.INPUT_GROUP_MARGIN +
          AudioNodeRender.INPUT_HEIGHT * node.node.numberOfOutputs +
          AudioNodeRender.INPUT_GROUP_MARGIN,
      ),
    );
  }

  /**
   * Initialize ports.
   */
  initPorts(portCacheGroup: AudioPortCacheGroup) {
    const {
      input,
      node,
      output,
      param,
      inputPortDisplays,
      outputPortDisplays,
      paramPortDisplays,
    } = this;

    for (let i = input.length; i < node.node.numberOfInputs; i++) {
      const inputPoint = new PIXI.Point(
        0,
        AudioNodeRender.INPUT_GROUP_MARGIN +
          (i + 0.5) * AudioNodeRender.INPUT_HEIGHT,
      );

      input[i] = new AudioNodePort({
        node: this,
        portType: AudionPanel.PortType.INPUT,
        portIndex: i,
        point: inputPoint,
        radius: AudioNodeRender.INPUT_RADIUS,
        color: GraphColor.INPUT_OUTPUT,
      });

      inputPortDisplays[i] =
        portCacheGroup.inputOutput.createGraphics(inputPoint);
      this.portContainer.addChild(inputPortDisplays[i]);
    }

    for (let i = output.length; i < node.node.numberOfOutputs; i++) {
      const outputPoint = new PIXI.Point(
        this.size.x,
        AudioNodeRender.INPUT_GROUP_MARGIN +
          (i + 0.5) * AudioNodeRender.INPUT_HEIGHT,
      );

      output[i] = new AudioNodePort({
        node: this,
        portType: AudionPanel.PortType.OUTPUT,
        portIndex: i,
        point: outputPoint,
        radius: AudioNodeRender.INPUT_RADIUS,
        color: GraphColor.INPUT_OUTPUT,
      });

      outputPortDisplays[i] =
        portCacheGroup.inputOutput.createGraphics(outputPoint);
      this.portContainer.addChild(outputPortDisplays[i]);
    }

    const localBounds = new PIXI.Rectangle();
    this.title.getLocalBounds(localBounds);
    const paramYStart = Math.max(
      localBounds.height + GraphNodeStyle.TITLE_PADDING,
      AudioNodeRender.INPUT_GROUP_MARGIN +
        input.length * AudioNodeRender.INPUT_HEIGHT +
        Math.max(
          AudioNodeRender.INPUT_GROUP_MARGIN,
          AudioNodeRender.PARAM_GROUP_MARGIN,
        ),
    );

    for (let i = 0; i < node.params.length; i++) {
      const paramPoint = new PIXI.Point(
        0,
        paramYStart + (i + 0.5) * AudioNodeRender.PARAM_HEIGHT,
      );

      const paramPort = (param[i] = new AudioNodePort({
        node: this,
        portType: AudionPanel.PortType.PARAM,
        portIndex: i,
        point: paramPoint,
        radius: AudioNodeRender.PARAM_RADIUS,
        color: GraphColor.AUDIO_PARAM,
      }));

      paramPortDisplays[i] = portCacheGroup.param.createGraphics(paramPoint);
      this.portContainer.addChild(paramPortDisplays[i]);

      const label = this.labelContainer.getChildAt(i);
      label.position.set(
        GraphNodeStyle.PADDING,
        paramPort.offset.y - 0.5 * GraphTextStyle.PARAM.fontSize,
      );
    }
  }

  setHighlight(isHighlighted: boolean) {
    this.isHighlighted = isHighlighted;
    this.draw();
  }

  updatePortDisplay(portType: AudionPanel.PortType, index: number) {
    if (portType === AudionPanel.PortType.INPUT) {
      this.inputPortDisplays[index].visible =
        this.input[index].edges.length > 0;
    } else if (portType === AudionPanel.PortType.OUTPUT) {
      this.outputPortDisplays[index].visible =
        this.output[index].edges.length > 0;
    } else if (portType === AudionPanel.PortType.PARAM) {
      this.paramPortDisplays[index].visible =
        this.param[index].edges.length > 0;
    }
  }

  /**
   * Update the rendering.
   */
  draw() {
    const newBackground = (
      this.isHighlighted
        ? this.backgroundCacheGroup.highlight
        : this.backgroundCacheGroup.plain
    )
      .getBackground(this.node)
      .createMesh();

    this.container.removeChild(this.background);
    this.container.addChildAt(newBackground, 0);
    this.background = newBackground;
  }
}
