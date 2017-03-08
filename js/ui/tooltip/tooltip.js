/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('audion.ui.tooltip.Tooltip');


goog.require('audion.ui.Widget');



/**
 * A tooltip that appears when the user hovers over various UI elements such as
 * AudioParam ports.
 * @constructor
 * @extends {audion.ui.Widget}
 */
audion.ui.tooltip.Tooltip = function() {
  /**
   * Whether the tooltip is shown.
   * @private {boolean}
   */
  this.shown_ = false;

  // Create the root element of the tooltip.
  var dom = document.createElement('div');
  dom.setAttribute('id', 'tooltip');
  audion.ui.tooltip.Tooltip.base(this, 'constructor', dom);
};
goog.inherits(audion.ui.tooltip.Tooltip, audion.ui.Widget);


/**
 * Sets the position of the tooltip.
 * @param {number} x
 * @param {number} y
 */
audion.ui.tooltip.Tooltip.prototype.setPosition = function(x, y) {
  this.getDom().style.left = x + 'px';
  this.getDom().style.top = y + 'px';
};


/**
 * @return {number} The width of the tooltip.
 */
audion.ui.tooltip.Tooltip.prototype.getWidth = function() {
  return this.getDom().offsetWidth;
};


/**
 * @return {number} The height of the tooltip.
 */
audion.ui.tooltip.Tooltip.prototype.getHeight = function() {
  return this.getDom().offsetHeight;
};


/**
 * Sets the text of the tooltip. Can be called while hidden.
 * @param {string} text
 */
audion.ui.tooltip.Tooltip.prototype.setText = function(text) {
  this.getDom().textContent = text;
};


/**
 * Sets whether the tooltip is shown.
 * @param {boolean} shown
 */
audion.ui.tooltip.Tooltip.prototype.setShown = function(shown) {
  if (shown == this.shown_) {
    // Nothing to do.
    return;
  }

  this.shown_ = shown;
  this.getDom().classList.toggle(goog.getCssName('shown'), shown);
};
