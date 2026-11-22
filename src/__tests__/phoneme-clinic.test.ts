import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MINIMAL_PAIRS_CATALOG,
  getMinimalPairsByLanguage,
  getMinimalPairById,
  buildPhonemeSprint,
  evaluatePhonemeSprintAnswer,
} from '../audio/phonemeClinic';

describe('Minimal Pairs & Phoneme Diagnostic Clinic (TDD)', () => {
  describe('1. European Triad Phonetic Catalog Integrity', () => {
    it('provides rich minimal pairs for French, German, and Spanish', () => {
      const frPairs = getMinimalPairsByLanguage('fr');
      const dePairs = getMinimalPairsByLanguage('de');
      const esPairs = getMinimalPairsByLanguage('es');

      assert.ok(frPairs.length >= 4, 'French catalog should have at least 4 pairs');
      assert.ok(dePairs.length >= 4, 'German catalog should have at least 4 pairs');
      assert.ok(esPairs.length >= 4, 'Spanish catalog should have at least 4 pairs');
    });

    it('verifies all pairs have distinct phonemes, sentences, and mouth mechanics', () => {
      for (const pair of MINIMAL_PAIRS_CATALOG) {
        assert.ok(pair.id.length > 0);
        assert.ok(pair.wordA.length > 0 && pair.wordB.length > 0);
        assert.notEqual(pair.wordA, pair.wordB);
        assert.ok(pair.phonemeA.length > 0 && pair.phonemeB.length > 0);
        assert.ok(pair.sentenceA.toLowerCase().includes(pair.wordA.toLowerCase()));
        assert.ok(pair.sentenceB.toLowerCase().includes(pair.wordB.toLowerCase()));
        assert.ok(pair.mouthMechanicsA.tonguePosition.length > 0);
        assert.ok(pair.mouthMechanicsA.lipRounding.length > 0);
        assert.ok(pair.mouthMechanicsB.tonguePosition.length > 0);
        assert.ok(pair.mouthMechanicsB.lipRounding.length > 0);
        assert.ok(pair.acousticTip.length > 0);
      }
    });

    it('retrieves specific minimal pair by ID', () => {
      const pair = getMinimalPairById('fr-pair-tu-tout');
      assert.ok(pair);
      assert.equal(pair?.wordA, 'tu');
      assert.equal(pair?.wordB, 'tout');
      assert.equal(pair?.phonemeA, '/y/');
      assert.equal(pair?.phonemeB, '/u/');
    });
  });

  describe('2. Dynamic Sprint Challenge Generation', () => {
    it('builds a randomized sprint challenge deck for French', () => {
      const sprint = buildPhonemeSprint('fr', 3);
      assert.equal(sprint.length, 3);
      for (const ch of sprint) {
        assert.ok(ch.options.length === 2);
        assert.ok(['A', 'B'].includes(ch.targetChoice));
        assert.ok(ch.playedWord === ch.pair.wordA || ch.playedWord === ch.pair.wordB);
        assert.ok(ch.targetSentence.length > 0);
        assert.ok(ch.targetPhoneme.length > 0);
      }
    });

    it('builds a randomized sprint challenge deck for German and Spanish', () => {
      const deSprint = buildPhonemeSprint('de', 2);
      assert.equal(deSprint.length, 2);

      const esSprint = buildPhonemeSprint('es', 2);
      assert.equal(esSprint.length, 2);
    });

    it('handles requests larger than catalog pool gracefully', () => {
      const largeSprint = buildPhonemeSprint('es', 100);
      const totalEs = getMinimalPairsByLanguage('es').length;
      assert.equal(largeSprint.length, totalEs);
    });
  });

  describe('3. Auditory Evaluation & Mouth Mechanics Feedback', () => {
    it('evaluates correct discrimination with 20 XP and mouth mechanics tip', () => {
      const sprint = buildPhonemeSprint('de', 1);
      const challenge = sprint[0];
      const correctChoice = challenge.targetChoice;

      const result = evaluatePhonemeSprintAnswer(challenge, correctChoice);
      assert.equal(result.isCorrect, true);
      assert.equal(result.earnedXp, 20);
      assert.equal(result.selectedKey, correctChoice);
      assert.ok(result.feedback.includes('Exact acoustic discrimination'));
      assert.ok(result.mouthTip.includes('Tongue:'));
      assert.ok(result.mouthTip.includes('Lips:'));
    });

    it('evaluates incorrect discrimination with 5 constructive XP and contrast debrief', () => {
      const sprint = buildPhonemeSprint('es', 1);
      const challenge = sprint[0];
      const wrongChoice = challenge.targetChoice === 'A' ? 'B' : 'A';

      const result = evaluatePhonemeSprintAnswer(challenge, wrongChoice);
      assert.equal(result.isCorrect, false);
      assert.equal(result.earnedXp, 5);
      assert.equal(result.selectedKey, wrongChoice);
      assert.ok(result.feedback.includes('Phonetic slip'));
      assert.ok(result.mouthTip.includes('Check your articulation'));
    });
  });
});
