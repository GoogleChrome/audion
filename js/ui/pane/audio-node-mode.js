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

  /**
   * A mapping from key to container of widgets.
   * @private {!Object.<string, !Element>}
   */
  this.keyToContainer_ = {};

  /**
   * The container for all content related to properties.
   * @private {!Element}
   */
  this.propertyContentContainer_ = document.createElement('div');
  this.getDom().appendChild(this.propertyContentContainer_);

  this.renderPropertyContent_(message);
};
goog.inherits(audion.ui.pane.AudioNodeMode, audion.ui.pane.Mode);


/**
 * Renders information on properties.
 * @param {!AudionAudioNodePropertiesUpdateMessage} message An AudioNode
 *     properties message update we can use to fill in fields for the mode.
 * @private
 */
audion.ui.pane.AudioNodeMode.prototype.renderPropertyContent_ = function(
    message) {
  // Empty all content. We're re-rendering.
  while (this.propertyContentContainer_.firstChild) {
    this.propertyContentContainer_.removeChild(
        this.propertyContentContainer_.firstChild);
  }

  this.propertyToWidgetMapping_ = {};
  this.keyToContainer_ = {};

  // Group property values by type. Lets present them to the user by category.
  var audioParamWidgets = [];
  var readOnlyPropertyWidgets = [];
  var modifiablePropertyWidgets = [];
  var bufferWidgets = [];

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
      case audion.messaging.NodePropertyType.MUTABLE_BOOLEAN:
      case audion.messaging.NodePropertyType.MUTABLE_NUMBER:
      case audion.messaging.NodePropertyType.MUTABLE_OBJECT:
      case audion.messaging.NodePropertyType.ENUM:
        modifiablePropertyWidgets.push(widget);
        break;
      case audion.messaging.NodePropertyType.BUFFER_MUTABLE_NUMBER:
      case audion.messaging.NodePropertyType.BUFFER_READ_ONLY:
        bufferWidgets.push(widget);
        break;
    }
  }

  // Render the property value data.
  if (audioParamWidgets.length) {
    // Only include the AudioParams section if AudioParams exist.
    this.renderCategoryOfWidgets_(
        this.propertyContentContainer_,
        'AudioParams',
        'audioParams',
        audioParamWidgets);
  }
  this.renderCategoryOfWidgets_(
      this.propertyContentContainer_,
      'Read-only',
      'readOnly',
      readOnlyPropertyWidgets);
  this.renderCategoryOfWidgets_(
      this.propertyContentContainer_,
      'Mutable',
      'mutable',
      modifiablePropertyWidgets);
  if (bufferWidgets.length) {
    this.renderCategoryOfWidgets_(
        this.propertyContentContainer_,
        'AudioBuffer',
        'audioBuffer',
        bufferWidgets);
  }
};


/**
 * Renders a category of widgets.
 * @param {!Element} container The container to append sections to.
 * @param {string} title The title of the category of widgets.
 * @param {string} categoryKey A key used to refer to the container of widgets.
 * @param {!Array.<!audion.ui.pane.AudioPropertyWidget>} widgets The widgets to
 *     render.
 * @private
 */
audion.ui.pane.AudioNodeMode.prototype.renderCategoryOfWidgets_ = function(
    container, title, categoryKey, widgets) {
  var subContainer = document.createElement('div');
  container.appendChild(subContainer);
  // Keep a reference to this container.
  this.keyToContainer_[categoryKey] = subContainer;

  var titleElement = document.createElement('h4');
  titleElement.classList.add(goog.getCssName('propertyValueCategoryTitle'));
  titleElement.textContent = title;
  subContainer.appendChild(titleElement);

  for (var i = 0; i < widgets.length; i++) {
    var widgetRow = document.createElement('div');
    widgetRow.classList.add(goog.getCssName('widgetRow'));
    subContainer.appendChild(widgetRow);

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
      // Odd. We don't recognize this property. Something changed. Perhaps the
      // node has a new AudioBuffer. Re-render the pane to make sure we have the
      // right widgets rendered.
      this.renderPropertyContent_(message);
      return;
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

