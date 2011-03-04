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

  BaseSlider.prototype.init = function(element, opts) {
    this.opts = jQuery.extend({
      next: undefined, 
      previous: undefined,
      item: ".item",
      limitLeft: false,
      limitRight: false, 
      init: undefined
    }, opts);

    this.position = new Position(0, 0);
    this.startPosition = new Position(this.position);
    this.lastPosition = new Position(this.position);

    var $element = $(element);
    $element.find(this.opts.item).wrapAll('<div class="items">');
    $element.css('overflow', 'hidden');
    this.element = $element.find('.items');
    this.element.itemSelector = this.opts.item;
    this.element.css('width', '1000000px');
    this.element.find(this.element.itemSelector).css('float', 'left');

    this.structure = this.structure(this.element);
    
    var self = this;
    if (this.opts.next) {
      $(this.opts.next).bind('click', function() {
        var previous = self.position.x;
        self.position.x = self.limitXBounds(self.nextPageX(self.position.x));
        if (self.position.x !== previous) {
          self.update();
        }

        return false;
      });
    }

    if (this.opts.previous) {
      $(this.opts.previous).bind('click', function() {
        var previous = self.position.x;
        self.position.x = self.limitXBounds(self.previousPageX(self.position.x));
        if (self.position.x !== previous) {
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
    return this.element.bind(name + '.lectric', function(e) {
      if (e.target == self.element[0]) {
        fn(self);
      }
    });
  };

  BaseSlider.prototype.structure = function(element) {
    var structure = {};
    var first = function() { return element.find(element.itemSelector).eq(0); };

    structure.itemCount = function() { return element.find(element.itemSelector).size(); };
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
    var previous = this.position.x;
    this.position.x = this.limitXBounds(this.pageX(index));
    if (this.position.x !== previous) {
      this.update();
    }
    return this.position.x;
  };

  BaseSlider.prototype.toElement = function(e) {
    var previous = this.position.x;
    var index = this.getItemIndex(e);
	return this.to(index);
  };
	
  BaseSlider.prototype.getItemIndex = function(e) {
	var all = this.element.find(this.element.itemSelector);
    
    var i;
    var length = all.length;
	for (i = 0; i < length; i++) {
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

    if ((this.position.x - currentX > 0 && this.opts.limitRight) || 
        (this.position.x - currentX < 0 && this.opts.limitLeft)) {
      currentX = this.position.x;
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
    this.element.css({'-webkit-transform': 'translate3d(' + this.position.x + 'px, 0, 0)'}); 

    if (options.triggerMove) { this.element.trigger('move.lectric'); }
  };

  TouchSlider.prototype.handleEvent = function(e) { this[e.type](e); };

  TouchSlider.prototype.click = function(e) {
    if (this.moved) { e.preventDefault(); }
    this.element[0].removeEventListener('click', this, false);
    return false;
  };

  TouchSlider.prototype.touchstart = function(e) {
    this.currentTarget = e.currentTarget;
    this.startPosition.x = e.touches[0].pageX - this.position.x;
    this.startPosition.y = e.touches[0].pageY - this.position.y;
    this.moved = false;

    window.addEventListener('gesturestart', this, false);
    window.addEventListener('gestureend', this, false);
    window.addEventListener('touchmove', this, false);
    window.addEventListener('touchend', this, false);
    this.element[0].addEventListener('click', this, false);

    this.decayOff();

    this.element.trigger('start.lectric');
  };

  TouchSlider.prototype.touchmove = function(e) {
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

    this.position.x = this.limitXBounds(e.touches[0].pageX - this.startPosition.x);

    this.update({animate: false});
  };

  TouchSlider.prototype.touchend = function(e) {
    window.removeEventListener('gesturestart', this, false);
    window.removeEventListener('gestureend', this, false);
    window.removeEventListener('touchmove', this, false);
    window.removeEventListener('touchend', this, false);

    if (this.moved) {
      var dx = this.position.x - this.lastPosition.x;
      var dt = (new Date()) - this.lastMoveTime + 1; 
      
      var tossedX = this.limitXBounds(this.position.x + dx * 100 / dt);
      this.position.x = this.nearestPageX(tossedX);

      this.update();
      this.element.trigger('end.lectric');
    } else {
      this.element.trigger('endNoMove.lectric');
    }

    this.currentTarget = undefined;
  };

  TouchSlider.prototype.webkitTransitionEnd = function(e) {
    this.element.trigger('animationEnd.lectric');
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
  
  var Lectric = {};
  Lectric.Slider = Slider;
  Lectric.BaseSlider = BaseSlider;
  Lectric.TouchSlider = TouchSlider;

  window.Lectric = Lectric;
})(window);
