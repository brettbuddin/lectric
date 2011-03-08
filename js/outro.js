  var Slider = function() {
    if (supportsTouch && isWebkit) {
      return new TouchSlider();
    } else {
      return new BaseSlider();
    }
  };
  
  Lectric.Slider = Slider;
  window.Lectric = Lectric;
})(window);
