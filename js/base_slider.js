(function(Lectric) {
  var BaseSlider = function() {};

  // Initialize the BaseSlider.
  //
  // text - The String CSS selector of the slider container.
  // opts - The Map of extra parameters.
  // 
  // Returns nothing.
  BaseSlider.prototype.init = function(target, opts) {
    this.opts = jQuery.extend({
      reverse: false,
      next: undefined, 
      previous: undefined,
      itemWrapperClassName: 'items',
      itemClassName: 'item',
      limitLeft: false,
      limitRight: false, 
      animateDuration: 400,
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
      self.element.trigger('nextButton.lectric');
    });

    $(this.opts.previous).bind(type, function(e) {
      e.preventDefault();
      var page = self.page();
      self.to(page - 1);
      self.element.trigger('previousButton.lectric');
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

  // Update the current position of the slider.
  //
  // opts - The Map of extra parameters:
  //        animate - Boolean of whether or not to animate between two states.
  //        triggerMove - Boolean of whether or not to trigger the move hook.
  // 
  // Returns nothing.
  BaseSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);

    var self = this;
    var after = function() {
      self.element.trigger('animationEnd.lectric');
      $(this).dequeue();
    };

    if (options.animate) {
      this.element.animate({'margin-left': this.position.x + 'px'}, this.opts.animateDuration).queue(after);
    } else {
      this.element.css({'margin-left': this.position.x + 'px'}).queue(after);
    }

    if (options.triggerMove) { this.element.trigger('move.lectric'); }
  };


  // Subscribe a callback function to a hook.
  //
  // name - The String name of the hook.
  // fn - The Function callback to execute when the hook is triggered.
  // 
  // Returns the Function callback that was bound to the hook.
  BaseSlider.prototype.subscribe = function(name, fn) {
    var self = this;
    var callback = function(e) {
      if (e.target == self.element[0]) { 
        fn(self, e);
      }
    };

    this.element.bind(name + '.lectric', callback);
    return callback;
  };

  // Unsubscribe a callback function from a hook or unsubscribe all callbacks from a hook.
  //
  // name - The String name of the hook.
  // fn - The Function callback to execute when the hook is triggered.
  // 
  // Returns nothing.
  BaseSlider.prototype.unsubscribe = function(name, fn) {
    if (typeof fn !== undefined && $.isFunction(fn)) {
      this.element.unbind(name + '.lectric', fn);
    } else {
      this.element.unbind(name + '.lectric');
    }
  };

  // Retrieve the current page of the slider.
  // 
  // Returns the Integer page number of the slider.
  BaseSlider.prototype.page = function() {
    return Math.abs(Math.round(this.position.x / this.itemWidth()));
  };

  // Move to a specific page number.
  //
  // page - The Integer page number to move to.
  // 
  // Returns nothing.
  BaseSlider.prototype.to = function(page) {
    var previous = this.position.x;
    this.position.x = this.limitXBounds(this.xForPage(page));
    if (this.position.x !== previous) {
      this.update();
    }
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
  // page - The Integer page number.
  // 
  // Returns the Integer X position of the slider.
  BaseSlider.prototype.xForPage = function(page) {
    var flip = (this.opts.reverse) ? 1 : -1;
    return flip * page * this.itemWidth();
  };


  // Retrieve the width of a single item (including margin-right and padding).
  // 
  // Returns the Integer width of a single item.
  BaseSlider.prototype.itemWidth = function() {
    var first = this.element.find(this.element.itemSelector).eq(0);
    var padding = cssWithoutUnit(first, 'paddingRight') + cssWithoutUnit(first, 'paddingLeft');
    return cssWithoutUnit(first, 'marginRight') + padding + first.width();
  };

  // Retrieve number of items in the slider.
  // 
  // Returns the Integer number of items.
  BaseSlider.prototype.itemCount = function() {
    return this.element.find(this.element.itemSelector).size();
  };


  // Constrain the X position to within the slider beginning and end.
  //
  // x - The Integer X position
  //
  // Returns the Integer X position after being constrained.
  BaseSlider.prototype.limitXBounds = function(x) {
    var itemWidth = this.itemWidth();
    var itemCount = this.itemCount();
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

  Lectric.BaseSlider = BaseSlider;
})(Lectric);
