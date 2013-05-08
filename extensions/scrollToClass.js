/*
 * ScrollTo HasClass for frankenslide
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
    window.ScrollToClass = factory();
  }
})(function() {

  var exports = {};

  exports.extend = function( slider, className, pageBool, retreat ) {
    //!TODO: Change to use config object instead of arguments
	var page = pageBool, //slide to Class only if class is off currentPage
	    className = "current",
	    retreatToPrevious = retreat || false;
	    
	    
    function whichSlideHasClass() {
	    var slideWithClass;

	  	var slides = slider.element[0].childNodes;

	  	$.each(slides, function(i, e) {
		  	if ($(e).hasClass(className)) {
			  	slideWithClass = i; 
			  	//console.log(slideWithClass);
			  	return false;
		  	}
	  	})
	  	
	  	return slideWithClass;

    }
    
    slider.scrollToSlideWithClass = function() {
    	var currentSlide = slider.currentSlide,
	  		slideCount = slider.slideCount() - 1, //integer count
	  		slidesPerPage = slider.slidesPerPage(),
	  		slideWithClass = whichSlideHasClass();
	  		
	  		//console.log('cs+sPp:' + (currentSlide+slidesPerPage) + " <= " + 'swc: ' + slideWithClass);
	  	if (!pageBool) {
	  		//scroll to slide with class
		  	slider.to(slideWithClass);
		} else if(currentSlide > slideWithClass && retreatToPrevious) {
			//if user has advanced pages past class
			slider.to(slideWithClass);
	  	} else {
		  	if (currentSlide+slidesPerPage <= slideWithClass) {
		  		//only slide if class is off the page
			  	slider.to(slideWithClass);
		  	}
	  	}
    }    
    	//do not attach this extension to any slider move events or you will be sorry
  };
  return exports;
});
