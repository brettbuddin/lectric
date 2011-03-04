/*!
 * Lectric v0.2.3
 * http://github.com/mckinney/lectric
 *
 * Copyright 2010, McKinney
 * Licensed under the MIT license.
 * http://github.com/mckinney/lectric/blob/master/LICENSE
 *
 * Author: Brett C. Buddin
 */

(function(window) {
  var ua = navigator.userAgent.toLowerCase();
  isWebkit = !!ua.match(/applewebkit/i);
  var supportsTouch = false;
  try {
    document.createEvent("TouchEvent");
    supportsTouch = true;
  } catch (e) {}

  $.fn.cssWithoutUnit = function(attribute) {
    var measure = $(this).css(attribute);
    return (measure !== undefined) ? parseInt(measure.replace('px', ''), 10) : 0;
  };

  var Slider = function() {
    if (supportsTouch && isWebkit) {
      return new TouchSlider();
    } else {
      return new BaseSlider();
    }
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


  var BaseSlider = function() {};

  BaseSlider.prototype.init = function(target, opts) {
    this.opts = jQuery.extend({
      next: undefined, 
      previous: undefined,
      itemWrapperClassName: 'items',
      itemClassName: 'item',
      limitLeft: false,
      limitRight: false, 
      hooks: {}
    }, opts);

    this.position = new Position(0, 0);
    this.startPosition = new Position(this.position);
    this.lastPosition = new Position(this.position);
  
    // Set up the styling of the slider
    var element = $('<div/>', {
      className: this.opts.itemWrapperClassName
    });
    element.css('width', '1000000px');

    var itemSelector = '.' + this.opts.itemClassName;
    var itemWrapperSelector = '.' + this.opts.itemWrapperClassName;

    $(target).css('overflow', 'hidden');
    $(target).find(itemSelector).css('float', 'left').wrapAll(element);
    this.element = $(target).find(itemWrapperSelector);
    this.element.itemSelector = itemSelector;
    this.element.itemWrapperSelector = itemWrapperSelector;

    var self = this;
    
    var type = supportsTouch ? 'touchstart' : 'click';
    $(this.opts.next).bind(type, function(e) {
      e.preventDefault();
      var page = self.page();
      self.to(page + 1);
    });

    $(this.opts.previous).bind(type, function(e) {
      e.preventDefault();
      var page = self.page();
      self.to(page - 1);
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
          self.subscribe(name, fn2);
        });
      } else {
        self.subscribe(name, fn);
      }
    });

    this.element.trigger('init.lectric');
  };

  BaseSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);

    var self = this;
    var after = function() {
      self.element.trigger('animationEnd.lectric');
      $(this).dequeue();
    };

    if (options.animate) {
      this.element.animate({'margin-left': this.position.x + 'px'}).queue(after);
    } else {
      this.element.css({'margin-left': this.position.x + 'px'}).queue(after);
    }

    if (options.triggerMove) { this.element.trigger('move.lectric'); }
  };

  BaseSlider.prototype.subscribe = function(name, fn) {
    var self = this;
    var callback = function(e) {
      if (e.target == self.target[0]) { 
        fn(self, e);
      }
    }
    $(this).bind(name + '.lectric', callback);
    return callback;
  };

  BaseSlider.prototype.unsubscribe = function(name, fn) {
    if (typeof fn !== undefined && isFunction(fn)) {
      $(this).unbind(name + '.lectric', fn);
    } else {
      $(this).unbind(name + '.lectric');
    }
  };

  BaseSlider.prototype.page = function() {
    console.log(this._itemWidth());
    return Math.abs(Math.round(this.position.x / this._itemWidth()));
  };

  BaseSlider.prototype.to = function(page) {
    var previous = this.position.x;
    this.position.x = this._limitXBounds(this._xForPage(page));
    if (this.position.x !== previous) {
      this.update();
    }
    return this.position.x;
  };

  BaseSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true}, opts);

    var self = this;
    var after = function() {
      self.element.trigger('animationEnd.lectric');
      $(this).dequeue();
    };
    
    if (options.animate) {
      this.element.animate({'margin-left': this.position.x + 'px'}).queue(after);
    } else {
      this.element.css('margin-left', this.position.x).queue(after);
    }
  };

  BaseSlider.prototype._xForPage = function(page) {
    var flip = (this.opts.reverse) ? 1 : -1;
    return flip * page * this._itemWidth();
  };

  BaseSlider.prototype._itemWidth = function() {
    var first = this.element.find(this.element.itemSelector).eq(0);
    var padding = first.cssWithoutUnit('paddingRight') + first.cssWithoutUnit('paddingLeft');
    return first.cssWithoutUnit('marginRight') + padding + first.width();
  };

  BaseSlider.prototype._itemCount = function() {
    return this.element.find(this.element.itemSelector).size();
  };

  BaseSlider.prototype._limitXBounds = function(x) {
    var itemWidth = this._itemWidth();
    var itemCount = this._itemCount();
    var totalWidth = itemWidth * itemCount;

    if (this.opts.reverse) {
      x = (x > totalWidth - itemWidth) ?  totalWidth - itemWidth : x;
      x = (x < 0) ? 0 : x;
    } else {
      x = (x < -totalWidth + itemWidth) ?  -totalWidth + itemWidth : x;
      x = (x > 0) ? 0 : x;
    }

    if ((this.position.x - x > 0 && this.opts.limitRight) || 
        (this.position.x - x < 0 && this.opts.limitRight)) {
      x = this.position.x;
    }

    return x;
  };


  var TouchEvents = {
    click: function(e) {
      if (this.moved) { e.preventDefault(); }
      this.element[0].removeEventListener('click', this, false);
      return false;
    },

    touchstart: function(e) {
      this.currentTarget = e.currentTarget;
      this.startPosition.x = e.touches[0].pageX - this.position.x;
      this.startPosition.y = e.touches[0].pageY - this.position.y;
      this.moved = false;

      window.addEventListener('gesturestart', this, false);
      window.addEventListener('gestureend', this, false);
      window.addEventListener('touchmove', this, false);
      window.addEventListener('touchend', this, false);
      this.element[0].addEventListener('click', this, false);

      this._decayOff();

      this.element.trigger('start.lectric');
    },

    touchmove: function(e) {
      if (this.gesturing) { return false; }

      if (!this.moved) {
        var deltaY = e.touches[0].pageY - this.startPosition.y;
        var deltaX = e.touches[0].pageX - this.startPosition.x;
        if (Math.abs(deltaY) < 15) {
          e.preventDefault();
        }

        this.element.trigger('firstMove.lectric');
      }

      this.moved = true;
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
      this.lastMoveTime = new Date();

      this.position.x = this._limitXBounds(e.touches[0].pageX - this.startPosition.x);

      this.update({animate: false});
    },

    touchend: function(e) {
      window.removeEventListener('gesturestart', this, false);
      window.removeEventListener('gestureend', this, false);
      window.removeEventListener('touchmove', this, false);
      window.removeEventListener('touchend', this, false);

      if (this.moved) {
        var dx = this.position.x - this.lastPosition.x;
        var dt = (new Date()) - this.lastMoveTime + 1; 
        
        var tossedX = this._limitXBounds(this.position.x + dx * 100 / dt);
        var width = this._itemWidth();
        this.position.x = Math.round(this.position.x / width) * width;

        this.update();
        this.element.trigger('end.lectric');
      } else {
        this.element.trigger('endNoMove.lectric');
      }

      this.currentTarget = undefined;
    },

    gesturestart: function(e) { 
      this.gesturing = true; 
    },

    gestureend: function(e) { 
      this.gesturing = false; 
    },

    webkitTransitionEnd: function(e) {
      this.element.trigger('animationEnd.lectric');
    }
  };


  var TouchSlider = function() {};
  TouchSlider.prototype = new BaseSlider();
  TouchSlider.superobject = BaseSlider.prototype;

  TouchSlider.prototype.init = function(target, opts) {
    TouchSlider.superobject.init.call(this, target, opts);
    this.element.parent().addClass('lectric-slider-touch');

    this.gesturing = false;
    $(target)[0].addEventListener('touchstart', this, false);
    $(target)[0].addEventListener('webkitTransitionEnd', this, false);
  };

  TouchSlider.prototype.handleEvent = function(e) { 
    TouchEvents[e.type].call(this, e); 
  };

  TouchSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);
    if (options.animate) { this._decayOn(); }
    this.element.css({'-webkit-transform': 'translate3d(' + this.position.x + 'px, 0, 0)'}); 

    if (options.triggerMove) { this.element.trigger('move.lectric'); }
  };

  TouchSlider.prototype._decayOff = function() {
    this.element.css({'-webkit-transition-duration': '0s'});
    this.element.css({'-webkit-transition-property': 'none'});
  };

  TouchSlider.prototype._decayOn = function() {
    this.element.css({'-webkit-transition-duration': '0.4s'});
    this.element.css({'-webkit-transition-property': '-webkit-transform'});
  };
  
  var Lectric = {};
  Lectric.Slider = Slider;
  Lectric.BaseSlider = BaseSlider;
  Lectric.TouchSlider = TouchSlider;

  window.Lectric = Lectric;
})(window);
