import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePronunciation } from '../scoring';

describe('Real Pronunciation Assessment & Anti-Gibberish Detection (TDD)', () => {
  it('REJECTS gibberish or random noises with a failing score', () => {
    // Target: German "Guten Morgen"
    // Learner said gibberish: "asdf blabla waka"
    const result = evaluatePronunciation('Guten Morgen', 1200, 'asdf blabla waka');

    assert.equal(result.passed, false, 'Gibberish must NOT pass pronunciation test!');
    assert.ok(result.overallScore < 50, `Expected low score for gibberish, got ${result.overallScore}`);
    assert.ok(result.words.every((w) => w.status === 'retry'));
  });

  it('REJECTS words spoken in a completely different language', () => {
    // Target: French "Bonjour, comment allez-vous ?"
    // Learner spoke English instead: "Hello how are you doing today"
    const result = evaluatePronunciation(
      'Bonjour, comment allez-vous ?',
      1600,
      'Hello how are you doing today'
    );

    assert.equal(result.passed, false, 'Speaking English in a French drill must NOT pass!');
    assert.ok(result.overallScore < 50);
  });

  it('REJECTS silence, empty transcript, or unverified background noise', () => {
    // No intelligible speech detected
    const result = evaluatePronunciation('S’il vous plaît', 1200, '');

    assert.equal(result.passed, false, 'Empty transcript must fail!');
    assert.ok(result.overallScore <= 35);
    assert.ok(result.feedback.toLowerCase().includes('no clear speech'));
  });

  it('ACCEPTS authentic native or near-native pronunciation', () => {
    // Target: "Guten Morgen, wie geht es Ihnen?"
    // Learner spoke accurately
    const result = evaluatePronunciation(
      'Guten Morgen, wie geht es Ihnen?',
      1800,
      'Guten Morgen wie geht es Ihnen'
    );

    assert.equal(result.passed, true);
    assert.ok(result.overallScore >= 90);
    assert.ok(result.words.every((w) => w.status === 'great' || w.status === 'good'));
  });

  it('ACCEPTS minor accent variations with encouraging constructive score', () => {
    // Target: "Je voudrais un café"
    // Minor phoneme slip: "Je voudrais un cafe"
    const result = evaluatePronunciation(
      'Je voudrais un café',
      1400,
      'Je voudrais un cafe'
    );

    assert.equal(result.passed, true);
    assert.ok(result.overallScore >= 80);
  });
});
