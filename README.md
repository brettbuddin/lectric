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

- `next` (selector): Next button
- `previous` (selector): Previous button
- `limitLeft` (boolean): Prohibits the slider from moving left
- `limitRight` (boolean): Prohibits the slider from moving right
- `init` (function): Function to invoke when we're done setting up the slider

## Hook System

TODO: List available hooks and explain the hooks mechanism.
