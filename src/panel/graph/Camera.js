import {Rectangle} from '@pixi/math';

import {Observer} from '../../utils/Observer';
import {trunc, clamp} from '../../utils/math';

const MIN_ZOOM = 0.5;

/**
 * Camera.
 */
export class Camera {
  /** Create a Camera. */
  constructor() {
    /** Area that can be viewed. */
    this.bounds = new Rectangle(-50, -50, 100, 100);
    this.screen = new Rectangle();
    this.viewport = new Rectangle(-50, -50, 1, 1);
    /** @type {Observer<Rectangle>} */
    this.viewportObserver = new Observer((onNext) => {
      this.update = () => {
        onNext(this.viewport);
      };
      return () => {};
    });
  }
  /** Update. */
  update() {}
  /**
   * Move the viewport.
   * @param {number} dx
   * @param {number} dy
   */
  move(dx, dy) {
    const zoomFactor = this.viewport.width;
    const {x, y} = this.viewport;
    this.viewport.x = trunc(
      clamp(
        x + dx * zoomFactor,
        this.bounds.x,
        Math.max(
          this.bounds.x,
          this.bounds.x + this.bounds.width - this.screen.width * zoomFactor,
        ),
      ),
      -2,
    );
    this.viewport.y = trunc(
      clamp(
        y + dy * zoomFactor,
        this.bounds.y,
        Math.max(
          this.bounds.y,
          this.bounds.y + this.bounds.height - this.screen.height * zoomFactor,
        ),
      ),
      -2,
    );
    this.update();
  }
  /**
   * Zoom in or out by `delta`.
   * @param {number} screenX
   * @param {number} screenY
   * @param {number} zoomDelta
   */
  zoom(screenX, screenY, zoomDelta) {
    const maxScaleX = this.bounds.width / this.screen.width;
    const maxScaleY = this.bounds.height / this.screen.height;
    const maxScale = Math.max(1, maxScaleX, maxScaleY);
    const zoomFactor = this.viewport.width;
    const newZoom = trunc(
      clamp(zoomFactor + zoomDelta, MIN_ZOOM, maxScale),
      -2,
    );
    const {x, y} = this.viewport;
    this.viewport.x = trunc(
      clamp(
        x + screenX * (zoomFactor - newZoom),
        this.bounds.x,
        Math.max(
          this.bounds.x,
          this.bounds.x + this.bounds.width - this.screen.width * newZoom,
        ),
      ),
      -2,
    );
    this.viewport.y = trunc(
      clamp(
        y + screenY * (zoomFactor - newZoom),
        this.bounds.y,
        Math.max(
          this.bounds.y,
          this.bounds.y + this.bounds.height - this.screen.height * newZoom,
        ),
      ),
      -2,
    );
    this.viewport.width = newZoom;
    this.viewport.height = newZoom;
    this.update();
  }
  /**
   * Fit the viewport to the whole bounds.
   */
  fitToScreen() {
    this.zoom(0, 0, Infinity);
  }
  /**
   * Set graph bounds with and height.
   * @param {number} width
   * @param {number} height
   */
  setGraphSize(width, height) {
    this.bounds.x = -50;
    this.bounds.y = -50;
    this.bounds.width = width + 100;
    this.bounds.height = height + 100;
  }
  /**
   * Set screen size.
   * @param {number} width
   * @param {number} height
   */
  setScreenSize(width, height) {
    this.screen.width = width;
    this.screen.height = height;
  }
}
