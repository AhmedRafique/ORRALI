import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content/index';
import { evaluateAnswer } from '../exercises';

describe('Spanish B1 & B2 Symmetrical Expansion (TDD)', () => {
  const es = courses.find((c) => c.code === 'es')!;

  describe('1. Course Scale & European Triad Symmetry', () => {
    it('Spanish course contains 21 progressive units spanning A1, A2, B1, and B2', () => {
      assert.equal(es.lessons.length, 21);

      const levels = new Set(es.lessons.map((l) => l.level?.split(' · ')[0]));
      assert.ok(levels.has('A1'), 'Missing A1 in Spanish');
      assert.ok(levels.has('A2'), 'Missing A2 in Spanish');
      assert.ok(levels.has('B1'), 'Missing B1 in Spanish');
      assert.ok(levels.has('B2'), 'Missing B2 in Spanish');
    });

    it('all 21 Spanish units contain exactly 6 items (126 total phrases)', () => {
      let total = 0;
      for (const lesson of es.lessons) {
        assert.equal(lesson.items.length, 6, `Lesson ${lesson.id} does not have 6 items`);
        total += lesson.items.length;
      }
      assert.equal(total, 126);
    });
  });

  describe('2. B1/B2 Item Integrity & Grammar Capsules', () => {
    it('every Spanish item has unique ID, phonetics, usage notes, and alternatives', () => {
      const ids = new Set<string>();
      for (const lesson of es.lessons) {
        for (const item of lesson.items) {
          assert.ok(!ids.has(item.id), `Duplicate ID: ${item.id}`);
          ids.add(item.id);

          assert.ok(item.target.length > 0);
          assert.ok(item.en.length > 0);
          assert.ok((item.phonetic ?? '').length > 0);
          assert.ok((item.notes ?? '').length > 0);
          assert.ok(Array.isArray(item.alternatives));
        }
      }
    });

    it('all Spanish units have an attached Grammar Capsule with rules and examples', () => {
      for (const lesson of es.lessons) {
        assert.ok(lesson.grammarCapsule, `Missing capsule in ${lesson.id}`);
        assert.ok(lesson.grammarCapsule.examples.length >= 2);
      }
    });
  });

  describe('3. Spanish B1 & B2 Advanced Answer Evaluation', () => {
    it('evaluates Spanish hypothetical conditional with accent tolerance', () => {
      const condLesson = es.lessons.find((l) => l.id === 'es-14')!;
      const item = condLesson.items[0]; // Si tuviera más tiempo, viajaría por el mundo
      const res = evaluateAnswer('Si tuviera mas tiempo, viajaria por el mundo', item);
      assert.equal(res.ok, true);
    });

    it('evaluates Spanish subjunctive clauses', () => {
      const subjLesson = es.lessons.find((l) => l.id === 'es-15')!;
      const item = subjLesson.items[0]; // Es necesario que salgamos temprano
      const res = evaluateAnswer('Es necesario que salgamos temprano', item);
      assert.equal(res.ok, true);
    });

    it('evaluates Spanish professional correspondence', () => {
      const b2Lesson = es.lessons.find((l) => l.id === 'es-16')!;
      const item = b2Lesson.items[5]; // Quedo a su entera disposición para cualquier aclaración
      const res = evaluateAnswer('Quedo a su entera disposicion para cualquier aclaracion', item);
      assert.equal(res.ok, true);
    });
  });
});
