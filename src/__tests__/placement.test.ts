import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPlacementResult,
  buildPlacementQuestionPool,
  evaluatePlacementLevel,
  PlacementQuestion,
} from '../placement';
import { courses } from '../content/index';
import { emptyProgress } from '../streak';
import { Progress } from '../types';

describe('Adaptive CEFR Placement Test Engine (TDD)', () => {
  const frenchCourse = courses.find((c) => c.code === 'fr')!;
  const spanishCourse = courses.find((c) => c.code === 'es')!;

  describe('1. Placement Question Pool Generation from Metadata', () => {
    it('builds question pools for A1, A2, B1, and B2 matching authentic lesson levels', () => {
      const pool = buildPlacementQuestionPool(frenchCourse);
      assert.ok(pool.A1.length === 3, 'Must pick 3 A1 questions');
      assert.ok(pool.A2.length === 3, 'Must pick 3 A2 questions');
      assert.ok(pool.B1.length === 3, 'Must pick 3 B1 questions');
      assert.ok(pool.B2.length === 3, 'Must pick 3 B2 questions');

      // Verify that A2 questions in French come from A2 units (fr-11 or fr-12), not A1!
      const a2LessonIds = new Set(['fr-11', 'fr-12']);
      for (const q of pool.A2) {
        assert.ok(
          a2LessonIds.has(q.item.id.replace(/-[0-9]+$/, '')),
          `A2 question item ${q.item.id} must originate from French A2 units!`
        );
      }
    });

    it('builds question pools for Spanish with authentic A2 units (es-9 to es-12)', () => {
      const pool = buildPlacementQuestionPool(spanishCourse);
      const a2LessonIds = new Set(['es-9', 'es-10', 'es-11', 'es-12']);
      for (const q of pool.A2) {
        assert.ok(
          a2LessonIds.has(q.item.id.replace(/-[0-9]+$/, '')),
          `A2 Spanish item ${q.item.id} must originate from Spanish A2 units!`
        );
      }
    });
  });

  describe('2. Adaptive Level Evaluation & Fast-Track Progression', () => {
    it('places beginner at A1 when A1 accuracy is below passing threshold', () => {
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
      const placed = evaluatePlacementLevel({ A1: 3, A2: 3, B1: 2, B2: 1 });
      assert.equal(placed, 'B2');
    });
  });

  describe('3. Placement Progress State Mutation (applyPlacementResult)', () => {
    it('auto-completes exactly 12 French units (10 A1 + 2 A2) when placed at B1', () => {
      const initial: Progress = emptyProgress();
      const updated = applyPlacementResult(initial, frenchCourse, 'B1');

      // French has 10 A1 units and 2 A2 units = exactly 12 completed units
      const completedLessonIds = Object.keys(updated.completed);
      assert.equal(completedLessonIds.length, 12, 'French B1 placement must unlock exactly 12 units (10 A1 + 2 A2)');

      for (const lesson of frenchCourse.lessons.slice(0, 12)) {
        assert.equal(updated.completed[lesson.id], true);
      }
      // Units 13-20 must remain uncompleted
      for (const lesson of frenchCourse.lessons.slice(12)) {
        assert.equal(updated.completed[lesson.id], undefined);
      }

      // Check retroactive diplomas for A1 and A2
      assert.ok(updated.diplomas?.[`${frenchCourse.code}-A1`], 'Should award retroactive A1 diploma');
      assert.ok(updated.diplomas?.[`${frenchCourse.code}-A2`], 'Should award retroactive A2 diploma');

      // Check dailyXp sync
      assert.ok(updated.dailyXp >= 150);
    });

    it('auto-completes exactly 12 Spanish units (8 A1 + 4 A2) when placed at B1', () => {
      const initial: Progress = emptyProgress();
      const updated = applyPlacementResult(initial, spanishCourse, 'B1');

      // Spanish has 8 A1 units and 4 A2 units = exactly 12 completed units
      const completedLessonIds = Object.keys(updated.completed);
      assert.equal(completedLessonIds.length, 12, 'Spanish B1 placement must unlock exactly 12 units (8 A1 + 4 A2)');

      for (const lesson of spanishCourse.lessons.slice(0, 12)) {
        assert.equal(updated.completed[lesson.id], true);
      }
    });

    it('auto-completes exactly 10 French units when placed at A2', () => {
      const initial: Progress = emptyProgress();
      const updated = applyPlacementResult(initial, frenchCourse, 'A2');

      const completedLessonIds = Object.keys(updated.completed);
      assert.equal(completedLessonIds.length, 10, 'French A2 placement must unlock exactly 10 A1 units');
    });

    it('awards B2 Gold Diploma when B2 questions are also mastered (>= 2/3)', () => {
      const initial: Progress = emptyProgress();
      const scores = { A1: 3, A2: 3, B1: 3, B2: 3 };
      const updated = applyPlacementResult(initial, frenchCourse, 'B2', scores);

      assert.ok(updated.diplomas?.[`${frenchCourse.code}-B2`], 'B2 Diploma must be awarded when B2 is passed');
    });

    it('preserves existing streaks and does not overwrite future lessons when placed at A1', () => {
      const initial: Progress = {
        ...emptyProgress(),
        streak: 7,
        xp: 80,
      };
      const updated = applyPlacementResult(initial, frenchCourse, 'A1');

      assert.equal(updated.streak, 7);
      assert.equal(updated.xp, 80);
      assert.equal(Object.keys(updated.completed).length, 0);
    });
  });
});
