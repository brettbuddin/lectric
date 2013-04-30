/* global QUnit: false, module: false, test: false, asyncTest: false, expect: false, start: false, stop: false, ok: false, equal: false, deepEqual: false, propEqual: false, strictEqual: false, raises: false, Frankenslide: false, equals: false */
$(function() {
  var slider = new Frankenslide();
  slider.init('#slider', {next: '.next', previous: '.previous'});

  var slider2 = new Frankenslide();
  slider2.init('#slider2');

  test("setup", function() {
    expect(1);

    ok(window.Frankenslide, 'global frankenslide object is created');
  });

  test("structure", function() {
    expect(6);

    equals(slider.slideWidth, 530, "report the width of each individual slide");
    equals(slider.slideCount(), 4, "report the number of slides");
    equals(slider.element.parent().css('position'), 'relative', "relative positioning set to container");
    equals(slider.element.css('position'), 'relative', "relative positioning set to slides container");
    equals(slider.element.css('left'), '0px', "assigns an initial value to left");
    ok(slider.element.parent().hasClass('frankenslide-slider'), "has the frankenslide-slider class assigned to the container");
  });

  test("movement", function() {
    expect(3);

    slider.on('animationEnd', function() {
      start(); 
    });
    equals(slider.currentSlide, 0, "start on slide 0");

    slider.to(1);
    //stop();
    equals(slider.currentSlide, 1, "move to slide 1");

    slider.toItem($('#slider .item').eq(3));
    //stop();
    equals(slider.currentSlide, 3, "move to slide 3");
  });

  test("subscribing to hooks", function() {
    expect(1);

    var handler = slider.on('hello', function(s, e) {
      equals(e.type, 'hello');
      start();
    });
    slider.element.trigger('hello.frankenslide');
    stop();
    slider.off('hello', handler);
  });

  test("unsubscribing from hooks", function() {
    expect(1);

    var counter = 0;
    var handler = slider.on('hello', function(s, e) {
      counter++;
      start();
    });

    slider.element.trigger('hello.frankenslide');
    stop();

    slider.off('hello', handler);
    slider.element.trigger('hello.frankenslide');
    equals(counter, 1);
  });

  test("next button", function() {
    expect(1);

    var click = function(e) {
      equals(e.type, 'click');
      start();
    };
    $('.next').bind('click', click);
    $('.next').trigger('click');
    stop();
  });

  test("previous button", function() {
    expect(1);

    var click = function(e) {
      equals(e.type, 'click');
      start();
    };
    $('.previous').bind('click', click);
    $('.previous').trigger('click');
    stop();
  });

  test("tiles per page", function() {
    expect(1);

    equals(slider2.slidesPerPage(), 3);
  });
});
