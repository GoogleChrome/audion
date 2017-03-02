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
goog.provide('audion.ui.pane.Pane');

goog.require('audion.ui.Widget');



/**
 * A pane that could unveil more information on say something that the user is
 * inspecting.
 * @constructor
 * @extends {audion.ui.Widget}
 */
audion.ui.pane.Pane = function() {
  /**
   * The current mode of rendering for the pane. For instance, the pane could
   * currently be showing information on an AudioNode being inspected. Null if 
   * none (and thus the pane is hidden).
   * @private {?audion.ui.pane.Mode}
   */
  this.mode_ = null;

  var dom = document.createElement('div');
  dom.id = goog.getCssName('paneContainer');
  audion.ui.pane.Pane.base(this, 'constructor', dom);

  // Initially hide the pane.
  dom.classList.add(audion.ui.pane.Pane.hiddenPaneClass_);

  // The X button for closing the pane.
  var xButton = document.createElement('div');
  xButton.innerHTML = '&#x2715;';
  xButton.classList.add(goog.getCssName('xButton'));

  var self = this;
  xButton.addEventListener('click', function() {
    // Hide the pane upon the X being clicked.
    self.setMode(null);
  });

  // Add the button to the DOM.
  dom.appendChild(xButton);

  /**
   * The DOM that contains the content for various modes of display.
   * @private {!Element}
   */
  this.contentArea_ = document.createElement('div');
  this.contentArea_.classList.add(goog.getCssName('contentArea'));
  dom.appendChild(this.contentArea_);
};
goog.inherits(audion.ui.pane.Pane, audion.ui.Widget);


/**
 * The class assigned to the pane to hide it.
 * @private @const {string}
 */
audion.ui.pane.Pane.hiddenPaneClass_ = goog.getCssName('hiddenPane');


/**
 * Sets the current mode. Shows the pane if the mode is non-null and the pane is
 * not already being shown. If null, hides the pane if it is not already hidden.
 * @param {?audion.ui.pane.Mode} mode 
 */
audion.ui.pane.Pane.prototype.setMode = function(mode) {
  if (this.mode_) {
    // Clean up the previous mode.
    this.mode_.cleanUp();
  }

  this.clearContentArea_();

  // Set the new mode, and show the pane.
  this.mode_ = mode;
  var dom = this.getDom();
  if (this.mode_) {
    // Init the new mode.
    this.contentArea_.appendChild(this.mode_.getDom());
    // Show the pane.
    dom.classList.remove(audion.ui.pane.Pane.hiddenPaneClass_);
  } else {
    // Hide the pane. Clear its contents.
    dom.classList.add(audion.ui.pane.Pane.hiddenPaneClass_);
    this.clearContentArea_();
  }
};


/**
 * Clears the content area.
 * @private
 */
audion.ui.pane.Pane.prototype.clearContentArea_ = function() {
  while (this.contentArea_.firstChild) {
    this.contentArea_.removeChild(this.contentArea_.firstChild);
  }
};


/**
 * @return {?audion.ui.pane.Mode} The current mode for displaying the pane. Or
 *     null if none.
 */
audion.ui.pane.Pane.prototype.getMode = function() {
  return this.mode_;
};

