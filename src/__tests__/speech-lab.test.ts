import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePronunciation } from '../scoring';

describe('Real-Time Acoustic Waveform & Speech Lab Engine (TDD)', () => {
  it('computes acoustic cadence score and speech envelope ratio', () => {
    // Target: "Bonjour, comment allez-vous ?" (3 words, ~1500ms expected)
    const result = evaluatePronunciation('Bonjour, comment allez-vous ?', 1450);

    assert.ok(result.overallScore >= 70);
    assert.equal(result.passed, true);
    assert.ok(result.feedback.length > 0);
    assert.equal(result.words.length, 3);
  });

  it('detects cadence mismatch when speech is unnaturally rushed or truncated', () => {
    // 3-word sentence spoken in 200ms -> rushed/truncated (< 400ms)
    const rushed = evaluatePronunciation('Bonjour, comment allez-vous ?', 200);
    assert.equal(rushed.passed, false);
    assert.ok(rushed.feedback.toLowerCase().includes('short'));
  });

  it('detects cadence mismatch when speech is unnaturally dragged out or silent', () => {
    // 1-word greeting spoken over 8000ms
    const dragged = evaluatePronunciation('Bonjour', 8500);
    assert.equal(dragged.passed, false);
    assert.ok(dragged.overallScore < 60);
  });
});
