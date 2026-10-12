import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBrokenAudioUrl,
  isPlayableAudioUrl,
  sanitizeAudioUrl
} from '../src/utils/audioUrl.ts';

test('rejects deprecated Google Actions sound URLs', () => {
  assert.equal(
    isBrokenAudioUrl('https://actions.google.com/sounds/v1/water/gentle_stream_spring.ogg'),
    true
  );
  assert.equal(
    isPlayableAudioUrl('https://actions.google.com/sounds/v1/water/gentle_stream_spring.ogg'),
    false
  );
  assert.equal(
    sanitizeAudioUrl('https://actions.google.com/sounds/v1/water/gentle_stream_spring.ogg'),
    ''
  );
});

test('accepts Cloudinary and relative audio URLs', () => {
  assert.equal(
    isPlayableAudioUrl('https://res.cloudinary.com/demo/video/upload/v1/song.mp3'),
    true
  );
  assert.equal(isPlayableAudioUrl('/audio/demo.mp3'), true);
  assert.equal(isPlayableAudioUrl(''), false);
  assert.equal(isPlayableAudioUrl(undefined), false);
});
