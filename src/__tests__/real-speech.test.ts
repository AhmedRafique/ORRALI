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

  it('handles contraction splitting and token alignment without collapsing score', () => {
    // Target has contraction: "S'il vous plaît" -> recognizer returns "s il vous plait"
    const result = evaluatePronunciation(
      "S'il vous plaît",
      1300,
      's il vous plait'
    );

    assert.equal(result.passed, true, 'Contraction splitting must NOT fail pronunciation!');
    assert.ok(result.overallScore >= 75, `Expected score >= 75, got ${result.overallScore}`);
  });

  it('confidence-building threshold accepts partially understood speech (>= 50%) with encouraging guidance', () => {
    // 3 out of 4 words caught clearly: "Buenos días, mucho gusto" -> "buenos dias gusto"
    const result = evaluatePronunciation(
      'Buenos días, mucho gusto',
      1600,
      'buenos dias gusto'
    );

    assert.equal(result.passed, true, 'Speech with >= 50% matching words should pass!');
    assert.ok(result.overallScore >= 50);
    assert.ok(result.feedback.toLowerCase().includes('understood'));
  });

  it('REJECTS inverted or scrambled word order in speech recognition', () => {
    // Target: "Je suis prêt"
    // Learner said words in reversed order: "prêt suis je"
    const result = evaluatePronunciation('Je suis prêt', 1200, 'prêt suis je');

    assert.equal(result.passed, false, 'Inverted word order must NOT pass pronunciation test!');
    assert.ok(result.overallScore < 50, `Expected low score for inverted order, got ${result.overallScore}`);
  });
});
