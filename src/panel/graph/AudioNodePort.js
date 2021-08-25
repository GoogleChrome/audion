/// <reference path="../Types.js" />

/**
 * Port.
 */
export class AudioNodePort {
  /**
   * Create a port.
   * @param {object} options
   * @param {AudionPanel.Node} options.node
   * @param {AudionPanel.Point} options.point
   * @param {number} options.radius
   * @param {number} options.color
   */
  constructor({node, point, radius, color}) {
    /** @type {AudionPanel.Node} */
    this.node = node;
    /** @type {AudionPanel.Point} */
    this.offset = point;
    /** @type {number} */
    this.radius = radius;
    /** @type {number} */
    this.color = color;
    /** @type {Array} */
    this.edges = [];
  }

  /**
   * @param {*} graphics
   */
  draw(graphics) {
    graphics.lineStyle(3, this.color);
    graphics.beginFill(this.edges.length > 0 ? this.color : 0xffffff);
    graphics.drawCircle(this.offset.x, this.offset.y, this.radius);
    graphics.endFill();
  }
}
