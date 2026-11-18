import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { extractExpressReviewDeck, evaluateExpressSwipe } from '../expressReview';
import { Course, Item, Progress } from '../types';
import { emptyProgress } from '../streak';

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
        { id: 'fr-1-1', target: 'Un café', en: 'A coffee' },
        { id: 'fr-1-2', target: 'Une table', en: 'A table' },
        { id: 'fr-1-3', target: 'Merci', en: 'Thank you' },
        { id: 'fr-1-4', target: 'Bonjour', en: 'Hello' },
        { id: 'fr-1-5', target: 'Au revoir', en: 'Goodbye' },
        { id: 'fr-1-6', target: 'Oui', en: 'Yes' },
      ],
    },
  ],
};

describe('3-Minute Express Review Engine (TDD)', () => {
  describe('1. Express Deck Extraction', () => {
    it('extracts exactly up to 5 urgently due cards sorted by overdue magnitude', () => {
      const p: Progress = {
        ...emptyProgress(),
        cards: {
          'fr-1-1': { due: Date.now() - 100000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 },
          'fr-1-2': { due: Date.now() - 500000, interval: 3, ease: 2.5, reps: 2, lapses: 0, lastReviewed: 0 }, // Most overdue
          'fr-1-3': { due: Date.now() + 50000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 }, // Not due
          'fr-1-4': { due: Date.now() - 5000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 },
          'fr-1-5': { due: Date.now() - 1000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 },
          'fr-1-6': { due: Date.now() - 2000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 },
        },
      };

      const deck = extractExpressReviewDeck(mockCourse, p);
      assert.equal(deck.length, 5); // Excludes the 1 not-due card
      
      // The most overdue card (fr-1-2) should be first
      assert.equal(deck[0].item.id, 'fr-1-2');
    });

    it('returns an empty array if no cards are due', () => {
      const p: Progress = {
        ...emptyProgress(),
        cards: {
          'fr-1-1': { due: Date.now() + 100000, interval: 1, ease: 2.5, reps: 1, lapses: 0, lastReviewed: 0 },
        },
      };
      const deck = extractExpressReviewDeck(mockCourse, p);
      assert.equal(deck.length, 0);
    });
  });

  describe('2. Express Swipe Evaluation', () => {
    it('returns isOk: true and +3 XP for a "knew_it" swipe', () => {
      const res = evaluateExpressSwipe('knew_it');
      assert.equal(res.isOk, true);
      assert.equal(res.earnedXp, 3);
    });

    it('returns isOk: false and +1 XP for a "needs_practice" swipe', () => {
      const res = evaluateExpressSwipe('needs_practice');
      assert.equal(res.isOk, false);
      assert.equal(res.earnedXp, 1);
    });
  });
});
