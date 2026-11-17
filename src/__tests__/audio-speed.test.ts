import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePlaybackRate } from '../audioSpeed';

describe('Dual-Speed Audio Engine (Normal 🔊 & Turtle 🐢) (TDD)', () => {
  it('resolves normal conversational playback rate (1.0x / 0.88 TTS)', () => {
    const rates = resolvePlaybackRate(false);
    assert.equal(rates.playerRate, 1.0);
    assert.equal(rates.ttsRate, 0.88);
  });

  it('resolves slow turtle playback rate for phonetic decomposition (0.72x / 0.60 TTS)', () => {
    const rates = resolvePlaybackRate(true);
    assert.equal(rates.playerRate, 0.72);
    assert.equal(rates.ttsRate, 0.60);
    assert.ok(rates.playerRate < 1.0, 'Turtle rate must be slower than normal');
  });
});
