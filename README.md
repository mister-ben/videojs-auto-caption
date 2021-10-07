# videojs-auto-caption

Automatically enables the caption or subtitle track best matching the player language. The plugin name is a bit stupid, as it's nothing to do with automatically _generating_ captions.

Language codes are considered case-insensitively. If one or more track with a `kind` of `captions` or `subtitles` with an exactly matching language code, the first will be selected.

If there is no exact match, the first `captions` or `subtitles` track where the first part of the language code matches is selected, so `en-US` would match `en` or `en-gb`.

If there is not a match based on language, the first `captions` or `subtitles` track with `default` = `true` will be selected.

The player language itself is either explicitly set as an option or is derived from the closest element with a `lang` attribute. See [Video.js docs](https://docs.videojs.com/tutorial-languages.html#determining-player-language).

## Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->
## Installation

```sh
npm install --save videojs-auto-caption
```

## Usage

To include videojs-auto-caption on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-auto-caption.min.js"></script>
<script>
  var player = videojs('my-video');

  player.autoCaption();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-auto-caption via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-auto-caption');

var player = videojs('my-video');

player.autoCaption();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-auto-caption'], function(videojs) {
  var player = videojs('my-video');

  player.autoCaption();
});
```

## License

Apache-2.0. Copyright (c) mister-ben &lt;git@misterben.me&gt;


[videojs]: http://videojs.com/
