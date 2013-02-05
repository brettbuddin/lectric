/*!
 * Autoplay for Lectric
 * Copyright 2013 Stu Kabakoff
 * Licensed under the MIT license.
 */
(function( factory ) {
  //AMD
  if(typeof define === 'function' && define.amd) {
    define([], factory);

  //NODE
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory();

  //GLOBAL
  } else {
    window.lectricAutoplay = factory();
  }
})(function() {

  var exports = {};

  exports.extend = function( slider, defaultDuration, byPageNotSlide ) {
    
    var timer;

    var nextFn = 'next';
    if (byPageNotSlide) {
      nextFn = 'nextPage';
    }

    slider.on('animationEnd.lectric', function() {
      if (timer) {
        clearTimeout(timer);
        var duration = slider.getSlideData('duration') || defaultDuration;
        timer = setTimeout( advance, duration );
      }
    });

    function advance() {
      slider[nextFn]();
    }

    slider.start = function( startRightNow ) {
      if (timer) { return }
      if (startRightNow) {
        advance();
      } else {
        timer = setTimeout( advance, slider.getSlideData('duration') || defaultDuration );
      }
    };

    slider.stop = function() {
      clearTimeout( timer );
      timer = null;
    };
  };

  return exports;
});
