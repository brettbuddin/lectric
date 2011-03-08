/*!
 * Lectric
 * http://github.com/mckinney/lectric
 *
 * Copyright 2011, McKinney
 * Licensed under the MIT license.
 * http://github.com/mckinney/lectric/blob/master/LICENSE
 *
 * Author: Brett C. Buddin (http://github.com/brettbuddin)
 */

(function(window) {
  var ua = navigator.userAgent.toLowerCase();
  isWebkit = !!ua.match(/applewebkit/i);
  var supportsTouch = false;
  try {
    document.createEvent("TouchEvent");
    supportsTouch = true;
  } catch (e) {}

  var cssWithoutUnit = function(element, attribute) {
    var measure = element.css(attribute);
    return (measure !== undefined) ? parseInt(measure.replace('px', ''), 10) : 0;
  };
