import * as PIXI from 'pixi.js';

import {Audion} from '../../devtools/Types';

import {Color, colorFromNodeType} from './graphStyle';
import {AudioNodePort} from './AudioNodePort';

/**
 * Manage the rendered representation of a WebAudio node.
 */
export class AudioNodeRender {
  id: string;
  node: Audion.GraphNode;
  parent: PIXI.Container;
  container: PIXI.Container;
  title: PIXI.Text;
  labelContainer: PIXI.Container;
  background: PIXI.Graphics;
  size: PIXI.Point;
  position: PIXI.Point;
  input: AudioNodePort[];
  output: AudioNodePort[];
  param: {[key: string]: AudioNodePort};

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
    this.size = new PIXI.Point();
    this.position = null;
    this.input = [];
    this.output = [];
    this.param = {};
  }

  /** Padding around input ports. */
  static get INPUT_GROUP_MARGIN() {
    return 10;
  }

  /** Height of input output ports. */
  static get INPUT_HEIGHT() {
    return 30;
  }

  /** Radius of the visible port icon. */
  static get INPUT_RADIUS() {
    return 10;
  }

  /** Padding around the group of params. */
  static get PARAM_GROUP_MARGIN() {
    return 5;
  }

  /** Height of audio parameter ports. */
  static get PARAM_HEIGHT() {
    return 20;
  }

  /** Radius of visible port icon. */
  static get PARAM_RADIUS() {
    return 8;
  }

  /**
   * @param node
   * @return
   */
  init(node: Audion.GraphNode): AudioNodeRender {
    if (this.node && node.params.length === Object.keys(this.param).length) {
      return this;
    }

    this.node = node;

    const container = (this.container = new PIXI.Container());
    this.position = container.position;

    container.visible = false;

    const title = (this.title = new PIXI.Text(node.node.nodeType, {
      fill: Color.TEXT,
      fontSize: 24,
    }));
    title.position.set(15, 5);
    const background = (this.background = new PIXI.Graphics());
    const labelContainer = (this.labelContainer = new PIXI.Container());
    container.addChild(background);
    container.addChild(labelContainer);
    container.addChild(title);

    this.initSize();
    this.initPorts();

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
  initSize() {
    const {node, title} = this;
    const localBounds = new PIXI.Rectangle();

    this.labelContainer.removeChildren();

    const maxParamTextSize = new PIXI.Point();
    for (let i = 0; i < node.params.length; i++) {
      const param = node.params[i];

      const label = new PIXI.Text(param.paramType, {
        fill: Color.TEXT,
        fontSize: 12,
      });
      this.labelContainer.addChild(label);

      label.getLocalBounds(localBounds);
      maxParamTextSize.x = Math.max(maxParamTextSize.x, localBounds.width);
      maxParamTextSize.y = Math.max(maxParamTextSize.y, localBounds.height);
    }

    title.getLocalBounds(localBounds);

    this.size.set(
      Math.max(localBounds.width, maxParamTextSize.x) + 30,
      Math.max(
        localBounds.height + 15,
        Math.max(
          localBounds.height,
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
  initPorts() {
    const {input, node, output, param} = this;

    for (let i = input.length; i < node.node.numberOfInputs; i++) {
      input[i] = new AudioNodePort({
        node: this,
        point: new PIXI.Point(
          0,
          AudioNodeRender.INPUT_GROUP_MARGIN +
            (i + 0.5) * AudioNodeRender.INPUT_HEIGHT,
        ),
        radius: AudioNodeRender.INPUT_RADIUS,
        color: Color.INPUT_OUTPUT,
      });
    }

    for (let i = output.length; i < node.node.numberOfOutputs; i++) {
      output[i] = new AudioNodePort({
        node: this,
        point: new PIXI.Point(
          this.size.x,
          AudioNodeRender.INPUT_GROUP_MARGIN +
            (i + 0.5) * AudioNodeRender.INPUT_HEIGHT,
        ),
        radius: AudioNodeRender.INPUT_RADIUS,
        color: Color.INPUT_OUTPUT,
      });
    }

    const localBounds = new PIXI.Rectangle();
    this.title.getLocalBounds(localBounds);
    const paramYStart = Math.max(
      localBounds.height,
      AudioNodeRender.INPUT_GROUP_MARGIN +
        input.length * AudioNodeRender.INPUT_HEIGHT +
        Math.max(
          AudioNodeRender.INPUT_GROUP_MARGIN,
          AudioNodeRender.PARAM_GROUP_MARGIN,
        ),
    );

    for (let i = 0; i < node.params.length; i++) {
      const paramData = node.params[i];
      if (paramData.paramId in param) {
        continue;
      }

      param[paramData.paramId] = new AudioNodePort({
        node: this,
        point: new PIXI.Point(
          0,
          paramYStart + (i + 0.5) * AudioNodeRender.PARAM_HEIGHT,
        ),
        radius: AudioNodeRender.PARAM_RADIUS,
        color: Color.AUDIO_PARAM,
      });
    }
  }

  /**
   * Update the rendering.
   */
  draw() {
    const {background, node} = this;

    background.clear();
    background.lineStyle(0);
    background.beginFill(colorFromNodeType(node.node.nodeType));
    background.drawRoundedRect(0, 0, this.size.x, this.size.y, 3);
    background.endFill();

    for (let i = 0; i < this.input.length; i++) {
      this.input[i].draw(background);
    }

    for (let i = 0; i < this.output.length; i++) {
      this.output[i].draw(background);
    }

    let p = 0;
    for (const port of Object.values(this.param)) {
      port.draw(background);

      const label = this.labelContainer.getChildAt(p++);
      label.position.set(15, port.offset.y - 6);
    }
  }
}
