import {Rectangle} from '@pixi/math';
import {Observer} from '../utils/Observer';
import {trunc, clamp} from './math';

/**
 * Camera.
 */
export class Camera {
  /** Create a Camera. */
  constructor() {
    /** Area that can be viewed. */
    this.bounds = new Rectangle();
    this.screen = new Rectangle();
    this.viewport = new Rectangle(0, 0, 1, 1);
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
        0,
        Math.max(0, this.bounds.width - this.screen.width),
      ),
      -2,
    );
    this.viewport.y = trunc(
      clamp(
        y + dy * zoomFactor,
        0,
        Math.max(0, this.bounds.height - this.screen.height),
      ),
      -2,
    );
    this.update();
  }
  /**
   * Zoom in or out by `delta`.
   * @param {number} delta
   */
  zoom(delta) {
    const maxScaleX = this.bounds.width / this.screen.width;
    const maxScaleY = this.bounds.height / this.screen.height;
    const maxScale = Math.max(1, maxScaleX, maxScaleY);
    const zoomFactor = this.viewport.width;
    const newZoom = trunc(clamp(zoomFactor + delta, 1, maxScale), -2);
    this.viewport.width = newZoom;
    this.viewport.height = newZoom;
    this.update();
  }
  /**
   * Set graph bounds with and height.
   * @param {number} width
   * @param {number} height
   */
  setGraphSize(width, height) {
    this.bounds.width = width;
    this.bounds.height = height;
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
