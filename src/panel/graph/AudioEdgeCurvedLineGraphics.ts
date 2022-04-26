import * as PIXI from 'pixi.js';

import {AudionPanel} from '../Types';

import {GraphColor} from './graphStyle';

const STEP_RATIO = 1 / 10;

const LINE_COEFF = createLineCoefficients();

interface LineCoefficients {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  cx: number;
  cy: number;
  dx: number;
  dy: number;
}

export class EdgeCurvedLineGraphics {
  geometryCache: PIXI.GraphicsGeometry[][] = [];

  getGeometry(a: PIXI.Point, d: PIXI.Point) {
    const i = Math.floor(Math.abs(d.x - a.x));
    const j = Math.floor(Math.abs(d.y - a.y));

    if (i > 100 || j > 100) {
      const graphics = new PIXI.Graphics();
      this.drawCurvedLine(
        new PIXI.Point(),
        new PIXI.Point(i / 2, j / 3),
        new PIXI.Point(i / 2, (j * 2) / 3),
        new PIXI.Point(i, j),
        graphics,
        new PIXI.Point(),
      );
      return graphics.geometry;
    }

    if (!this.geometryCache[i]) {
      this.geometryCache[i] = [];
    }
    if (!this.geometryCache[i][j]) {
      const b0 = new PIXI.Point(i / 2, j / 3);
      const c0 = new PIXI.Point(i / 2, (j * 2) / 3);
      const d0 = new PIXI.Point(i, j);
      const graphics = new PIXI.Graphics();
      this.drawCurvedLine(
        new PIXI.Point(),
        b0,
        c0,
        d0,
        graphics,
        new PIXI.Point(),
      );
      this.geometryCache[i][j] = graphics.geometry;
    }

    return this.geometryCache[i][j];
  }

  createGraphics(a: PIXI.Point, d: PIXI.Point) {
    const graphics = new PIXI.Graphics(this.getGeometry(a, d));
    graphics.position.set(a.x, a.y);
    const x = d.x - a.x;
    const y = d.y - a.y;
    graphics.scale.set(
      x === 0 ? 1 : x / Math.abs(x),
      y === 0 ? 1 : y / Math.abs(y),
    );
    return graphics;
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
    d: AudionPanel.Point,
    graphics: PIXI.Graphics,
    pointOnLine: AudionPanel.Point,
  ) {
    const lineCoeffs = buildLineCoefficients(a, b, c, d, LINE_COEFF);

    const lineMagnitudeEstimate = Math.hypot(a.y - d.y, a.x - d.x);
    const steps = Math.max(2, Math.ceil(lineMagnitudeEstimate * STEP_RATIO));

    graphics.lineStyle(2, GraphColor.INPUT_OUTPUT);

    graphics.moveTo(a.x, a.y);
    for (let i = 1; i < steps; i++) {
      interpolateCoefficients(lineCoeffs, i / steps, pointOnLine);
      graphics.lineTo(pointOnLine.x, pointOnLine.y);
    }
    graphics.lineStyle(0);
    graphics.closePath();
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
  return {ax: 0, ay: 0, bx: 0, by: 0, cx: 0, cy: 0, dx: 0, dy: 0};
}

/**
 * Interpolate a line from 4 points: a, b, c, d.
 * @param a
 * @param b
 * @param c
 * @param d
 * @param coeff
 * @return
 */
function buildLineCoefficients(
  a: AudionPanel.Point,
  b: AudionPanel.Point,
  c: AudionPanel.Point,
  d: AudionPanel.Point,
  coeff = createLineCoefficients(),
): LineCoefficients {
  const {x: ax, y: ay} = a;
  const {x: bx, y: by} = b;
  const {x: cx, y: cy} = c;
  const {x: dx, y: dy} = d;

  coeff.ax = dx - 3 * cx + 3 * bx - ax;
  coeff.ay = dy - 3 * cy + 3 * by - ay;
  coeff.bx = 3 * cx - 6 * bx + 3 * ax;
  coeff.by = 3 * cy - 6 * by + 3 * ay;
  coeff.cx = 3 * bx - 3 * ax;
  coeff.cy = 3 * by - 3 * ay;
  coeff.dx = ax;
  coeff.dy = ay;

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
  const t2 = t * t;
  const t3 = t2 * t;
  destination.x = coeff.ax * t3 + coeff.bx * t2 + coeff.cx * t + coeff.dx;
  destination.y = coeff.ay * t3 + coeff.by * t2 + coeff.cy * t + coeff.dy;
  return destination;
}
