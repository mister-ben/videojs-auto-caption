import videojs from 'video.js';
import {version as VERSION} from '../package.json';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Enables the best matching caption
 *
 * @function update
 */
const update = function() {
  const lang = this.language();
  const tracks = this.textTracks();
  const matches = {
    exact: [],
    twoletter: [],
    fallback: [],
    default: []
  };
  const candidateTracks = Array.prototype.filter.call(tracks, t => {
    return t.kind === 'subtitles' || t.kind === 'captions';
  });

  candidateTracks.forEach(t => {
    // Player normalises language to lower case
    const trackLang = t.language.toLowerCase();

    // `en-US` ~= `en` ~= `en-GB`
    if (trackLang.split('-')[0] === lang.split('-')[0]) {
      matches.twoletter.push(t);

      // `en-US` === `en-US`
      if (trackLang === lang) {
        matches.exact.push(t);
      }
    }
    // Honour the default if a language didn't match
    if (t.default) {
      matches.default.push(t);
    }
  });

  // Join arrays to order preference
  const selectedTracks = matches.exact
    .concat(matches.twoletter)
    .concat(matches.defaultMatches);

  if (selectedTracks.length > 0) {
    const selectedTrack = selectedTracks[0];

    for (let i = 0; i < tracks.length; i++) {
      if (tracks[i] === selectedTrack) {
        tracks[i].mode = 'showing';
      } else {
        tracks[i].mode = 'disabled';
      }
    }
  }
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-auto-caption');
  if (player.usingPlugin('perSourceBehaviors')) {
    player.on('sourcechanged', function() {
      player.onePerSrc('canplay', update);
    });
  } else {
    player.one('canplay', update);
  }
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function autoCaption
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const autoCaption = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('autoCaption', autoCaption);

// Include the version number.
autoCaption.VERSION = VERSION;

export default autoCaption;
