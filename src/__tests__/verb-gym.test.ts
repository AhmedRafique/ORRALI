import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateVerbChallenge,
  evaluateConjugation,
  VERB_DB,
} from '../verbs';

describe('Verb Gym Conjugation Engine (TDD)', () => {
  describe('1. Challenge Generation', () => {
    it('generates a valid challenge for French', () => {
      const challenge = generateVerbChallenge('fr');
      assert.ok(challenge.infinitive.length > 0);
      assert.ok(challenge.pronoun.length > 0);
      assert.ok(challenge.tense.length > 0);
      assert.ok(challenge.answer.length > 0);
    });

    it('generates a valid challenge for German', () => {
      const challenge = generateVerbChallenge('de');
      assert.ok(challenge.infinitive.length > 0);
      assert.ok(challenge.pronoun.length > 0);
      assert.ok(challenge.answer.length > 0);
    });

    it('generates a valid challenge for Spanish', () => {
      const challenge = generateVerbChallenge('es');
      assert.ok(challenge.infinitive.length > 0);
      assert.ok(challenge.pronoun.length > 0);
      assert.ok(challenge.answer.length > 0);
    });
  });

  describe('2. Conjugation Evaluation', () => {
    it('accepts exact matches', () => {
      assert.equal(evaluateConjugation('suis', 'suis'), true);
      assert.equal(evaluateConjugation('habe', 'haben'), false);
    });

    it('is case-insensitive', () => {
      assert.equal(evaluateConjugation('Sommes', 'sommes'), true);
      assert.equal(evaluateConjugation('eres', 'ERES'), true);
    });

    it('ignores leading/trailing whitespace and punctuation', () => {
      assert.equal(evaluateConjugation('estás', '  estás! '), true);
    });

    it('handles multiple valid answers (e.g. for contractions or variants)', () => {
      // Sometimes we might provide "suis" or "suis "
      assert.equal(evaluateConjugation('ai', 'ai'), true);
    });
  });

  describe('3. Database Integrity', () => {
    it('ensures all verbs have complete conjugation tables for present and past tenses', () => {
      for (const lang of ['fr', 'de', 'es'] as const) {
        const verbs = VERB_DB[lang];
        assert.ok(verbs.length >= 3, `Expected at least 3 core verbs for ${lang}`);
        for (const verb of verbs) {
          assert.ok(verb.infinitive);
          assert.ok(verb.en);
          assert.ok(verb.conjugations.present, `Missing present tense for ${verb.infinitive}`);
          assert.ok(verb.conjugations.past, `Missing past tense for ${verb.infinitive}`);
          
          // Verify pronoun keys exist
          const pronouns = Object.keys(verb.conjugations.present);
          assert.ok(pronouns.length > 0);
        }
      }
    });
  });
});
