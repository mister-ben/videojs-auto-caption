import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-auto-caption', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!
    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    typeof Player.prototype.autoCaption,
    'function',
    'videojs-auto-caption plugin was registered'
  );

  this.player.autoCaption();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-auto-caption'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('selects correct track', function(assert) {

  // On Safari added tracks don't appear quickly enough for automated testing...
  assert.expect(1);
  if (videojs.browser.IS_ANY_SAFARI) {
    assert.ok(true, 'skipped test on Safari');
    return;
  }

  this.player.autoCaption();

  this.player.src({src: 'mp4-with-audio.mp4', type: 'video/mp4'});

  this.player.addTextTrack('subtitles', 'Deutsch', 'de');
  this.player.addTextTrack('subtitles', 'Français', 'fr');
  this.player.addTextTrack('subtitles', 'Italiano', 'it');
  this.player.language('fr');

  this.clock.tick(1);
  this.player.trigger('canplay');

  const selectedTrack = Array.prototype.find.call(this.player.textTracks(), t => {
    return t.mode === 'showing';
  });

  assert.strictEqual(
    selectedTrack.language, 'fr',
    'track matching language selected'
  );
});

QUnit.test('selects exactly matching track', function(assert) {

  // On Safari added tracks don't appear quickly enough for automated testing...
  assert.expect(1);
  if (videojs.browser.IS_ANY_SAFARI) {
    assert.ok(true, 'skipped test on Safari');
    return;
  }

  this.player.addRemoteTextTrack({language: 'de', kind: 'subtitles'});
  this.player.addRemoteTextTrack({language: 'de-at', kind: 'subtitles'});
  this.player.language('de-at');
  this.player.autoCaption();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);
  this.player.trigger('canplay');

  const selectedTrack = Array.prototype.find.call(this.player.textTracks(), t => {
    return t.mode === 'showing';
  });

  assert.strictEqual(
    selectedTrack.language, 'de-at',
    'track exactly matching takes precedence'
  );
});

QUnit.test('fuzzy matches on two letter code', function(assert) {

  // On Safari added tracks don't appear quickly enough for automated testing...
  assert.expect(1);
  if (videojs.browser.IS_ANY_SAFARI) {
    assert.ok(true, 'skipped test on Safari');
    return;
  }

  this.player.addRemoteTextTrack({language: 'fr', kind: 'subtitles'});
  this.player.addRemoteTextTrack({language: 'de-at', kind: 'subtitles'});
  this.player.language('de-de');
  this.player.autoCaption();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);
  this.player.trigger('canplay');

  const selectedTrack = Array.prototype.find.call(this.player.textTracks(), t => {
    return t.mode === 'showing';
  });

  assert.strictEqual(
    selectedTrack.language, 'de-at',
    'track matching two letter code is selected'
  );
});

QUnit.test('matches case insensitively', function(assert) {

  // On Safari added tracks don't appear quickly enough for automated testing...
  assert.expect(1);
  if (videojs.browser.IS_ANY_SAFARI) {
    assert.ok(true, 'skipped test on Safari');
    return;
  }

  this.player.addRemoteTextTrack({language: 'fr', kind: 'subtitles'});
  this.player.addRemoteTextTrack({language: 'de-DE', kind: 'subtitles'});
  this.player.language('de-de');
  this.player.autoCaption();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);
  this.player.trigger('canplay');

  const selectedTrack = Array.prototype.find.call(this.player.textTracks(), t => {
    return t.mode === 'showing';
  });

  assert.strictEqual(
    selectedTrack.language, 'de-DE',
    'track with different case matches'
  );
});
