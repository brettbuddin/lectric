# Lectric Slider

Lectric is a JavaScript slider that is touch-enabled and takes advantage of hardware acceleration. It looks awesome on Apple touch devices. You can see an early version of this software implemented on [mckinney.com](http://mckinney.com).

It's Electric!

**Requires:** [jQuery](http://github.com/jquery/jquery)

## Installation

Put this in your `<head>`:
    
    <link href="/path/to/css/lectric.css" rel="stylesheet" type="text/css" media="screen">

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js" type="text/javascript"></script>
    <script src="/path/to/js/lectric.js" type="text/javascript"></script>

## Usage

HTML:

    <div id="slider">
      <div class="item">Tile 1</div>
      <div class="item">Tile 2</div>
      <div class="item">Tile 3</div>
      <div class="item">Tile 4</div>
    </div>

JavaScript:

    var slider = new Lectric();
    slider.init('#slider');

## Optional Parameters

You can specify a few extra parameters when you call the `init` method. Those include:

- `next` *(selector)*: Next tile button
- `previous` *(selector)*: Previous tile button
- `limitLeft` *(boolean)*: Prohibits the slider from moving left
- `limitRight` *(boolean)*: Prohibits the slider from moving right
- `itemClassName` *(string)*: Class name of the individual tiles of the slider (defaults to "item")
- `itemWrapperClassName` *(string)*: Class name of the container that wraps all items (defaults to "items")
- `animateEasing` *(string)*: A string indicating which easing function to use for the transition (non-mobile only).
- `animateDuration` *(integer or string)*: A string (e.g. "fast" or "slow") or number (in milliseconds) determining how long a slide animation will run.
- `hooks` *(map)*: Map of callback functions that should be subscribed to the various hooks (see next section for more about hooks)
- `tossing` *(boolean)*: Turns tossing of the slider on. This lets you "toss" the slider ahead more than one page. (defaults to false)
- `tossFunction` *(function)*: A function to use for calculating the distance (from the touchend point) the slider should be tossed.

For example, let's provide a slider with next/previous buttons:

    var slider = new Lectric();
    slider.init('#slider', {next: '.next', previous: '.previous'});

## Hook System

Lectric is designed to give you a great deal of visibility of its insides. To help you extend Lectric, we've provided a simple hook system for you to tap into. Hooks have specific names and are invoked at specific times in the execution of the slider's timeline. 

Subscribing to a hook looks something like this:

    slider.on('slide', function(s, event) {
      console.log('We just moved! Our current position is:' + s.position.x);
    });

Unsubscribing from a hook looks like this:

    var handler = slider.on('slide', function(s, event) {
      console.log('We just moved! Our current position is:' + s.position.x);
    });
    slider.off('slide', handler); // Unsubscribe handler from slider

The hooks available to you are:

- `init`: Triggered after the slider is initialized
- `start`: Triggered when the user puts her finger down on the slider
- `slide`: Triggered when the position of the slider is moved
- `firstSlide`: Triggered the first time the position of the slider is moved (for a single touch event)
- `end`: Triggered when the user lifts her finger off of the slider
- `endNoSlide`: Triggered when the user lifts her finger off of the slider and did not move the slider
- `animationEnd`: Triggered when the slide animation has completed
- `nextButton`: Triggered when the next button is pressed
- `previousButton`: Triggered when the previous button is pressed

The callback function that you provide the `on` function will pass your callback two parameters: slider controller instance you are manipulating and the jQuery event object that was triggered. Having a reference to the controller object will allow you to augment the behaviour of the slider itself.
