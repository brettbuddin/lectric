/*!
 * Autoplay for frankenslide
 * Copyright 2013 Stu Kabakoff
 * Licensed under the MIT license.
 */
(function( factory ) {
  //AMD
  if(typeof define === 'function' && define.amd) {
    define(['jquery'], factory);

  //NODE
  } else if(typeof module === 'object' && module.exports) {
    var jquery = require('jquery');
    module.exports = factory(jquery);

  //GLOBAL
  } else {
    window.frankenslideXofY = factory(jQuery);
  }
})(function($) {

  function XofY() {
    var self = this;

    this.update = function() {
      var slideIndex = self.slider.currentSlide+1;
      var totalSlides = self.slider.slideCount();
      var newText = self.beforeText+' '+slideIndex+' '+self.of+' '+totalSlides+' '+self.afterText;
      self.$container.html( $.trim(newText) );
    }
  }

  XofY.prototype = {
    of: 'of',
    beforeText: '',
    afterText: '',
    init: function( container, slider ) {
      this.$container = $(container);
      this.slider = slider;

      slider.on('animationEnd', this.update);
      this.update()
    }
  };

  return XofY;
});
