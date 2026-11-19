import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content/index';
import { evaluateAnswer } from '../exercises';

describe('CEFR A2 & B1 Curriculum Expansion (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;

  describe('1. Course Scale & Levels', () => {
    it('French course includes progressive units across A1, A2, and B1', () => {
      assert.ok(fr.lessons.length >= 15);

      const levels = new Set(fr.lessons.map((l) => l.level?.split(' · ')[0]));
      assert.ok(levels.has('A1'), 'Missing A1 units in French');
      assert.ok(levels.has('A2'), 'Missing A2 units in French');
      assert.ok(levels.has('B1'), 'Missing B1 units in French');
    });

    it('German course includes progressive units across A1, A2, and B1', () => {
      assert.ok(de.lessons.length >= 15);

      const levels = new Set(de.lessons.map((l) => l.level?.split(' · ')[0]));
      assert.ok(levels.has('A1'), 'Missing A1 units in German');
      assert.ok(levels.has('A2'), 'Missing A2 units in German');
      assert.ok(levels.has('B1'), 'Missing B1 units in German');
    });

    it('all units contain exactly 6 items each', () => {
      let total = 0;
      for (const course of [fr, de]) {
        for (const lesson of course.lessons) {
          assert.equal(lesson.items.length, 6, `Lesson ${lesson.id} does not have 6 items`);
          total += lesson.items.length;
        }
      }
      assert.equal(total, 240);
    });
  });

  describe('2. Item Integrity & Completeness', () => {
    it('every item across all 30 units has unique ID, phonetics, notes, and alternatives', () => {
      const seenIds = new Set<string>();

      for (const course of [fr, de]) {
        for (const lesson of course.lessons) {
          for (const item of lesson.items) {
            assert.ok(!seenIds.has(item.id), `Duplicate item ID: ${item.id}`);
            seenIds.add(item.id);

            assert.ok(item.target.length > 0, `Empty target in ${item.id}`);
            assert.ok(item.en.length > 0, `Empty en in ${item.id}`);
            assert.ok((item.phonetic ?? '').length > 0, `Missing phonetic in ${item.id}`);
            assert.ok((item.notes ?? '').length > 0, `Missing notes in ${item.id}`);
            assert.ok(Array.isArray(item.alternatives), `Missing alternatives array in ${item.id}`);
          }
        }
      }
    });

    it('every unit has an attached Grammar Capsule with rules and examples', () => {
      for (const course of [fr, de]) {
        for (const lesson of course.lessons) {
          assert.ok(lesson.grammarCapsule, `Lesson ${lesson.id} is missing a grammarCapsule`);
          assert.ok(lesson.grammarCapsule.title.length > 0);
          assert.ok(lesson.grammarCapsule.summary.length > 0);
          assert.ok(lesson.grammarCapsule.explanation.length > 0);
          assert.ok(lesson.grammarCapsule.examples.length >= 2);
        }
      }
    });
  });

  describe('3. Advanced Grammar & Answer Evaluation', () => {
    it('evaluates French Passé Composé with accent leniency', () => {
      const pastLesson = fr.lessons.find((l) => l.id === 'fr-11')!;
      const item = pastLesson.items[0]; // Hier, j'ai visité le musée
      const res = evaluateAnswer("Hier j'ai visite le musee", item);
      assert.equal(res.ok, true);
    });

    it('evaluates German Perfekt with separable/irregular verbs', () => {
      const pastLesson = de.lessons.find((l) => l.id === 'de-11')!;
      const item = pastLesson.items[0]; // Gestern habe ich das Museum besucht
      const res = evaluateAnswer('Gestern habe ich das Museum besucht', item);
      assert.equal(res.ok, true);
    });

    it('evaluates French Conditionnel and Subjonctif', () => {
      const condLesson = fr.lessons.find((l) => l.id === 'fr-14')!;
      const item = condLesson.items[1]; // Ce serait merveilleux
      const res = evaluateAnswer('Ce serait merveilleux', item);
      assert.equal(res.ok, true);
    });

    it('evaluates German Konjunktiv II (Wünsche & Höflichkeit)', () => {
      const konjLesson = de.lessons.find((l) => l.id === 'de-14')!;
      const item = konjLesson.items[1]; // Das wäre wirklich wunderbar
      const res = evaluateAnswer('Das waere wirklich wunderbar', item);
      assert.equal(res.ok, true);
    });
  });
});
