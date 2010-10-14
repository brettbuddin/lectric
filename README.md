# Lectric Slider

Lectric is a JavaScript slider that is touch-enabled and takes advantage of hardware acceleration. It looks awesome on Apple touch devices. You can see an early version of this software implemented on [mckinney.com](http://mckinney.com).

It's Electric!

**Requires:** [jQuery](http://github.com/jquery/jquery)

## Installation

Put this in your `<head>`:
    
    <link href="/path/to/css/lectric.css" rel="stylesheet" type="text/css" media="screen">

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
    <script src="/path/to/js/lectric.js" type="text/javascript"></script>

The stylesheet is required if you intend on using `TouchSlider`, because you need to establish a baseline transform when the page loads; otherwise, you'll end up with some blinking and jitter.

## Usage

HTML:

    <div class="slider">
      <div class="item">Hello world</div>
      <div class="item">Hello world</div>
      <div class="item">Hello world</div>
      <div class="item">Hello world</div>
    </div>

### Non-Touch Slider

    var slider = new Lectric.Slider();
    slider.init('.slider');

This slider uses `margin-left` for movement.

### Touch Slider

    var slider = new Lectric.TouchSlider();
    slider.init('.slider');

This slider uses `-webkit-transform` (using `translate3d`) for movement. It also provides bindings for touch events.

## Optional Parameters

You can specify a few extra parameters when you call the `init` method of the `Slider` or `TouchSlider` objects. Those include:

- `next` *(selector)*: Next button
- `previous` *(selector)*: Previous button
- `limitLeft` *(boolean)*: Prohibits the slider from moving left
- `limitRight` *(boolean)*: Prohibits the slider from moving right
- `init` *(function)*: Function to invoke when we're done setting up the slider

For example, let's provide a slider with next/previous buttons:

    var slider = new Lectric.TouchSlider();
    slider.init('.slider', {next: '.next', previous: '.previous'});

## Hook System

Lectric is designed to give you a great deal of visibility of its insides. To help you extend Lectric, we've provided a simple hook system for you to tap into. Hooks have specific names and are invoked at specific times in the execution of the slider's timeline. 

Subscribing to a hook looks something like this:

    slider.subscribe('move', function(s) {
      console.log('We just moved! Our current position is:' + s.currentX);
    });

The hooks available to you are:

- `start`: Triggered when the user puts her finger down on the slider
- `move`: Triggered when the position of the slider is updated
- `firstMove`: Triggered the first time the position of the slider is updated (for a single touch event)
- `end`: Triggered when the user lifts her finger off of the slider
- `endNoMove`: Triggered when the user lifts her finger off of the slider and did not move the slider
- `animationEnd`: Triggered when the slide animation has completed

The callback function that you provide the `subscribe` function give your callback a single parameter: the `Slider` or `TouchSlider` instance you are manipulating. This allows you to perform external tasks when the hook is invoked or augment the behaviour of the slider itself.
