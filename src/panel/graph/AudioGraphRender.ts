/// <reference path="../../chrome/Types.js" />

import * as PIXI from 'pixi.js';
import {BehaviorSubject} from 'rxjs';

import {Audion} from '../../devtools/Types';

import {AudioEdgeKey, AudioEdgeRender} from './AudioEdgeRender';
import {AudioNodeRender} from './AudioNodeRender';
import {Camera} from './Camera';
import {GraphicsCache} from './GraphicsCache';

type AnimationFrameId = ReturnType<typeof requestAnimationFrame>;

/**
 * Render a graph of nodes and edges.
 */
export class AudioGraphRender {
  nodeMap: Map<string, AudioNodeRender>;
  edgeIdMap: Map<string, Map<string, Map<string, AudioEdgeKey>>>;
  edgeMap: Map<AudioEdgeKey, AudioEdgeRender>;

  camera: Camera;

  elementContainer: HTMLElement;
  pixiApplication: PIXI.Application<HTMLCanvasElement> | null;
  pixiView: HTMLCanvasElement | null;
  pixiNodeContainer: PIXI.Container | null;
  pixiEdgeContainer: PIXI.Container | null;

  renderFrameId: AnimationFrameId | null;

  graphicsCache: GraphicsCache;

  selectedNode$: BehaviorSubject<Audion.GraphNode>;

  /**
   * Create an AudioGraphRender.
   * @param options
   */
  constructor({elementContainer}: {elementContainer: HTMLElement}) {
    this.nodeMap = new Map();
    this.edgeIdMap = new Map();
    this.edgeMap = new Map();

    this.camera = new Camera();

    this.elementContainer = elementContainer;
    this.pixiView = null;
    this.pixiApplication = null;
    this.pixiNodeContainer = null;
    this.pixiEdgeContainer = null;

    this.renderFrameId = null;

    this.graphicsCache = null;

    this._render = this._render.bind(this);

    this.selectedNode$ = new BehaviorSubject<Audion.GraphNode>(null);
  }

  /** Initialize. */
  init() {
    const app = (this.pixiApplication = new PIXI.Application<HTMLCanvasElement>(
      {
        backgroundColor: 0xffffff,
        resizeTo: this.elementContainer,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
      },
    ));
    this.pixiView = app.view;

    this.graphicsCache = new GraphicsCache();

    const nodeContainer = (this.pixiNodeContainer = new PIXI.Container());
    app.stage.addChild(nodeContainer);

    const edgeContainer = (this.pixiEdgeContainer = new PIXI.Container());
    app.stage.addChild(edgeContainer);

    this.initEvents();

    this.camera.viewportObserver.observe((viewport) => {
      const {x, y, width, height} = this.camera.viewport;
      app.stage.setTransform(-x / width, -y / height, 1 / width, 1 / height);
      this.requestRender();
    });
  }

  /** Render the graph. */
  requestRender() {
    if (this.renderFrameId === null) {
      this.renderFrameId = requestAnimationFrame(this._render);
    }
  }

  _render() {
    this.renderFrameId = null;

    const {pixiApplication: app} = this;

    this.camera.setScreenSize(app.screen.width, app.screen.height);
    app.render();
  }

  /** Stop rendering. */
  stop() {
    cancelAnimationFrame(this.renderFrameId);
  }

  /**
   * @param message
   */
  updateGraphSizes(message: Audion.GraphContext): Audion.GraphContext {
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
   * @param message
   */
  update(message: Audion.GraphContext) {
    this.camera.setGraphSize(
      message.graph.value.width,
      message.graph.value.height,
    );

    const previousNodeRenders = new Set(this.nodeMap.values());
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
        previousNodeRenders.delete(nodeRender);
      } else {
        this.destroyNodeRender(nodeId);
      }
    }
    for (const nodeRender of previousNodeRenders) {
      this.destroyNodeRender(nodeRender.id);
    }

    const previousEdgeRenders = new Set(this.edgeMap.values());
    for (let i = 0; i < message.graph.edges.length; i++) {
      const edgeKeyValue = message.graph.edges[i];
      const edge = edgeKeyValue.value;

      if (edge) {
        const edgeRender = this.createEdgeRender(edgeKeyValue, message);
        if (edgeRender) {
          edgeRender.draw(edge.points, this.graphicsCache);
        }
        previousEdgeRenders.delete(edgeRender);
      }
    }
    for (const edgeRender of previousEdgeRenders) {
      this.destroyEdgeRender(edgeRender.key);
    }

    this.requestRender();
  }

  getNodeAtViewportPoint(viewportPoint: {x: number; y: number}) {
    const screenPoint = new PIXI.Point(
      viewportPoint.x * this.camera.screen.width,
      viewportPoint.y * this.camera.screen.height,
    );
    return this.getNodeAtScreenPoint(screenPoint);
  }

  getNodeAtScreenPoint(screenPoint: {x: number; y: number}) {
    for (const nodeRender of this.nodeMap.values()) {
      if (
        nodeRender.container.getBounds().contains(screenPoint.x, screenPoint.y)
      ) {
        return nodeRender.node;
      }
    }

    return null;
  }

  /** Initialize event handling. */
  initEvents() {
    const {pixiApplication: app} = this;

    app.stage.eventMode = 'dynamic';
    let lastPoint = null;
    app.stage.addListener('mousemove', (e) => {
      if (lastPoint && e.buttons) {
        this.camera.move(lastPoint.x - e.globalX, lastPoint.y - e.globalY);
      }
      lastPoint = e.global.clone();
    });

    app.view.onclick = ({offsetX, offsetY}) => {
      const {clientWidth, clientHeight} = app.view;
      const viewportPoint = new PIXI.Point(
        offsetX / clientWidth,
        offsetY / clientHeight,
      );

      const lastSelectedNode = this.selectedNode$.value;
      const selectedNode = this.getNodeAtViewportPoint(viewportPoint);
      this.nodeMap.get(lastSelectedNode?.node?.nodeId)?.setHighlight(false);
      this.nodeMap.get(selectedNode?.node?.nodeId)?.setHighlight(true);
      this.requestRender();

      this.selectedNode$.next(selectedNode);
    };

    app.view.onwheel = (e) => {
      this.camera.zoom(
        e.clientX - app.view.clientLeft,
        e.clientY - app.view.clientTop,
        e.deltaY / 1000,
      );
    };
  }

  /**
   * Create the rendering for an audio node.
   * @param nodeId
   * @param node
   * @returns
   */
  createNodeRender(nodeId: string, node: Audion.GraphNode): AudioNodeRender {
    let nodeRender = this.nodeMap.get(nodeId);
    if (!nodeRender) {
      if (node.node && node.node.nodeType) {
        nodeRender = new AudioNodeRender(nodeId).init(node, this.graphicsCache);
        nodeRender.setPixiParent(this.pixiNodeContainer);
        this.nodeMap.set(nodeId, nodeRender);
      }
    }
    return nodeRender;
  }

  /**
   * Destroy the rendering for an audio node.
   * @param nodeId
   */
  destroyNodeRender(nodeId: any) {
    const nodeRender = this.nodeMap.get(nodeId);
    if (nodeRender) {
      nodeRender.remove();
      this.nodeMap.delete(nodeId);

      if (nodeId === this.selectedNode$.value?.node?.nodeId) {
        this.selectedNode$.next(null);
      }
    }
  }

  compareEdgeKey(left: AudioEdgeKey, right: AudioEdgeKey) {
    if (left.v < right.v) {
      return -1;
    } else if (left.v > right.v) {
      return 1;
    }
    if (left.w < right.w) {
      return -1;
    } else if (left.w > right.w) {
      return 1;
    }
    if (left.name < right.name) {
      return -1;
    } else if (left.name > right.name) {
      return 1;
    }
    return 0;
  }

  createEdgeId({v, w, name}: Audion.GraphlibEdge) {
    if (!this.edgeIdMap.has(v)) {
      this.edgeIdMap.set(v, new Map());
    }
    const edgeIdVMap = this.edgeIdMap.get(v);
    if (!edgeIdVMap.has(w)) {
      edgeIdVMap.set(w, new Map());
    }
    const edgeIdVWMap = edgeIdVMap.get(w);
    if (!edgeIdVWMap.has(name)) {
      edgeIdVWMap.set(name, {v, w, name});
    }
    return edgeIdVWMap.get(name);
  }

  destroyEdgeId(edgeId: AudioEdgeKey) {
    if (this.edgeIdMap.has(edgeId.v)) {
      const edgeIdVMap = this.edgeIdMap.get(edgeId.v);
      if (edgeIdVMap.has(edgeId.w)) {
        const edgeIdVWMap = edgeIdVMap.get(edgeId.w);
        if (edgeIdVWMap.has(edgeId.name)) {
          edgeIdVWMap.delete(edgeId.name);
        }
        if (edgeIdVWMap.size === 0) {
          edgeIdVMap.delete(edgeId.w);
        }
      }
      if (edgeIdVMap.size === 0) {
        this.edgeIdMap.delete(edgeId.v);
      }
    }
  }

  /**
   * @param edge
   * @param context
   * @return
   */
  createEdgeRender(
    edge: Audion.GraphlibEdge,
    context: Audion.GraphContext,
  ): AudioEdgeRender {
    const edgeId = this.createEdgeId(edge);
    let edgeRender = this.edgeMap.get(edgeId);
    if (!edgeRender) {
      const sourceData = context.nodes[edge.v];
      const destinationData = context.nodes[edge.w];
      if (sourceData && destinationData) {
        const sourceNode = this.nodeMap.get(sourceData.node.nodeId);
        const destinationNode = this.nodeMap.get(destinationData.node.nodeId);

        if (sourceNode && destinationNode) {
          const {sourceOutputIndex, destinationType} = edge.value;
          const sourceNodePort = sourceNode.output[sourceOutputIndex];
          const destinationNodePort =
            destinationType === Audion.GraphEdgeType.NODE
              ? destinationNode.input[edge.value.destinationInputIndex]
              : destinationNode.param[edge.value.destinationParamIndex];

          if (sourceNodePort && destinationNodePort) {
            edgeRender = new AudioEdgeRender({
              key: edgeId,
              source: sourceNodePort,
              destination: destinationNodePort,
            });
            edgeRender.setPIXIParent(this.pixiEdgeContainer);

            edgeRender.source.updateNodeDisplay();
            edgeRender.destination.updateNodeDisplay();

            this.edgeMap.set(edgeId, edgeRender);
          }
        }
      }
    }
    return edgeRender;
  }

  /**
   * @param edgeId
   */
  destroyEdgeRender(edgeId: AudioEdgeKey) {
    const edgeRender = this.edgeMap.get(edgeId);
    if (edgeRender) {
      edgeRender.remove();

      edgeRender.source.updateNodeDisplay();
      edgeRender.destination.updateNodeDisplay();

      this.edgeMap.delete(edgeId);

      this.destroyEdgeId(edgeId);
    }
  }
}
