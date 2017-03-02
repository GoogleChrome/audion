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

