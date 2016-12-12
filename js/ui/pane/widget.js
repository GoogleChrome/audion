goog.provide('audion.ui.Widget');


/** 
 * The base class for a UI widget that could be inserted somewhere.
 * @param {!Element} rootElement The root element of the widget.
 * @constructor
 */
audion.ui.Widget = function(rootElement) {
  /** @private {!Element} */
  this.rootElement_ = rootElement;
};


/**
 * @return {!Element} The root DOM of the widget. Append this to a container.
 */
audion.ui.Widget.prototype.getDom = function() {
  return this.rootElement_;
};
