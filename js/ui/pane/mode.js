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
goog.provide('audion.ui.pane.Mode');

goog.require('audion.ui.Widget');



/**
 * A mode that specifies how to show content in the pane. For instance, a mode
 * could specify how to show info on an AudioNode.
 * @param {!audion.ui.pane.ModeType} modeType The type of the mode.
 * @constructor
 * @extends {audion.ui.Widget}
 */
audion.ui.pane.Mode = function(modeType) {
  var dom = document.createElement('div');
  audion.ui.pane.Mode.base(this, 'constructor', dom);
  
  /**
   * The type of the mode. What the mode does, basically.
   * @private {!audion.ui.pane.ModeType}
   */
  this.modeType_ = modeType;

  /**
   * A function to be called right before the mode is cleaned up.
   * @private {?Function}
   */
  this.cleanUpCallback_ = null;
};
goog.inherits(audion.ui.pane.Mode, audion.ui.Widget);


/**
 * @return {!audion.ui.pane.ModeType} The type of the mode. What the node does.
 */
audion.ui.pane.Mode.prototype.getType = function() {
  return this.modeType_;
};


/**
 * Cleans up after this mode is to be GC-ed. To be called once. Note that we
 * could have used goog.Disposable, but we wanted to keep the binary size very
 * small, and goog.Disposable pulls in some code.
 */
audion.ui.pane.Mode.prototype.cleanUp = function() {
  if (this.cleanUpCallback_) {
    this.cleanUpCallback_();
    this.cleanUpCallback_ = null;
  }
};


/**
 * Sets a callback to be run once right before the mode is cleaned up.
 * @param {!Function} callback
 */
audion.ui.pane.Mode.prototype.setCleanUpCallback = function(callback) {
  this.cleanUpCallback_ = callback;
};

