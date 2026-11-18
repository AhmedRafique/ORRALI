import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPlacementResult,
  buildPlacementQuestionPool,
  evaluatePlacementLevel,
  PlacementQuestion,
} from '../placement';
import { courses } from '../content';
import { emptyProgress } from '../streak';
import { Progress } from '../types';

describe('Adaptive CEFR Placement Test Engine (TDD)', () => {
  const course = courses[0]; // French course (20 units: A1, A2, B1, B2)

  describe('1. Placement Question Pool Generation', () => {
    it('builds question pools for A1, A2, B1, and B2 with 4 unique options each', () => {
      const pool = buildPlacementQuestionPool(course);
      assert.ok(pool.A1.length >= 3, 'Must have at least 3 A1 questions');
      assert.ok(pool.A2.length >= 3, 'Must have at least 3 A2 questions');
      assert.ok(pool.B1.length >= 3, 'Must have at least 3 B1 questions');
      assert.ok(pool.B2.length >= 3, 'Must have at least 3 B2 questions');

      for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
        for (const q of pool[level]) {
          assert.ok(q.item.target.length > 0);
          assert.equal(q.options.length, 4);
          assert.ok(q.options.includes(q.item.target));
        }
      }
    });
  });

  describe('2. Adaptive Level Evaluation', () => {
    it('places beginner at A1 when A1 accuracy is below passing threshold', () => {
      // 1 out of 3 correct in A1 -> stays A1
      const placed = evaluatePlacementLevel({ A1: 1, A2: 0, B1: 0, B2: 0 });
      assert.equal(placed, 'A1');
    });

    it('advances to A2 when A1 is passed (>= 2/3) but A2 is failed', () => {
      const placed = evaluatePlacementLevel({ A1: 3, A2: 1, B1: 0, B2: 0 });
      assert.equal(placed, 'A2');
    });

    it('advances to B1 when A1 and A2 are passed but B1 is failed', () => {
      const placed = evaluatePlacementLevel({ A1: 3, A2: 2, B1: 1, B2: 0 });
      assert.equal(placed, 'B1');
    });

    it('advances to B2 when A1, A2, and B1 are mastered (>= 2/3 each)', () => {
      const placed = evaluatePlacementLevel({ A1: 3, A2: 3, B1: 2, B2: 2 });
      assert.equal(placed, 'B2');
    });
  });

  describe('3. Placement Progress State Mutation (applyPlacementResult)', () => {
    it('auto-completes prerequisite chapters, sets mature SM-2 cards, and awards diplomas when placed at B1', () => {
      const initial: Progress = emptyProgress();
      const updated = applyPlacementResult(initial, course, 'B1');

      // Placed at B1 -> A1 (units 1-5) and A2 (units 6-10) should be completed
      const a1Lessons = course.lessons.slice(0, 5);
      const a2Lessons = course.lessons.slice(5, 10);

      for (const lesson of [...a1Lessons, ...a2Lessons]) {
        assert.equal(updated.completed[lesson.id], true, `Lesson ${lesson.id} should be marked completed`);
        for (const item of lesson.items) {
          const card = updated.cards[item.id];
          assert.ok(card, `Card ${item.id} should be initialized`);
          assert.ok(card.interval >= 21, `Card ${item.id} should have mature interval >= 21 days`);
          assert.ok(card.reps >= 5, `Card ${item.id} should have mature reps >= 5`);
        }
      }

      // Check retroactive diplomas for A1 and A2
      assert.ok(updated.diplomas?.[`${course.code}-A1`], 'Should award retroactive A1 diploma');
      assert.ok(updated.diplomas?.[`${course.code}-A2`], 'Should award retroactive A2 diploma');

      // Check XP bounty awarded
      assert.ok(updated.xp >= 150, `Expected XP bounty >= 150, got ${updated.xp}`);
    });

    it('preserves existing streaks and does not overwrite future lessons when placed at A1', () => {
      const initial: Progress = {
        ...emptyProgress(),
        streak: 7,
        xp: 80,
      };
      const updated = applyPlacementResult(initial, course, 'A1');

      assert.equal(updated.streak, 7);
      assert.equal(updated.xp, 80);
      assert.equal(Object.keys(updated.completed).length, 0);
    });
  });
});
