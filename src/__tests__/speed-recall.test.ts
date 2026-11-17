import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { generateSpeedDeck, calculateSpeedScore } from '../speedRecall';

describe('60-Second Speed Recall Challenge Engine (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;
  const es = courses.find((c) => c.code === 'es')!;

  describe('1. Speed Deck Generator', () => {
    it('generates a fast-paced challenge deck with close pedagogical distractors', () => {
      const deck = generateSpeedDeck(fr, 15);

      assert.equal(deck.length, 15);
      for (const q of deck) {
        assert.ok(q.item.id.startsWith('fr-'));
        assert.ok(q.promptEn.length > 0);
        assert.ok(q.correctTarget.length > 0);
        assert.equal(q.options.length, 4);
        assert.ok(q.options.includes(q.correctTarget));
      }
    });

    it('works across all courses (French, German, and Spanish)', () => {
      for (const course of [fr, de, es]) {
        const deck = generateSpeedDeck(course, 10);
        assert.equal(deck.length, 10);
        assert.ok(deck.every((q) => q.options.length === 4));
      }
    });
  });

  describe('2. Speed Score & Tier Evaluation', () => {
    it('evaluates Diamond rank for high-speed mastery (>= 90% accuracy & >= 10 correct)', () => {
      const score = calculateSpeedScore(12, 13, 8); // 12/13 correct, combo 8
      assert.equal(score.rank, 'Diamond');
      assert.ok(score.accuracy >= 90);
      assert.ok(score.totalXp >= 25);
    });

    it('evaluates Gold rank for solid performance (>= 80% accuracy & >= 7 correct)', () => {
      const score = calculateSpeedScore(8, 10, 5); // 8/10 correct
      assert.equal(score.rank, 'Gold');
      assert.equal(score.accuracy, 80);
      assert.ok(score.totalXp >= 18);
    });

    it('evaluates Silver and Bronze ranks gracefully with constructive XP', () => {
      const silver = calculateSpeedScore(5, 7, 3);
      assert.equal(silver.rank, 'Silver');
      assert.ok(silver.totalXp >= 10);

      const bronze = calculateSpeedScore(2, 6, 1);
      assert.equal(bronze.rank, 'Bronze');
      assert.ok(bronze.totalXp >= 5);
    });

    it('handles zero correct answers safely without division by zero', () => {
      const zero = calculateSpeedScore(0, 0, 0);
      assert.equal(zero.rank, 'Bronze');
      assert.equal(zero.accuracy, 0);
      assert.equal(zero.totalXp, 0);
    });
  });
});
