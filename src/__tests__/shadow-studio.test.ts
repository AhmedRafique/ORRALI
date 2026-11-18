import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildShadowingDeck, evaluateShadowingAttempt } from '../shadowStudio';
import { Course } from '../types';

const mockCourse: Course = {
  code: 'fr',
  name: 'French',
  flag: '🇫🇷',
  speechLang: 'fr-FR',
  lessons: [
    {
      id: 'fr-1',
      title: 'Au Café',
      subtitle: 'Café essentials',
      items: [
        { id: 'fr-1-1', target: 'Bonjour', en: 'Hello' },
        { id: 'fr-1-2', target: "S'il vous plaît", en: 'Please' },
        { id: 'fr-1-3', target: 'Je voudrais un café', en: 'I would like a coffee' },
        { id: 'fr-1-4', target: "L'addition, s'il vous plaît", en: 'The check, please' },
      ],
    },
    {
      id: 'fr-2',
      title: 'La Gare',
      subtitle: 'Train essentials',
      items: [
        { id: 'fr-2-1', target: 'Un billet pour Paris', en: 'A ticket to Paris' },
      ],
    }
  ],
};

describe('Shadowing Studio Mimicry Engine (TDD)', () => {
  describe('1. Shadowing Deck Generation', () => {
    it('extracts a randomly shuffled deck of 5 phrases from the course', () => {
      const deck = buildShadowingDeck(mockCourse, 5);
      assert.equal(deck.length, 5);
      assert.ok(deck[0].item.target);
      assert.ok(deck[0].lessonTitle);
    });

    it('handles requests larger than the available course items safely', () => {
      const deck = buildShadowingDeck(mockCourse, 20);
      assert.equal(deck.length, 5); // Only 5 items total in the mock course
    });
  });

  describe('2. Shadowing Evaluation (Acoustic + Transcript)', () => {
    it('returns a high score and positive feedback for an exact match', () => {
      const challenge = buildShadowingDeck(mockCourse, 1)[0];
      const result = evaluateShadowingAttempt(challenge.item, challenge.item.target);
      
      assert.ok(result.overallScore >= 90);
      assert.equal(result.passed, true);
      assert.ok(result.feedback.toLowerCase().includes('native') || result.feedback.toLowerCase().includes('magnifique'));
    });

    it('returns a failing score and constructive feedback for gibberish', () => {
      const challenge = buildShadowingDeck(mockCourse, 1)[0];
      const result = evaluateShadowingAttempt(challenge.item, 'asdf random words');
      
      assert.ok(result.overallScore < 50);
      assert.equal(result.passed, false);
    });
  });
});
