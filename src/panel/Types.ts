/** @namespace AudionPanel */

/**
 * @typedef AudionPanel.Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef AudionPanel.Node
 * @property {AudionPanel.Point} position
 * @property {AudionPanel.Point} size
 */

/**
 * @typedef AudionPanel.Port
 * @property {AudionPanel.Node} node
 * @property {AudionPanel.Point} offset
 * @property {number} radius
 * @property {Array} edges
 */

export namespace AudionPanel {
  export interface Point {
    x: number;
    y: number;
  }

  export interface Node {
    position: Point;
    size: Point;
  }

  export interface Port {
    node: Node;
    offset: Point;
    radius: number;
    edges: any[];
  }
}
