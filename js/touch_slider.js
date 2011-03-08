(function(Lectric) {
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
      }
    }, this.opts);
    this.element.parent().addClass('lectric-slider-touch');

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

  // Update the current position of the slider.
  //
  // opts - The Map of extra parameters:
  //        animate - Boolean of whether or not to animate between two states.
  //        triggerMove - Boolean of whether or not to trigger the move hook.
  // 
  // Returns nothing.
  TouchSlider.prototype.update = function(opts) {
    var options = jQuery.extend({animate: true, triggerMove: true}, opts);
    if (options.animate) { this.decayOn(); }
    this.element.css({'-webkit-transform': 'translate3d(' + this.position.x + 'px, 0, 0)'}); 

    if (options.triggerMove) { this.element.trigger('move.lectric'); }
  };

  // Turn off CSS3 animation decay.
  // 
  // Returns nothing.
  TouchSlider.prototype.decayOff = function() {
    this.element.css({'-webkit-transition-duration': '0s'});
    this.element.css({'-webkit-transition-property': 'none'});
  };

  // Turn on CSS3 animation decay.
  // 
  // Returns nothing.
  TouchSlider.prototype.decayOn = function() {
    var duration = this.opts.animateDuration / 1000;
    this.element.css({'-webkit-transition-duration': duration + 's'});
    this.element.css({'-webkit-transition-property': '-webkit-transform'});
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

      this.decayOff();

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

      this.position.x = this.limitXBounds(e.touches[0].pageX - this.startPosition.x);

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
        
        var tossedX = this.limitXBounds(this.opts.tossFunction(this.position.x, dx, dt));
        var width = this.itemWidth();

        // Find the nearest page
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

  Lectric.TouchSlider = TouchSlider;
})(Lectric);
