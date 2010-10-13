# Yum Slider

Yum Slider is a JavaScript slider that is touch enabled and looks awesome on Apple touch devices.

**Requires:** [jQuery](http://github.com/jquery/jquery)

## Installation

Put this in your `<head>`:

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
    <script src="/path/to/yumslider.js" type="text/javascript"></script>

## Usage

### Non-Touch Slider

    var slider = new Yum.Slider();
    slider.init('.slider');

### Touch Enabled Slider

    var slider = new Yum.TouchSlider();
    slider.init('.slider');

## Optional Parameters

You can specify a few extra parameters when you call the `init` method of the `Slider` or `TouchSlider` objects. Those include:

- `next` *(selector)*: Next button
- `previous` *(selector)*: Previous button
- `limitLeft` *(boolean)*: Prohibits the slider from moving left
- `limitRight` *(boolean)*: Prohibits the slider from moving right
- `init` *(function)*: Function to invoke when we're done setting up the slider

## Hook System

Yum is designed to give you a great deal of visibility of its insides. To help you extend Yum, we've provided a simple hook system for you to tap into. Hooks have specific names and are invoked at specific times in the execution of the slider's timeline. 

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
