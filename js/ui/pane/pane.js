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
  var classForHidden = goog.getCssName('hiddenPane');
  if (this.mode_) {
    // Init the new mode.
    this.contentArea_.appendChild(this.mode_.getDom());
    // Show the pane.
    dom.classList.remove(classForHidden);
  } else {
    // Hide the pane. Clear its contents.
    dom.classList.add(classForHidden);
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
