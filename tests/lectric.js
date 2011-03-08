$(function() {
  var slider = new Lectric();
  slider.init('#slider', {next: '.next', previous: '.previous'});

  test("setup", function() {
    expect(1);

    ok(window.Lectric, 'global Lectric object is created');
  });

  test("structure", function() {
    expect(3);

    equals(slider.itemWidth(), 530, "report the width of each individual item");
    equals(slider.itemCount(), 4, "report the number of pages");
    ok(slider.element.parent().hasClass('lectric-slider'), "has the lectric-slider class assigned to the items container");
  });

  test("movement", function() {
    expect(3);

    slider.subscribe('animationEnd', function() {
      start(); 
    });
    equals(slider.page(), 0, "start on item 0");

    slider.to(1);
    stop();
    equals(slider.page(), 1, "move to item 1");

    slider.toItem($('#slider .item').eq(3));
    stop();
    equals(slider.page(), 3, "move to item 3");
  });

  test("subscribing to hooks", function() {
    expect(1);

    var handler = slider.subscribe('hello', function(s, e) {
      equals(e.type, 'hello');
      start();
    });
    slider.element.trigger('hello.lectric');
    stop();
    slider.unsubscribe('hello', handler);
  });

  test("unsubscribing from hooks", function() {
    expect(1);

    var counter = 0;
    var handler = slider.subscribe('hello', function(s, e) {
      counter++;
      start();
    });

    slider.element.trigger('hello.lectric');
    stop();

    slider.unsubscribe('hello', handler);
    slider.element.trigger('hello.lectric');
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
});
