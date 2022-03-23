import * as PIXI from 'pixi.js';

import type {AudionPanel} from '../Types';

import {EdgeArrowGraphics} from './AudioEdgeArrowGraphics';
import {EdgeCurvedLineGraphics} from './AudioEdgeCurvedLineGraphics';

import {GraphColor} from './graphStyle';

const ARROW_LENGTH = 12;
const ARROW_HEIGHT = 4;

const STEP_RATIO = 1 / 10;

const LINE_COEFF = createLineCoefficients();

export interface AudioEdgeKey {
  v: string;
  w: string;
  name: string;
}

/**
 * Render a line between AudionNodes and their inputs, outputs, and parameters.
 */
export class AudioEdgeRender {
  key: AudioEdgeKey;
  source: AudionPanel.Port;
  destination: AudionPanel.Port;
  parent: PIXI.Container;
  graphics: PIXI.Graphics;
  container: PIXI.Container;

  /**
   * @param options
   */
  constructor({
    key,
    source,
    destination,
  }: {
    key: AudioEdgeKey;
    source: AudionPanel.Port;
    destination: AudionPanel.Port;
  }) {
    this.key = key;
    this.source = source;
    this.destination = destination;
    this.parent = null;
    this.graphics = new PIXI.Graphics();
    this.container = new PIXI.Container();

    this.source.edges.push(this);
    this.destination.edges.push(this);
  }
  /**
   * @param parent
   */
  setPIXIParent(parent: PIXI.Container) {
    this.parent = parent;
    // parent.addChild(this.graphics);
    parent.addChild(this.container);
  }
  /**
   * Remove the PIXI DisplayObject from the rendered hierarchy.
   */
  remove() {
    // this.graphics.parent.removeChild(this.graphics);
    this.container.parent.removeChild(this.container);

    this.source.edges.splice(this.source.edges.indexOf(this), 1);
    this.destination.edges.splice(this.destination.edges.indexOf(this), 1);
  }
  /**
   * @param line
   */
  draw(
    line: AudionPanel.Point[],
    {
      edgeArrowGraphics: arrowGraphics,
      edgeCurvedLineGraphics: curvedLineGraphics,
    }: {
      edgeArrowGraphics: EdgeArrowGraphics;
      edgeCurvedLineGraphics: EdgeCurvedLineGraphics;
    },
  ) {
    {
      const {
        offset: start,
        node: {position: sourcePosition},
        radius: sourceRadius,
      } = this.source;
      const {
        offset: end,
        node: {position: destinationPosition},
        radius: destinationRadius,
      } = this.destination;
      const a = new PIXI.Point(
        sourcePosition.x + start.x,
        sourcePosition.y + start.y,
      );
      const d = new PIXI.Point(
        destinationPosition.x + end.x,
        destinationPosition.y + end.y,
      );
      const c = new PIXI.Point(
        (d.x - a.x) / 2 + a.x,
        ((d.y - a.y) * 2) / 3 + a.y,
      );
      // const b1 = new PIXI.Point(a.x + clamp((c.x - a.x) / 2, -10, 10), a.y);
      // const b2 = new PIXI.Point(a.x - clamp((c.x - a.x) / 2, -10, 10), c.y);
      // this.adjustPoint(b1, a, sourceRadius);
      // this.adjustPoint(b2, c, destinationRadius);
      this.container.removeChildren();
      this.container.addChild(arrowGraphics.createGraphics(a, d));
      this.container.addChild(curvedLineGraphics.createGraphics(a, d));
    }
    return;

    // const {graphics} = this;

    // const p = new PIXI.Point();
    // const a = new PIXI.Point(
    //   sourcePosition.x + start.x,
    //   sourcePosition.y + start.y,
    // );
    // const b = line[1];
    // const c = new PIXI.Point(
    //   destinationPosition.x + end.x,
    //   destinationPosition.y + end.y,
    // );

    // this.adjustPoint(b, a, sourceRadius);
    // this.adjustPoint(b, c, destinationRadius);

    // graphics.clear();
    // this.drawCurvedLine(a, b, c, graphics, p);
    // this.drawArrow(p, c, graphics);
  }

  /**
   * Draw an arrow.
   * @param pointOnLine
   * @param end
   * @param graphics
   */
  drawArrow(
    pointOnLine: AudionPanel.Point,
    end: AudionPanel.Point,
    graphics: PIXI.Graphics,
  ) {
    const arrowMagnitude = Math.hypot(
      pointOnLine.y - end.y,
      pointOnLine.x - end.x,
    );
    const arrowUnitX = (pointOnLine.x - end.x) / arrowMagnitude;
    const arrowUnitY = (pointOnLine.y - end.y) / arrowMagnitude;

    graphics.beginFill(GraphColor.INPUT_OUTPUT);
    graphics.lineTo(
      end.x + arrowUnitX * ARROW_LENGTH + arrowUnitY * ARROW_HEIGHT,
      end.y + arrowUnitY * ARROW_LENGTH - arrowUnitX * ARROW_HEIGHT,
    );
    graphics.lineTo(
      end.x + arrowUnitX * ARROW_LENGTH - arrowUnitY * ARROW_HEIGHT,
      end.y + arrowUnitY * ARROW_LENGTH + arrowUnitX * ARROW_HEIGHT,
    );
    graphics.lineTo(end.x, end.y);
    graphics.endFill();
  }

  /**
   * Draw a curved line with 3 points to control its shape.
   * @param a
   * @param b
   * @param c
   * @param graphics
   * @param pointOnLine
   */
  drawCurvedLine(
    a: AudionPanel.Point,
    b: AudionPanel.Point,
    c: AudionPanel.Point,
    graphics: PIXI.Graphics,
    pointOnLine: AudionPanel.Point,
  ) {
    const lineCoeffs = lineCoefficients(a, b, c, LINE_COEFF);

    const lineMagnitudeEstimate = Math.hypot(a.y - c.y, a.x - c.x);
    const steps = Math.max(2, Math.ceil(lineMagnitudeEstimate * STEP_RATIO));

    graphics.lineStyle(2, GraphColor.INPUT_OUTPUT);

    graphics.moveTo(a.x, a.y);
    for (let i = 1; i < steps; i++) {
      interpolateCoefficients(lineCoeffs, i / steps, pointOnLine);
      graphics.lineTo(pointOnLine.x, pointOnLine.y);
    }
    graphics.lineTo(c.x, c.y);
  }

  /**
   * Adjust a point along a line by amount radius.
   * @param end
   * @param destination
   * @param radius
   */
  adjustPoint(
    end: AudionPanel.Point,
    destination: AudionPanel.Point,
    radius: number,
  ) {
    const magnitude = Math.hypot(end.y - destination.y, end.x - destination.x);

    destination.x += ((end.x - destination.x) / magnitude) * radius;
    destination.y += ((end.y - destination.y) / magnitude) * radius;
  }
}

/**
 * Create a LineCoefficients object.
 * @return
 */
function createLineCoefficients(): LineCoefficients {
  return {ax: 0, ay: 0, bx: 0, by: 0, cx: 0, cy: 0};
}

/**
 * Interpolate a line from 3 points: a, b, c.
 * @param a
 * @param b
 * @param c
 * @param coeff
 * @return
 */
function lineCoefficients(
  a: AudionPanel.Point,
  b: AudionPanel.Point,
  c: AudionPanel.Point,
  coeff = createLineCoefficients(),
): LineCoefficients {
  const {x: ax, y: ay} = a;
  const {x: bx, y: by} = b;
  const {x: cx, y: cy} = c;

  const cbx = cx - bx;
  const bax = bx - ax;
  const cby = cy - by;
  const bay = by - ay;

  coeff.ax = cbx - bax;
  coeff.ay = cby - bay;
  coeff.bx = 2 * bax;
  coeff.by = 2 * bay;
  coeff.cx = ax;
  coeff.cy = ay;

  return coeff;
}

/**
 * @param coeff
 * @param t number between 0 and 1 inclusive
 * @param destination
 * @return
 */
function interpolateCoefficients(
  coeff: LineCoefficients,
  t: number,
  destination: AudionPanel.Point = new PIXI.Point(),
): AudionPanel.Point {
  destination.x = coeff.ax * t * t + coeff.bx * t + coeff.cx;
  destination.y = coeff.ay * t * t + coeff.by * t + coeff.cy;
  return destination;
}

/**
 * @typedef LineCoefficients
 * @property {number} ax
 * @property {number} ay
 * @property {number} bx
 * @property {number} by
 * @property {number} cx
 * @property {number} cy
 */

interface LineCoefficients {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
}
