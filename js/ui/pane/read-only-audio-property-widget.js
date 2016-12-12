goog.provide('audion.ui.pane.ReadOnlyAudioPropertyWidget');

goog.require('audion.ui.pane.AudioPropertyWidget');



/**
 * A widget that visualizes the value of a read-only AudioNode property.
 * @param {string} propertyName
 * @param {!audion.ui.pane.AudioNodePropertyType} initialValue
 * @constructor
 * @extends {audion.ui.pane.AudioPropertyWidget}
 */
audion.ui.pane.ReadOnlyAudioPropertyWidget = function(
    propertyName, initialValue) {
  // Remember the name of the property.
  audion.ui.pane.ReadOnlyAudioPropertyWidget.base(
      this, 'constructor', propertyName);

  // Set the content of the container to the value. This value is read-only, so
  // we do not have to do anything fancy.
  this.getDom().textContent = initialValue;
};
goog.inherits(
    audion.ui.pane.ReadOnlyAudioPropertyWidget,
    audion.ui.pane.AudioPropertyWidget);


/** @override */
audion.ui.pane.ReadOnlyAudioPropertyWidget.prototype.updateToValue =
    function(value) {
  audion.ui.pane.ReadOnlyAudioPropertyWidget.base(this, 'updateToValue', value);
  this.getDom().textContent = value;
};