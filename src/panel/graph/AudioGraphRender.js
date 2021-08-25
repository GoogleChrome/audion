/// <reference path="../../chrome/Types.js" />
/// <reference path="../../devtools/Types.js" />

import * as PIXI from 'pixi.js';
import {AudioEdgeRender} from './AudioEdgeRender';
import {AudioNodeRender} from './AudioNodeRender';
import {Camera} from './Camera';

/**
 * Render a graph of nodes and edges.
 */
export class AudioGraphRender {
  /**
   * Create an AudioGraphRender.
   * @param {object} options
   * @param {HTMLElement} options.elementContainer
   */
  constructor({elementContainer}) {
    this.nodeMap = new Map();
    this.edgeMap = new Map();

    this.camera = new Camera();

    this.elementContainer = elementContainer;
    this.pixiView = null;
    this.pixiApplication = null;
    this.pixiNodeContainer = null;
    this.pixiEdgeContainer = null;

    this.renderFrameId = null;

    this.render = this.render.bind(this);
  }

  /** Initialize. */
  init() {
    const app = (this.pixiApplication = new PIXI.Application({
      backgroundColor: 0xffffff,
      resizeTo: this.elementContainer,
      antialias: true,
    }));
    this.pixiView = app.view;
    // window.$app = app;

    const nodeContainer = (this.pixiNodeContainer = new PIXI.Container());
    app.stage.addChild(nodeContainer);

    const edgeContainer = (this.pixiEdgeContainer = new PIXI.Container());
    app.stage.addChild(edgeContainer);

    this.initEvents();

    this.camera.viewportObserver.observe((viewport) => {
      const {x, y, width, height} = this.camera.viewport;
      app.stage.setTransform(-x / width, -y / height, 1 / width, 1 / height);
    });
  }

  /** Render the graph. */
  render() {
    const {pixiApplication: app} = this;

    this.renderFrameId = requestAnimationFrame(this.render);

    this.camera.setScreenSize(app.screen.width, app.screen.height);
    app.render();
  }

  /** Start rendering regularly. */
  start() {
    this.renderFrameId = requestAnimationFrame(this.render);
  }

  /** Stop rendering. */
  stop() {
    cancelAnimationFrame(this.renderFrameId);
  }

  /**
   * @param {Audion.GraphContext} message
   * @return {Audion.GraphContext}
   */
  updateGraphSizes(message) {
    if (message.graph) {
      message.graph.nodes.forEach(({v: nodeId, value: node}) => {
        if (node) {
          const nodeRender = this.createNodeRender(
            nodeId,
            message.nodes[nodeId],
          );
          node.width = nodeRender.size.x;
          node.height = nodeRender.size.y;
        }
      });
    } else {
      for (const nodeId of this.nodeMap.keys()) {
        this.destroyNodeRender(nodeId);
      }
      for (const edgeId of this.edgeMap.keys()) {
        this.destroyEdgeRender(edgeId);
      }
    }
    return message;
  }

  /**
   * @param {Audion.GraphContext} message
   */
  update(message) {
    this.camera.setGraphSize(
      message.graph.value.width,
      message.graph.value.height,
    );

    for (let i = 0; i < message.graph.nodes.length; i++) {
      const nodeKeyValue = message.graph.nodes[i];
      const nodeId = nodeKeyValue.v;
      const node = nodeKeyValue.value;

      if (node) {
        const nodeRender = this.createNodeRender(nodeId, message.nodes[nodeId]);
        nodeRender.container.visible = true;
        nodeRender.position.set(
          node.x - nodeRender.size.x / 2,
          node.y - nodeRender.size.y / 2,
        );
      } else {
        this.destroyNodeRender(nodeId);
      }
    }
    for (const nodeId of this.nodeMap.keys()) {
      if (!message.graph.nodes.find((node) => node.v === nodeId)) {
        this.destroyNodeRender(nodeId);
      }
    }
    for (let i = 0; i < message.graph.edges.length; i++) {
      const edgeKeyValue = message.graph.edges[i];
      const edge = edgeKeyValue.value;

      if (edge) {
        const edgeRender = this.createEdgeRender(edgeKeyValue, message);
        edgeRender.draw(edge.points);
      }
    }
    for (const edgeId of this.edgeMap.keys()) {
      if (
        !message.graph.edges.find(
          (edge) => `${edge.v} ${edge.w} ${edge.name}` === edgeId,
        )
      ) {
        this.destroyEdgeRender(edgeId);
      }
    }
  }

  /** Initialize event handling. */
  initEvents() {
    const {pixiApplication: app} = this;

    app.stage.interactive = true;
    let lastPoint = null;
    app.stage.addListener('mousemove', (e) => {
      if (e instanceof PIXI.InteractionEvent) {
        if (lastPoint && e.data.buttons) {
          this.camera.move(
            lastPoint.x - e.data.global.x,
            lastPoint.y - e.data.global.y,
          );
        }
        lastPoint = e.data.global.clone();
      }
    });

    app.view.onwheel = (/** @type {WheelEvent} */ e) => {
      this.camera.zoom(
        e.clientX - app.view.clientLeft,
        e.clientY - app.view.clientTop,
        e.deltaY / 1000,
      );
    };
  }

  /**
   * Create the rendering for an audio node.
   * @param {string} nodeId
   * @param {Audion.GraphNode} node
   * @return {AudioNodeRender}
   */
  createNodeRender(nodeId, node) {
    /** @type {AudioNodeRender} */
    let nodeRender = this.nodeMap.get(nodeId);
    if (!nodeRender) {
      if (node.node && node.node.nodeType) {
        nodeRender = new AudioNodeRender(nodeId).init(node);
        nodeRender.setPixiParent(this.pixiNodeContainer);
        this.nodeMap.set(nodeId, nodeRender);
      }
    }
    return nodeRender;
  }

  /**
   * Destroy the rendering for an audio node.
   * @param {*} nodeId
   */
  destroyNodeRender(nodeId) {
    const nodeRender = this.nodeMap.get(nodeId);
    if (nodeRender) {
      nodeRender.remove();
      this.nodeMap.delete(nodeId);
    }
  }

  /**
   * @param {*} edge
   * @param {Audion.GraphContext} context
   * @return {AudioEdgeRender}
   */
  createEdgeRender(edge, context) {
    const edgeId = `${edge.v} ${edge.w} ${edge.name}`;
    let edgeRender = this.edgeMap.get(edgeId);
    if (!edgeRender) {
      const sourceData = context.nodes[edge.v];
      const destinationData = context.nodes[edge.w];
      const sourceNode = this.nodeMap.get(sourceData.node.nodeId);
      const destinationNode = this.nodeMap.get(destinationData.node.nodeId);

      edgeRender = new AudioEdgeRender({
        source: sourceNode.output[edge.value.sourceOutputIndex],
        destination:
          edge.value.destinationInputIndex >= 0
            ? destinationNode.input[edge.value.destinationInputIndex]
            : destinationNode.param[edge.value.destinationParamId],
      });
      edgeRender.setPIXIParent(this.pixiEdgeContainer);

      sourceNode.draw();
      destinationNode.draw();

      this.edgeMap.set(edgeId, edgeRender);
    }
    return edgeRender;
  }

  /**
   * @param {string} edgeId
   */
  destroyEdgeRender(edgeId) {
    const edgeRender = this.edgeMap.get(edgeId);
    if (edgeRender) {
      edgeRender.remove();
      this.edgeMap.delete(edgeId);
    }
  }
}
