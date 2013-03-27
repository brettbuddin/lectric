/*!
 * Autoplay for frankenslide
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
    window.frankenslideAutoplay = factory();
  }
})(function() {

  var exports = {};

  exports.extend = function( slider, defaultDuration, byPageNotSlide ) {
    
    var timer;
    defaultDuration = defaultDuration || 12000;

    var nextFn = 'next';
    if (byPageNotSlide) {
      nextFn = 'nextPage';
    }

    function stopTimer() {
      if (timer) {
        clearTimeout(timer);
      }
    }
    function restartTimer() {
      if (timer) {
        clearTimeout(timer);
        var duration = slider.getSlideData('duration') || defaultDuration;
        timer = setTimeout( advance, duration );
      }
    }

    slider.on('start', stopTimer); // touchstart

    slider.on('move', restartTimer); // slideshow switches slides
    slider.on('endNoSlide', restartTimer); //touchend without slide. move will catch it otherwise.
    
    function advance() {
      slider[nextFn]();
      slider.element.trigger('autoAdvance.frankenslide');
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
