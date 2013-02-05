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
    window.lectircAutoplay = factory();
  }
})(function() {

  var exports = {};

  exports.extend = function( slider, duration, byPageNotSlide ) {
    
    var timer;

    var nextFn = 'next';
    if (byPageNotSlide) {
      nextFn = 'nextPage';
    }

    function advance() {
      slider[nextFn]();
      timer = setTimeout( advance, duration )
    }

    slider.start = function( startRightNow ) {
      if (timer) { return }
      if (startRightNow) {
        advance();
      } else {
        setTimeout( advance, duration );
      }
    };

    slider.stop = function() {
      clearTimeout( timer );
      timer = null;
    };
  };

  return exports;
});
