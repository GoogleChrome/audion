goog.provide('audion.ui.pane.AudioNodeMode');

goog.require('audion.messaging.NodePropertyType');
goog.require('audion.ui.pane.Mode');
goog.require('audion.ui.pane.ModeType');
goog.require('audion.ui.pane.ReadOnlyAudioPropertyWidget');



/**
 * A mode that displays information on an AudioNode being inspected.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message An AudioNode
 *     properties message update we can use to fill in fields for the mode.
 * @constructor
 * @extends {audion.ui.pane.Mode}
 */
audion.ui.pane.AudioNodeMode = function(message) {
  // Tell the base class the type of mode this is. This should come first
  // because it also instantiates the root DOM container.
  audion.ui.pane.AudioNodeMode.base(
      this, 'constructor', audion.ui.pane.ModeType.AUDIO_NODE);

  /**
   * The latest AudionAudioNodePropertiesUpdateMessage used to populate fields
   * in the mode.
   * @private {!AudionAudioNodePropertiesUpdateMessage}
   */
  this.latestMessage_ = message;

  var title = document.createElement('h3');
  title.textContent = message.audioNodeType + ' ' + message.audioNodeId;
  this.getDom().appendChild(title);

  /**
   * A mapping from property name to the widget rendering its value.
   * @private {!Object.<string, !audion.ui.pane.AudioPropertyWidget>}
   */
  this.propertyToWidgetMapping_ = {};

  // Group property values by type. Lets present them to the user by category.
  var audioParamWidgets = [];
  var readOnlyPropertyWidgets = [];
  var modifiablePropertyWidgets = [];

  // Group group group.
  // TODO(chizeng): Use different widgets to render each property.
  var propertyValues = message.propertyValues;
  for (var i = 0; i < propertyValues.length; i++) {
    var widget = new audion.ui.pane.ReadOnlyAudioPropertyWidget(
        propertyValues[i].property, propertyValues[i].value);

    // Store the widget so that we can update its property value later.
    this.propertyToWidgetMapping_[propertyValues[i].property] = widget;

    switch (propertyValues[i].propertyType) {
      case audion.messaging.NodePropertyType.AUDIO_PARAM:
        audioParamWidgets.push(widget);
        break;
      case audion.messaging.NodePropertyType.READ_ONLY:
        readOnlyPropertyWidgets.push(widget);
        break;
      case audion.messaging.NodePropertyType.MUTABLE_NUMBER:
      case audion.messaging.NodePropertyType.ENUM:
        modifiablePropertyWidgets.push(widget);
        break;
    }
  }

  // Render the property value data.
  this.renderCategoryOfWidgets_(
      this.getDom(), 'AudioParams', audioParamWidgets);
  this.renderCategoryOfWidgets_(
      this.getDom(), 'Read-only', readOnlyPropertyWidgets);
  this.renderCategoryOfWidgets_(
      this.getDom(), 'Mutable', modifiablePropertyWidgets);
};
goog.inherits(audion.ui.pane.AudioNodeMode, audion.ui.pane.Mode);


/**
 * Renders a category of widgets.
 * @param {!Element} container The container to append sections to.
 * @param {string} title The title of the category of widgets.
 * @param {!Array.<!audion.ui.pane.AudioPropertyWidget>} widgets The widgets to
 *     render.
 * @private
 */
audion.ui.pane.AudioNodeMode.prototype.renderCategoryOfWidgets_ = function(
    container, title, widgets) {
  var titleElement = document.createElement('h4');
  titleElement.classList.add(goog.getCssName('propertyValueCategoryTitle'));
  titleElement.textContent = title;
  container.appendChild(titleElement);

  for (var i = 0; i < widgets.length; i++) {
    var widgetRow = document.createElement('div');
    widgetRow.classList.add(goog.getCssName('widgetRow'));
    container.appendChild(widgetRow);

    var widgetRowLeft = document.createElement('div');
    widgetRowLeft.classList.add(goog.getCssName('widgetRowLeft'));
    widgetRowLeft.textContent = widgets[i].getPropertyName();
    widgetRow.appendChild(widgetRowLeft);

    var widgetRowRight = document.createElement('div');
    widgetRowRight.appendChild(widgets[i].getDom());
    widgetRowRight.classList.add(goog.getCssName('widgetRowRight'));
    widgetRow.appendChild(widgetRowRight);
  }
};


/**
 * Updates the audio param values with a new message.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message A message containing
 *     updates of AudioNode property values.
 */
audion.ui.pane.AudioNodeMode.prototype.updateAudioProperties = function(
    message) {
  this.latestMessage_ = message;

  var propertyValues = message.propertyValues;
  for (var i = 0; i < propertyValues.length; i++) {
    var widget = this.propertyToWidgetMapping_[propertyValues[i].property];
    if (!widget) {
      // This property could not be found.
      continue;
    }

    // Have the widget update its value.
    widget.updateToValue(propertyValues[i].value);
  }
};


/**
 * @return {?number} The ID of the frame of the node currently being
 *     highlighted. Or none.
 */
audion.ui.pane.AudioNodeMode.prototype.getFrameId = function() {
  return this.latestMessage_.frameId;
};


/**
 * @return {?number} The ID of the AudioNode currently being highlighted. Or
 *     none.
 */
audion.ui.pane.AudioNodeMode.prototype.getAudioNodeId = function() {
  return this.latestMessage_.audioNodeId;
};
