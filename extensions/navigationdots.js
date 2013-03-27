/*!
 * Navigation Dots for frankenslide
 * Copyright 2013 Stu Kabakoff
 * Licensed under the MIT license.
 */
(function( factory ) {
  //AMD
  if(typeof define === 'function' && define.amd) {
    define(['jquery'], factory);

  //NODE
  } else if(typeof module === 'object' && module.exports) {
    var $ = require('jquery');
    module.exports = factory($);

  //GLOBAL
  } else {
    window.NavigationDots = factory(jQuery);
  }
})(function($) {

  var defaultConfig = {
    useNumbers: false,
    activeClass: 'on',
    containerClass: 'nav-dots',
    elementType: 'a'
  };

  function NavigationDots( carousel ) {
  }

  NavigationDots.prototype.init = function( carousel, target, config ) {

    var self = this;

    config = $.extend({}, defaultConfig, config);

    var htmlStr;

    function renderDots() {
      var html = '';
      var contentStr = '';
      var dotCount = carousel.slideCount() - carousel.slidesPerPage() + 1;
      for( var i = 0; i < dotCount; i += 1 ) {
        if (config.useNumbers) {
          contentStr = i;
        }
        if (config.elementType === 'a') {
          html += '<a href="#">'+contentStr+'</a>';
        } else {
          html += '<'+config.elementType+'>'+contentStr+'</'+config.elementType+'>';
        }
      }
      return html;
    }

    if (config.elementType === 'li') {
      htmlStr = '<ul class="'+config.containerClass+'">';
    } else {
      htmlStr = '<div class="'+config.containerClass+'">';
    }
    
    htmlStr += renderDots();

    if (config.elementType === 'li') {
      htmlStr += '</ul>';
    } else {
      htmlStr += '</div>';
    }

    self.container = $(htmlStr);
    self.dots = self.container.children();

    $(target).append(self.container);

    self.container.on('click', config.elementType, function( event ) {
      event.preventDefault();
      var index = self.dots.index(event.target);
      carousel.to(index);
      carousel.element.trigger('navigationDotClick.frankenslide', [index]);
    });

    this.updateState = function() {
      self.dots.removeClass( config.activeClass );
      self.dots.eq(carousel.currentSlide).addClass( config.activeClass );
    };
    
    this.updateState();
    carousel.on('move', this.updateState);

    var currentWidth = carousel.target.width();
    var slidesPerPage = carousel.slidesPerPage();
    this.updateDotCount = function() {
      var newWidth = carousel.target.width();
      if (newWidth !== currentWidth) {
        var newSlidesPerPage = carousel.slidesPerPage();
        if (newSlidesPerPage !== slidesPerPage) {
          self.container.html(renderDots());
          self.dots = self.container.children();
          self.updateState();

          slidesPerPage = newSlidesPerPage;
        }
        currentWidth = newWidth;
      }
    }

    carousel.on('sizeChange', this.updateDotCount);
  };

  return NavigationDots;

});
