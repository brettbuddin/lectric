/*!
 * Slider Controls for frankenslide
 * Copyright 2013 Jake Duffy
 * Licensed under the MIT license.
 */
(function( factory ) {
  //AMD
  if(typeof define === 'function' && define.amd) {
    define([], factory);

  //NODE
  } else if(typeof module === 'object' && module.exports) {
    module.exports = factory();

  //GLOBAL
  } else {
    window.SliderControls = factory();
  }
})(function() {

  var exports = {};

  exports.extend = function( slider ) {
	  var nextBtn = slider.opts.next || slider.opts.nextPage;
	  var prevBtn = slider.opts.previous || slider.opts.previousPage;

    function checkControls(s, i) {

	    var currentSlide = s.currentSlide;
	  	var slideCount = s.slideCount()-1; //slide count uses returns integer count
	  	var slidesPerPage = s.slidesPerPage();

	  	if (currentSlide > 0) {
	  		$(prevBtn).show(); 
	  	} else {
	  	    $(prevBtn).hide();
	  	}
	  	
	  	if ((slidesPerPage + currentSlide) >= slideCount) {
	    	$(nextBtn).hide();
	  	} else if (slideCount === currentSlide) {
		    $(nextBtn).hide();
	  	} else {
	 	   $(nextBtn).show();
	  	}

    }
    
    slider.controlHider = function() {
		checkControls(slider);
	}
	
   slider.on('move.frankenslide', checkControls);
    
  };

  return exports;
});
