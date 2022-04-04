import * as PIXI from 'pixi.js';
import {GraphColor} from './graphStyle';

const ARROW_LENGTH = 16;
const ARROW_HEIGHT = 8;

const ARROW_ANGLE_ROUNDING = 32;

export class EdgeArrowGraphics {
  geometryCache = new Array(ARROW_ANGLE_ROUNDING * 2 + 1).fill(null);

  drawFromPoint(
    pointOnLine: PIXI.Point,
    end: PIXI.Point,
    graphics: PIXI.Graphics,
  ) {
    const arrowMagnitude = Math.hypot(
      pointOnLine.y - end.y,
      pointOnLine.x - end.x,
    );
    const arrowUnitX = (pointOnLine.x - end.x) / arrowMagnitude;
    const arrowUnitY = (pointOnLine.y - end.y) / arrowMagnitude;

    this.drawFromUnit(arrowUnitX, arrowUnitY, end, graphics);
  }

  drawFromUnit(
    arrowUnitX: number,
    arrowUnitY: number,
    end: PIXI.Point,
    graphics: PIXI.Graphics,
  ) {
    graphics.beginFill(GraphColor.INPUT_OUTPUT);
    graphics.drawPolygon([
      new PIXI.Point(
        end.x + arrowUnitX * ARROW_LENGTH + arrowUnitY * ARROW_HEIGHT,
        end.y + arrowUnitY * ARROW_LENGTH - arrowUnitX * ARROW_HEIGHT,
      ),
      new PIXI.Point(
        end.x + arrowUnitX * ARROW_LENGTH - arrowUnitY * ARROW_HEIGHT,
        end.y + arrowUnitY * ARROW_LENGTH + arrowUnitX * ARROW_HEIGHT,
      ),
      new PIXI.Point(end.x, end.y),
    ]);
    graphics.endFill();
  }

  getGeometry(pointOnLine: PIXI.Point, end: PIXI.Point) {
    const magnitude = Math.hypot(pointOnLine.x - end.x, pointOnLine.y - end.y);
    const unitX = (pointOnLine.x - end.x) / magnitude;
    const unitY = (pointOnLine.y - end.y) / magnitude;
    const angle = Math.atan2(unitY, unitX);
    const angleSliceIndex = Math.round(
      (angle / Math.PI) * ARROW_ANGLE_ROUNDING,
    );
    const cacheIndex = angleSliceIndex + ARROW_ANGLE_ROUNDING;
    if (this.geometryCache[cacheIndex] === null) {
      const graphics = new PIXI.Graphics();
      const angleRounded = (angleSliceIndex / ARROW_ANGLE_ROUNDING) * Math.PI;
      this.drawFromUnit(
        Math.cos(angleRounded),
        Math.sin(angleRounded),
        new PIXI.Point(Math.cos(angleRounded) * 4, Math.sin(angleRounded) * 4),
        graphics,
      );
      this.geometryCache[cacheIndex] = graphics.geometry;
    }
    return this.geometryCache[cacheIndex];
  }

  createGraphics(pointOnLine: PIXI.Point, end: PIXI.Point) {
    const graphics = new PIXI.Graphics(this.getGeometry(pointOnLine, end));
    graphics.position.set(end.x, end.y);
    return graphics;
  }
}
