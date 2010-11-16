/*!
 * Lectric v0.2.2
 * http://github.com/mckinney/lectric
 *
 * Copyright 2010, McKinney
 * Licensed under the MIT license.
 * http://github.com/mckinney/lectric/blob/master/LICENSE
 *
 * Author: Brett C. Buddin
 */

(function(window) {
  var Lectric = {};
  var Browser = {};

  var ua = navigator.userAgent.toLowerCase();
  Browser.isWebkit = !!ua.match(/applewebkit/i);
  Browser.isChrome = !!ua.match(/chrome/i);
  Browser.isIE = !!ua.match(/msie/i);
  Browser.isFirefox = ua.match(/firefox/);
  try {
    document.createEvent("TouchEvent");
    Browser.supportsTouch = true;
  } catch (e) {
    Browser.supportsTouch = false;
  }

  var Slider = function() {
    if (Browser.supportsTouch && Browser.isWebkit) {
      return new TouchSlider();
    } else {
      return new BaseSlider();
    }
  };

  var BaseSlider = function() {};

  BaseSlider.prototype.init = function(element, opts) {
    this.opts = jQuery.extend({
      next: undefined, 
      previous: undefined, 
      limitLeft: false,
      limitRight: false, 
      init: undefined
    }, opts);

    this.currentX = 0;
    this.currentY = 0;

    var $element = $(element);
    $element.find('.item').wrapAll('<div class="items">');
    $element.css('overflow', 'hidden');
    this.element = $element.find('.items');
    this.element.css('width', '1000000px');
    this.element.find('.item').css('float', 'left');

    this.structure = this.structure(this.element);
    
    var self = this;
    if (this.opts.next) {
      $(this.opts.next).bind('click', function() {
        var previous = self.currentX;
        self.currentX = self.limitXBounds(self.nextPageX(self.currentX));
        if (self.currentX !== previous) {
          self.update();
        }

        return false;
      });
    }

    if (this.opts.previous) {
      $(this.opts.previous).bind('click', function() {
        var previous = self.currentX;
        self.currentX = self.limitXBounds(self.previousPageX(self.currentX));
        if (self.currentX !== previous) {
          self.update();
        }

        return false;
      });
    }

    if (this.opts.init !== undefined) {
      this.opts.init(this); 
    }
  };

  BaseSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);

    var self = this;
    var after = function() {
      self.element.trigger('lectric.animationEnd');
      $(this).dequeue();
    };

    if (options.animate) {
      this.element.animate({'margin-left': this.currentX + 'px'}).queue(after);
    } else {
      this.element.css({'margin-left': this.currentX + 'px'}).queue(after);
    }

    if (options.triggerMove) { this.element.trigger('lectric.move'); }
  };

  BaseSlider.prototype.subscribe = function(name, fn) {
    var self = this;
    return this.element.bind('lectric.' + name, function(e) {
      if (e.target == self.element[0]) {
        fn(self);
      }
    });
  };

  BaseSlider.prototype.structure = function(element) {
    var structure = {};
    var first = function() { return element.find('.item').eq(0); };

    structure.itemCount = function() { return element.find('.item').size(); };
    structure.itemHeight = function() { return parseInt(first().height(), 10); };

    structure.itemSpacing = function() { 
      var marginRight = first().css('marginRight');
      return (marginRight !== undefined) ? parseInt(marginRight.replace('px', ''), 10) : 0;
    };
    structure.itemWidth = function() { 
      return (structure.itemSpacing() + parseInt(first().width(), 10)); 
    };

    return structure;
  };

  BaseSlider.prototype.page = function(currentX) {
    return Math.abs(Math.round(currentX / this.structure.itemWidth()));
  };

  BaseSlider.prototype.nearestPageX = function(currentX) {
    return Math.round(currentX / this.structure.itemWidth()) * this.structure.itemWidth();
  };

  BaseSlider.prototype.pageX = function(index) {
    var flip = (this.opts.reverse) ? 1 : -1;
    return flip * index * this.structure.itemWidth();
  };







  BaseSlider.prototype.to = function(index) {
    var previous = self.currentX;
    this.currentX = this.limitXBounds(this.pageX(index));
    if (this.currentX !== previous) {
      this.update();
    }
    return false;
  };

  BaseSlider.prototype.to_element = function(e) {
    var previous = self.currentX;
    var index = this.get_item_index(e);
	return this.to(index);
  };
	
  BaseSlider.prototype.get_item_index = function(e) {
	var all = this.element.find('.item');
	for (var i=0; i < all.length; i++) {
		if ($(all[i])[0] == e[0]) { return i; }
	}
  };






  BaseSlider.prototype.nextPageX = function(currentX) {
    if (this.page(currentX) + 1 <= this.structure.itemCount() - 1) {
      currentX = currentX -this.structure.itemWidth();
    }
    return currentX;
  };

  BaseSlider.prototype.previousPageX = function(currentX) {
    if (this.page(currentX) >= 0) {
      currentX = currentX + this.structure.itemWidth();
    }
    return currentX;
  };

  BaseSlider.prototype.limitXBounds = function(currentX) {
    var total_width = this.structure.itemWidth() * this.structure.itemCount();
    if (this.opts.reverse) {
      currentX = (currentX > total_width - this.structure.itemWidth()) ? 
                   total_width - this.structure.itemWidth() : 
                   currentX;

      currentX = (currentX < 0) ? 0 : currentX;
    } else {
    currentX = (currentX < -total_width + this.structure.itemWidth()) ? 
                 -total_width + this.structure.itemWidth() : 
                 currentX;
      currentX = (currentX > 0) ? 0 : currentX;
    }

    if ((this.currentX - currentX > 0 && this.opts.limitRight) || 
        (this.currentX - currentX < 0 && this.opts.limitLeft)) {
      currentX = this.currentX;
    }
    return currentX;
  };



  var TouchSlider = function() {};
  TouchSlider.prototype = new BaseSlider();
  TouchSlider.superobject = BaseSlider.prototype;

  TouchSlider.prototype.init = function(element, structure, opts) {
    TouchSlider.superobject.init.call(this, element, structure, opts);
    this.element.parent().addClass('lectric-slider-touch');

    this.gesturing = false;
    var $element = $(element);
    $element[0].addEventListener('touchstart', this, false);
    $element[0].addEventListener('webkitTransitionEnd', this, false);
  };

  TouchSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);
    if (options.animate) { this.decayOn(); }
    this.element.css({'-webkit-transform': 'translate3d(' + this.currentX + 'px, 0, 0)'}); 

    if (options.triggerMove) { this.element.trigger('lectric.move'); }
  };

  TouchSlider.prototype.handleEvent = function(e) { this[e.type](e); };

  TouchSlider.prototype.click = function(e) {
    if (this.moved) { e.preventDefault(); }
    this.element[0].removeEventListener('click', this, false);
    return false;
  };

  TouchSlider.prototype.touchstart = function(e) {
    this.currentTarget = e.currentTarget;
    this.startX = e.touches[0].pageX - this.currentX;
    this.startY = e.touches[0].pageY - this.currentY;
    this.moved = false;

    window.addEventListener('gesturestart', this, false);
    window.addEventListener('gestureend', this, false);
    window.addEventListener('touchmove', this, false);
    window.addEventListener('touchend', this, false);
    this.element[0].addEventListener('click', this, false);

    this.decayOff();

    this.element.trigger('lectric.start');
  };

  TouchSlider.prototype.touchmove = function(e) {
    if (this.gesturing) { return false; }

    if (!this.moved) {
      var deltaY = e.touches[0].pageY - this.startY;
      var deltaX = e.touches[0].pageX - this.startX;
      if (Math.abs(deltaY) < 15) {
        e.preventDefault();
      }

      this.element.trigger('lectric.firstMove');
    }

    this.moved = true;
    this.lastX = this.currentX;
    this.lastMoveTime = new Date();

    this.currentX = this.limitXBounds(e.touches[0].pageX - this.startX);

    this.update();
  };

  TouchSlider.prototype.touchend = function(e) {
    window.removeEventListener('gesturestart', this, false);
    window.removeEventListener('gestureend', this, false);
    window.removeEventListener('touchmove', this, false);
    window.removeEventListener('touchend', this, false);

    if (this.moved) {
      var dx = this.currentX - this.lastX;
      var dt = (new Date()) - this.lastMoveTime + 1; 
      
      var tossedX = this.limitXBounds(this.currentX + dx * 100 / dt);
      this.currentX = this.nearestPageX(tossedX);

      this.update();
      this.element.trigger('lectric.end');
    } else {
      this.element.trigger('lectric.endNoMove');
    }

    this.currentTarget = undefined;
  };

  TouchSlider.prototype.webkitTransitionEnd = function(e) {
    this.element.trigger('lectric.animationEnd');
  };

  TouchSlider.prototype.gesturestart = function(e) { this.gesturing = true; };
  TouchSlider.prototype.gestureend = function(e) { this.gesturing = false; };

  TouchSlider.prototype.decayOff = function() {
    this.element.css({'-webkit-transition-duration': '0s'});
    this.element.css({'-webkit-transition-property': 'none'});
  };

  TouchSlider.prototype.decayOn = function() {
    this.element.css({'-webkit-transition-duration': '0.4s'});
    this.element.css({'-webkit-transition-property': '-webkit-transform'});
  };

  Lectric.Slider = Slider;
  Lectric.BaseSlider = BaseSlider;
  Lectric.TouchSlider = TouchSlider;

  window.Lectric = Lectric;
})(window);
