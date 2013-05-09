/*!
 * lectric v0.4.5
 * http://github.com/brettbuddin/lectric
 *
 * Copyright 2011, Brett C. Buddin
 * Licensed under the MIT license.
 * http://github.com/brettbuddin/lectric/blob/master/LICENSE
 *
 * Author: Brett C. Buddin (http://github.com/brettbuddin)
 *
 * Renamed Frankenslide and modifications copyright 2013 by Stu Kabakoff
 *
 */
(function(factory) {
  //AMD
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);

    //NODE
  } else if (typeof module === 'object' && module.exports) {
    var $ = require('jquery');
    module.exports = factory($);

    //GLOBAL
  } else {
    window.Frankenslide = factory(jQuery);
  }
})(function($) {
  var ua = navigator.userAgent.toLowerCase();
  var isWebkit = !! ua.match(/applewebkit/i);
  var supportsTouch = "ontouchmove" in window;

  var cssWithoutUnit = function(element, attribute) {
    var measure = element.css(attribute);
    var val = (typeof measure === 'string') ? parseInt(measure.replace('px', ''), 10) : 0;
    return val || 0;
  };

  var Position = function(x, y) {
    if (x && x.hasOwnProperty('x') && x.hasOwnProperty('y')) {
      x = x.x;
      y = x.y;
    }
    this.x = x;
    this.y = y;
  };
  Position.prototype = {
    difference: function(p) {
      return new Position(p.x - this.x, p.y - this.y);
    }
  };



  var Frankenslide = function() {
    if (supportsTouch && isWebkit) {
      return new TouchSlider();
    } else {
      return new BaseSlider();
    }
  };

  var BaseSlider = function() {};

  // Initialize the BaseSlider.
  //
  // text - The String CSS selector of the slider container.
  // opts - The Map of extra parameters.
  // 
  // Returns nothing.
  BaseSlider.prototype.init = function(target, opts) {
    this.opts = $.extend({
      reverse: false,
      next: undefined,
      previous: undefined,
      nextPage: undefined,
      previousPage: undefined,
      element: undefined,
      itemWrapperClassName: 'items',
      itemSelector: '.item',
      snapToNearest: false,
      loop: false,
      limitLeft: false,
      limitRight: false,
      animateEasing: 'swing',
      animateDuration: $.fx.speeds._default,
      hooks: {}
    }, opts);

    this.currentSlide = 0;
    this.slideWidth = undefined;
    this.width = undefined;
    this.position = new Position(0, 0);
    this.startPosition = new Position(this.position);
    this.lastPosition = new Position(this.position);

    if (this.opts.itemClassName) {
      this.opts.itemSelector = '.' + this.opts.itemClassName;
    }
    var itemWrapperSelector = '.' + this.opts.itemWrapperClassName;

    this.target = $(target);
    this.target.css('overflow', 'hidden');

    // Set up the styling of the slider
    var element;
    if (!this.opts.element) {
      element = $('<div/>', {
        'class': this.opts.itemWrapperClassName
      });
      element.css({
        position: 'relative'
      });

      this.target.find(this.opts.itemSelector).css('float', 'left').wrapAll(element);
      this.target.addClass('frankenslide-slider');
      this.element = this.target.find(itemWrapperSelector);

    } else {
      this.element = element = $(this.opts.element);
      element.css({position: 'relative'});
      element.addClass(this.opts.itemWrapperClassName);
    }



    this.element.itemSelector = this.opts.itemSelector;
    this.element.itemWrapperSelector = itemWrapperSelector;

    var self = this;

    var type = supportsTouch ? 'touchstart' : 'click';
    $(this.opts.next).on(type, function(e) {
      e.preventDefault();
      self.next();
      self.element.trigger('nextClick.frankenslide');
    });

    $(this.opts.previous).on(type, function(e) {
      e.preventDefault();
      self.previous();
      self.element.trigger('previousClick.frankenslide');
    });
    $(this.opts.nextPage).on(type, function(e) {
      e.preventDefault();
      self.nextPage();
      self.element.trigger('nextPageClick.frankenslide');
    });

    $(this.opts.previousPage).on(type, function(e) {
      e.preventDefault();
      self.previousPage();
      self.element.trigger('previousPageClick.frankenslide');
    });

    // Keep clicks from doing what they do if
    // we support touch on this device
    if (supportsTouch) {
      $(this.opts.next).click(function(e) {
        e.preventDefault();
      });

      $(this.opts.previous).click(function(e) {
        e.preventDefault();
      });
    }

    // Bind callbacks passed in at initialization
    $.each(this.opts.hooks, function(name, fn) {
      if ($.isArray(fn)) {
        $.each(fn, function(fn2) {
          self.on(name, fn2);
        });
      } else {
        self.on(name, fn);
      }
    });

    //this.width = this.target.width();

    this.recalculateWidth = function() {
      var newWidth = self.target.width();
      if (self.width !== newWidth) {
        self.width = newWidth;
        self.calculateSlideWidth();
        self.element.css({'width': (self.slideWidth+10) * self.slideCount() }); // add a little for borders and margin
        self.position.x = self.xForSlide(self.currentSlide);
        self.update({animate: false, triggerSlide: false});
        self.element.trigger('sizeChange.frankenslide');
      }
    };
    this.recalculateWidth();
    $(window).resize(this.recalculateWidth);
    //this.calculateSlideWidth();
    this.lazyLoadNextFrame();
    this.element.trigger('init.frankenslide');
  };

  // Update the current position of the slider.
  //
  // opts - The Map of extra parameters:
  //        animate - Boolean of whether or not to animate between two states.
  //        triggerSlide - Boolean of whether or not to trigger the move hook.
  // 
  // Returns nothing.
  BaseSlider.prototype.update = function(opts) {
    var options = $.extend({animate: true, triggerSlide: true}, opts);

    var self = this;
    var after = function() {
      if (options.triggerSlide && options.animate) {
        self.element.trigger('animationEnd.frankenslide');
      }
      self.lazyLoadNextFrame();
      $(this).dequeue();
    };

    if (options.animate) {
      this.element.animate({left: this.position.x + 'px'}, 
      this.opts.animateDuration,
                           this.opts.animateEasing
      ).queue(after);
    } else {
      this.element.css({left: this.position.x + 'px'}).queue(after);
    }

    if (options.triggerSlide) {
    	this.element.trigger('move.frankenslide'); }
  };


  // Subscribe a callback function to a hook.
  //
  // name - The String name of the hook.
  // fn - The Function callback to execute when the hook is triggered.
  // 
  // Returns the Function callback that was bound to the hook.
  BaseSlider.prototype.on = function(name, fn) {
    var self = this;
    var callback = function(e) {
      if (e.target == self.element[0]) {
        var args = Array.prototype.slice.apply(arguments);
        fn.apply(null, [self].concat(args));
      }
    };

    this.element.on(name + '.frankenslide', callback);
    return callback;
  };
  BaseSlider.prototype.bind = function(name, fn) {
    this.on(name, fn);
  };

  // Unsubscribe a callback function from a hook or unsubscribe all callbacks from a hook.
  //
  // name - The String name of the hook.
  // fn - The Function handler to unbind from the element.
  // 
  // Returns nothing.
  BaseSlider.prototype.off = function(name, fn) {
    if (typeof fn !== undefined && $.isFunction(fn)) {
      this.element.off(name + '.frankenslide', fn);
    } else {
      this.element.off(name + '.frankenslide');
    }
  };
  BaseSlider.prototype.unbind = function(name, fn) {
    this.off(name, fn);
  };

  // Move to a specific slide number.
  //
  // slide - The Integer slide number to move to.
  // 
  // Returns nothing.
  BaseSlider.prototype.to = function(slide, options) {
    this.lastPosition.x = this.position.x;
    this.lastPosition.y = this.position.y;

    var slideCount = this.slideCount();
    var previous = this.position.x;

    if (this.opts.loop) {
      slide = Math.abs((slide + slideCount) % slideCount);
    }
    this.currentSlide = Math.min(Math.max(slide, 0), slideCount - this.slidesPerPage());
    this.position.x = this.limitXBounds(this.xForSlide(slide));
    if (this.position.x !== previous) {
      this.update(options);
    }
  };

  // Advance by one slide.
  //
  // Returns nothing.
  BaseSlider.prototype.next = function() {
    this.to(this.currentSlide + 1);
    this.element.trigger('nextButton.frankenslide');
  };

  // Advance by one page.
  //
  // Returns nothing.
  BaseSlider.prototype.nextPage = function() {
    var slidesPerPage = this.slidesPerPage();
    this.to(this.currentSlide + slidesPerPage);
    this.element.trigger('nextPageButton.frankenslide');
  };

  // Go back one slide.
  //
  // Returns nothing.
  BaseSlider.prototype.previous = function() {
    this.to(this.currentSlide - 1);
    this.element.trigger('previousButton.frankenslide');
  };
  // Go back one page.
  //
  // Returns nothing.
  BaseSlider.prototype.previousPage = function() {
    var slidesPerPage = this.slidesPerPage();
    this.to(this.currentSlide - slidesPerPage);
    this.element.trigger('previousPageButton.frankenslide');
  };

  // Move to a specific item in the slider, regardless of its position.
  //
  // item - The DOM Reference of the item you'd like to move to.
  // 
  // Returns nothing.
  BaseSlider.prototype.toItem = function(item) {
    var all = this.element.find(this.element.itemSelector);

    var i;
    var length = all.length;
    for (i = 0; i < length; i++) {
      if ($(all[i])[0] == item[0]) { this.to(i); }
    }
  };

  // Retrieve the current X position.
  //
  // slide - The Integer slide number.
  // 
  // Returns the Integer X position of the slider.
  BaseSlider.prototype.xForSlide = function(slide) {
    var flip = (this.opts.reverse) ? 1 : -1;
    return flip * slide * this.slideWidth;
  };


  // Retrieve the number of slides per page.
  // 
  // Returns the Integer number of slides visibile in the viewport at any time.
  BaseSlider.prototype.slidesPerPage = function() {
    return Math.max(Math.floor(this.width / this.slideWidth), 1);
  };


  // Retrieve the width of a single item (including margin-right and padding).
  // 
  // Returns the Integer width of a single item.
  BaseSlider.prototype.calculateSlideWidth = function() {
    var first = this.element.find(this.element.itemSelector).eq(0);
    var padding = cssWithoutUnit(first, 'paddingRight') + cssWithoutUnit(first, 'paddingLeft');
    this.slideWidth = cssWithoutUnit(first, 'marginRight') + cssWithoutUnit(first, 'marginLeft') + padding + first.width();
  };

  // Retrieve number of items in the slider.
  // 
  // Returns the Integer number of items.
  BaseSlider.prototype.slideCount = function() {
    return this.element.find(this.element.itemSelector).size();
  };

  // Retrieves a data-attribute from a slide.
  //
  // Returns the value of the attribute or undefined.
  BaseSlider.prototype.getSlideData = function(property, slide) {
    var slideEl = this.element.children()[this.currentSlide];
    if (slideEl) {
      return slideEl.getAttribute('data-' + property);
    }
  };


  // Constrain the X position to within the slider beginning and end.
  //
  // x - The Integer X position
  //
  // Returns the Integer X position after being constrained.
  BaseSlider.prototype.limitXBounds = function(x) {
    var slideWidth = this.slideWidth;
    var slideCount = this.slideCount();
    var extraSpaceInTarget = this.width - slideWidth;
    var totalWidth = (slideWidth * slideCount) - extraSpaceInTarget;


    if (this.opts.reverse) {
      x = (x > totalWidth - slideWidth) ? totalWidth - slideWidth : x;
      x = (x < 0) ? 0 : x;
    } else {
      x = (x < -totalWidth + slideWidth) ? -totalWidth + slideWidth : x;
      x = (x > 0) ? 0 : x;
    }

    if ((this.position.x - x > 0 && this.opts.limitRight) || 
        (this.position.x - x < 0 && this.opts.limitLeft)) {
      x = this.position.x;
    }

    return x;
  };

  // Lazy load images in the current frame and the next one
  //
  // Returns nothing.
  BaseSlider.prototype.lazyLoadNextFrame = function() {
    var start = this.currentSlide;
    var slidesPerPage = this.slidesPerPage();
    var end = start + (slidesPerPage * 2);

    var $slides = this.element.children().slice(start, end);
    $slides.each(function(i, slide) {
      $('[data-src]', slide).each(function(i, image) {
        image.src = image.getAttribute('data-src');
        image.removeAttribute('data-src');
      });
    });
  };



  var TouchSlider = function() {};
  TouchSlider.prototype = new BaseSlider();
  TouchSlider.superobject = BaseSlider.prototype;

  // Initialize the TouchSlider.
  //
  // text - The String CSS selector of the slider container.
  // opts - The Map of extra parameters.
  // 
  // Returns nothing.
  TouchSlider.prototype.init = function(target, opts) {
    TouchSlider.superobject.init.call(this, target, opts);
    this.opts = $.extend({
      tossFunction: function(x, dx, dt) {
        return x + dx * 100 / dt;
      },
      tossing: false
    }, this.opts);
    $(target).addClass('frankenslide-slider-touch');
    $(target).css({'-webkit-transform':'translateZ(0)'});

    this.gesturing = false;
    $(target)[0].addEventListener('touchstart', this, false);
    $(target)[0].addEventListener('webkitTransitionEnd', this, false);
  };

  // Proxy the events triggered on the element to another function.
  //
  // event - The Event triggered on the element
  // 
  // Returns nothing.
  TouchSlider.prototype.handleEvent = function(event) {
    TouchEvents[event.type].call(this, event);
  };

  // Disable touch events on the slider.
  //
  // Returns nothing.
  TouchSlider.prototype.disable = function() {
    this.handleEvent = {};
  };

  // Re-enable touch events on the slider.
  //
  // Returns nothing.
  TouchSlider.prototype.enable = function() {
    delete this.handleEvent;
  };

  // Update the current position of the slider.
  //
  // opts - The Map of extra parameters:
  //        animate - Boolean of whether or not to animate between two states.
  //        triggerSlide - Boolean of whether or not to trigger the move hook.
  // 
  // Returns nothing.
  TouchSlider.prototype.update = function(opts) {
    var options = $.extend({animate: true, triggerSlide: true}, opts);
    if (options.animate) { this.decayOn(opts && opts.easing); }
    this.element.css({'-webkit-transform': 'translate3d(' + this.position.x + 'px, 0, 0)'}); 
    if (options.triggerSlide) {
      this.element.trigger('move.frankenslide');
    }
  };


  // Turn off CSS3 animation decay.
  // 
  // Returns nothing.
  TouchSlider.prototype.decayOff = function() {
    if (this.decayIsOn !== false) {
      this.decayIsOn = false;
      this.element.css({'-webkit-transition-duration': '0s'});
      this.element.css({'-webkit-transition-property': 'none'});
    }
  };

  // Turn on CSS3 animation decay.
  // 
  // Returns nothing.
  TouchSlider.prototype.decayOn = function(easing) {
    if (!this.decayIsOn || this.easing !== easing) {
      this.decayIsOn = true;
      this.easing = easing;
      easing = easing || 'ease-out';
      var duration = this.opts.animateDuration;
      if (typeof duration === "number") {
        duration = duration / 1000;
      } else {
        if (duration in $.fx.speeds) {
          duration = $.fx.speeds[duration];
        } else {
          duration = $.fx.speeds._default;
        }
      }

      this.element.css({'-webkit-transition-duration': duration + 's',
        '-webkit-transition-property': '-webkit-transform',
        '-webkit-transition-timing-function': easing
      });
    }
  };

  var TouchEvents = {
    click: function(e) {
      if (this.moved) { e.preventDefault(); }
      this.element[0].removeEventListener('click', this, false);
      return !this.moved;
    },

    touchstart: function(e) {
      this.currentTarget = e.currentTarget;
      this.startPosition.x = e.touches[0].pageX - this.position.x;
      this.startPosition.y = e.touches[0].pageY - this.position.y;
      this.startSlide = this.currentSlide;
      this.moved = false;

      window.addEventListener('gesturestart', this, false);
      window.addEventListener('gestureend', this, false);
      window.addEventListener('touchmove', this, false);
      window.addEventListener('touchend', this, false);
      this.element[0].addEventListener('click', this, false);


      this.element.trigger('start.frankenslide');
    },

    touchmove: function(e) {
      if (this.gesturing) { return false; }

      this.decayOff();

      if (!this.moved) {
        var deltaY = Math.abs(e.touches[0].pageY - this.startPosition.y - this.position.y);
        var deltaX = Math.abs(e.touches[0].pageX - this.startPosition.x - this.position.x);
        if (deltaY < deltaX) {
          e.preventDefault();
        }

        this.element.trigger('firstSlide.frankenslide');
      }

      this.moved = true;
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
      this.lastMoveTime = new Date();

      this.position.x = this.limitXBounds(e.touches[0].pageX - this.startPosition.x);

      this.update({animate: false});
      this.lastDate = new Date();
    },

    touchend: function(e) {
      //console.log(new Date() - this.lastDate);
      //console.profile('fingerup');
      window.removeEventListener('gesturestart', this, false);
      window.removeEventListener('gestureend', this, false);
      window.removeEventListener('touchmove', this, false);
      window.removeEventListener('touchend', this, false);
      if (this.moved) {
        var dx = this.position.x - this.lastPosition.x;
        var dt = (new Date()) - this.lastMoveTime + 1;

        var width = this.slideWidth,
          slidesPerPage = this.slidesPerPage(),
          tossedX;
        if (this.opts.tossing || slidesPerPage > 1) {

          tossedX = this.opts.tossFunction(this.position.x, dx, dt);

          if (slidesPerPage === 1 || this.opts.snapToNearest) {
            tossedX = Math.round(tossedX / width) * width;
          }
          this.position.x = this.limitXBounds(tossedX);
          this.currentSlide = this.position.x / width;
          this.update({
            easing: 'ease-out'
          });


        } else if (dx > 20 || dx < -20) {
          if (dx < 0) {
            this.next();
            this.element.trigger('nextSwipe.frankenslide');
          } else {
            this.previous();
            this.element.trigger('previousSwipe.frankenslide');
          }
        } else {
          var slide = Math.abs(Math.round(this.position.x / width));
          if (slide > this.currentSlide) {
            this.next();
            this.element.trigger('nextSwipe.frankenslide');
          } else if (slide < this.currentSlide) {
            this.previous();
            this.element.trigger('previousSwipe.frankenslide');
          } else {
            this.to(this.currentSlide);
          }
        }

        this.element.trigger('end.frankenslide');
      } else {
        this.element.trigger('endNoSlide.frankenslide');
      }

      this.currentTarget = undefined;
      //console.profileEnd('fingerup');
    },

    gesturestart: function(e) {
      this.gesturing = true;
    },

    gestureend: function(e) {
      this.gesturing = false;
    },

    webkitTransitionEnd: function(e) {
      this.element.trigger('animationEnd.frankenslide');
      this.lazyLoadNextFrame();
    }
  };

  Frankenslide.BaseSlider = BaseSlider;
  Frankenslide.TouchSlider = TouchSlider;

  return Frankenslide;
});