(function(window) {
  var Yum = {};
  var Browser = {};

  var ua = navigator.userAgent.toLowerCase();
  Browser.isWebkit = ua.indexOf('applewebkit/') > -1;
  try {
    document.createEvent("TouchEvent");
    Browser.supportsTouch = true;
  } catch (e) {
    Browser.supportsTouch = false;
  }
  Yum.Browser = Browser;



  var Subscription = function() {
    this.hooks = [];  
  };

  Subscription.prototype.push = function(hook, fn) {
    if (this.hooks[hook] === undefined) {
      this.hooks[hook] = [];
    }
    this.hooks[hook].push(fn);
  };

  Subscription.prototype.invoke = function(hook) {
    if (this.hooks[hook] !== undefined) {
      var args = Array().slice.call(arguments);
      var self = this;
      jQuery.each(this.hooks[hook], function(i, fn) {
        fn.apply(self, args.slice(1));
      });
    }
  };



  var Slider = function() {};

  Slider.prototype.init = function(element, opts) {
    this.opts = jQuery.extend({
      next: undefined, 
      previous: undefined, 
      limitLeft: false,
      limitRight: false, 
      init: undefined
    }, opts);

    this.currentX = 0;
    this.currentY = 0;
    this.hooks = new Subscription();

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
          self.hooks.invoke('move', self);
        }

        return false;
      });
    }

    if (this.opts.init !== undefined) {
      this.opts.init(this); 
    }
  };

  Slider.prototype.update = function(opts) {
    var opts = jQuery.extend({animate: true, invokeMove: true}, opts||{});

    var self = this;
    var after = function() {
      self.hooks.invoke('animationEnd', self);
      $(this).dequeue();
    };

    if (opts.animate) {
      this.element.animate({'margin-left': this.currentX + 'px'}).queue(after);
    } else {
      this.element.css({'margin-left': this.currentX + 'px'}).queue(after);
    }

    if (opts.invokeMove) { this.hooks.invoke('move', this); }
  };

  Slider.prototype.subscribe = function(name, fn) {
    return this.hooks.push(name, fn);
  };

  Slider.prototype.structure = function(element) {
    var structure = {};
    var first = function() { return element.find('.item').eq(0); };

    structure.itemCount = function() { return element.find('.item').size(); };
    structure.itemHeight = function() { return parseInt(first().height()); };

    structure.itemSpacing = function() { 
      var marginRight = first().css('marginRight');
      return (marginRight !== undefined) ? parseInt(marginRight.replace('px', '')) : 0;
    };
    structure.itemWidth = function() { 
      return (structure.itemSpacing() + parseInt(first().width())); 
    };

    return structure;
  };

  Slider.prototype.page = function(currentX) {
    return Math.abs(Math.round(currentX / this.structure.itemWidth()));
  };

  Slider.prototype.nearestPageX = function(currentX) {
    return Math.round(currentX / this.structure.itemWidth()) * this.structure.itemWidth();
  };

  Slider.prototype.pageX = function(index) {
    var flip = (this.opts.reverse) ? 1 : -1;
    return flip * index * this.structure.itemWidth();
  };

  Slider.prototype.nextPageX = function(currentX) {
    if (this.page(currentX) + 1 <= this.structure.itemCount() - 1) {
      currentX = currentX -this.structure.itemWidth();
    }
    return currentX;
  };

  Slider.prototype.previousPageX = function(currentX) {
    if (this.page(currentX) >= 0) {
      currentX = currentX + this.structure.itemWidth();
    }
    return currentX;
  };

  Slider.prototype.limitXBounds = function(currentX) {
    var total_width = this.structure.itemWidth() * this.structure.itemCount();
    if (this.opts.reverse) {
      currentX = (currentX > total_width - this.structure.itemWidth()) ? total_width - this.structure.itemWidth() : currentX;
      currentX = (currentX < 0) ? 0 : currentX;
    } else {
    currentX = (currentX < -total_width + this.structure.itemWidth()) ? -total_width + this.structure.itemWidth() : currentX;
      currentX = (currentX > 0) ? 0 : currentX;
    }

    if ((this.currentX - currentX > 0 && this.opts.limitRight) || 
        (this.currentX - currentX < 0 && this.opts.limitLeft)) {
      currentX = this.currentX;
    }
    return currentX;
  };



  var TouchSlider = function() {};
  TouchSlider.prototype = new Slider();
  TouchSlider.superobject = Slider.prototype;

  TouchSlider.prototype.init = function(element, structure, opts) {
    TouchSlider.superobject.init.call(this, element, structure, opts);

    this.gesturing = false;
    var $element = $(element);
    $element[0].addEventListener('touchstart', this, false);
    $element[0].addEventListener('webkitTransitionEnd', this, false);
  };

  TouchSlider.prototype.update = function(opts) {
    var opts = jQuery.extend({animate: true, invokeMove: true}, opts||{});
    if (opts.animate) { this.decayOn(); }
    this.element.css({'-webkit-transform': 'translate3d(' + this.currentX + 'px, 0, 0)'}); 

    if (opts.invokeMove) { this.hooks.invoke('move', this); }
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

    this.hooks.invoke('start', this);
  };

  TouchSlider.prototype.touchmove = function(e) {
    if (this.gesturing) { return false; }

    if (!this.moved) {
      var deltaY = e.touches[0].pageY - this.startY;
      var deltaX = e.touches[0].pageX - this.startX;
      if (Math.abs(deltaY) < 15) {
        e.preventDefault();
      }

      this.hooks.invoke('firstMove', this);
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
      this.hooks.invoke('end', this);
    } else {
      this.hooks.invoke('endNoMove', this);
    }

    this.currentTarget = undefined;
  };

  TouchSlider.prototype.webkitTransitionEnd = function(e) {
    this.hooks.invoke('animationEnd', this);
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

  Yum.Slider = Slider;
  Yum.TouchSlider = TouchSlider;

  window.Yum = Yum;
})(window);
