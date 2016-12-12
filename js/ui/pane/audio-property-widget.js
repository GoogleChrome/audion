goog.provide('audion.ui.pane.AudioNodePropertyType');
goog.provide('audion.ui.pane.AudioPropertyWidget');

goog.require('audion.ui.Widget');


/**
 * The types that an AudioNode property can take on.
 * @typedef {number|string}
 */
audion.ui.pane.AudioNodePropertyType;



/**
 * A widget that visualizes the value of an AudioNode property and might even
 * allow for changing it.
 * @param {string} propertyName The name of the property.
 * @constructor
 * @extends {audion.ui.Widget}
 */
audion.ui.pane.AudioPropertyWidget = function(propertyName) {
  /**
   * The name of the property.
   * @private {string}
   */
  this.propertyName_ = propertyName;

  var dom = document.createElement('div');
  dom.classList.add(goog.getCssName('audioPropertyWidget'));
  audion.ui.pane.AudioPropertyWidget.base(this, 'constructor', dom);
};
goog.inherits(audion.ui.pane.AudioPropertyWidget, audion.ui.Widget);


/**
 * Updates the property to a new value.
 * @param {!audion.ui.pane.AudioNodePropertyType} value
 */
audion.ui.pane.AudioPropertyWidget.prototype.updateToValue = function(value) {};


/**
 * @return {string} The name of the property.
 */
audion.ui.pane.AudioPropertyWidget.prototype.getPropertyName = function() {
  return this.propertyName_;
};
