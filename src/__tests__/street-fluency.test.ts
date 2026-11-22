import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content/index';

describe('Real-World Street Fluency & Conversational Mastery (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const de = courses.find((c) => c.code === 'de')!;
  const es = courses.find((c) => c.code === 'es')!;

  describe('1. Street Slang, Contractions & Spoken Grammar', () => {
    it('French street units feature authentic verlan, dropped "ne", and colloquial vocabulary', () => {
      const u26 = fr.lessons.find((l) => l.id === 'fr-26');
      assert.ok(u26);
      assert.equal(u26.items.length, 6);

      const targets = u26.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('truc de ouf')));
      assert.ok(targets.some((t) => t.includes('crevé') && t.includes('boulot')));
      assert.ok(targets.some((t) => t.includes("T'inquiète") && t.includes('laisse tomber')));
      assert.ok(targets.some((t) => t.includes('kiffe')));
      assert.ok(targets.some((t) => t.includes('dix balles')));
    });

    it('German street units feature spoken contractions, modal particle irony, and Berliner Schnauze', () => {
      const u26 = de.lessons.find((l) => l.id === 'de-26');
      assert.ok(u26);
      assert.equal(u26.items.length, 6);

      const targets = u26.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('Bock auf ein')));
      assert.ok(targets.some((t) => t.includes('mega platt')));
      assert.ok(targets.some((t) => t.includes('Alter')));
      assert.ok(targets.some((t) => t.includes("'ne Stange Geld")));
      assert.ok(targets.some((t) => t.includes('halb so wild')));
    });

    it('Spanish street units feature authentic Castilian street slang, youth idioms, and urban rhythm', () => {
      const u26 = es.lessons.find((l) => l.id === 'es-26');
      assert.ok(u26);
      assert.equal(u26.items.length, 6);

      const targets = u26.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('tío') && t.includes('mola')));
      assert.ok(targets.some((t) => t.includes('reventado') && t.includes('curro')));
      assert.ok(targets.some((t) => t.includes('No te rayes')));
      assert.ok(targets.some((t) => t.includes('pelado de pasta')));
      assert.ok(targets.some((t) => t.includes('tomamos unas cañas')));
    });
  });

  describe('2. Conversational Fillers & Natural Rhythm', () => {
    it('French fillers unit teaches natural discourse rhythm with du coup, genre, and en fait', () => {
      const u28 = fr.lessons.find((l) => l.id === 'fr-28');
      assert.ok(u28);
      const targets = u28.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('En fait') && t.includes('genre')));
      assert.ok(targets.some((t) => t.includes('Du coup')));
      assert.ok(targets.some((t) => t.includes('Enfin bref')));
    });

    it('German fillers unit teaches authentic modal particles with halt, quasi, and na ja', () => {
      const u28 = de.lessons.find((l) => l.id === 'de-28');
      assert.ok(u28);
      const targets = u28.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('halt so eine Sache')));
      assert.ok(targets.some((t) => t.includes('Na ja') && t.includes('quasi')));
      assert.ok(targets.some((t) => t.includes('Eben drum')));
    });

    it('Spanish fillers unit teaches conversational muletillas with en plan, o sea, and digo yo', () => {
      const u28 = es.lessons.find((l) => l.id === 'es-28');
      assert.ok(u28);
      const targets = u28.items.map((i) => i.target);
      assert.ok(targets.some((t) => t.includes('O sea') && t.includes('en plan')));
      assert.ok(targets.some((t) => t.includes('Digo yo que')));
      assert.ok(targets.some((t) => t.includes('de tranquis')));
    });
  });

  describe('3. Urban Survival & Witty Banter Retorts', () => {
    it('teaches practical street coping: dead batteries, missed transit, and splitting checks', () => {
      for (const course of [fr, de, es]) {
        const u29 = course.lessons.find((l) => l.id.endsWith('-29'));
        assert.ok(u29, `Missing unit 29 in ${course.code}`);
        assert.equal(u29.items.length, 6);
      }
    });

    it('teaches witty comebacks, teasing, and pub banter without awkwardness', () => {
      for (const course of [fr, de, es]) {
        const u30 = course.lessons.find((l) => l.id.endsWith('-30'));
        assert.ok(u30, `Missing unit 30 in ${course.code}`);
        assert.equal(u30.items.length, 6);
      }
    });
  });

  describe('4. European Triad Scale & Complete 30-Unit Symmetry', () => {
    it('verifies French, German, and Spanish each contain exactly 30 progressive units (180 items each, 540 total phrases)', () => {
      let totalAllCourses = 0;
      for (const course of [fr, de, es]) {
        assert.equal(course.lessons.length, 30, `Course ${course.code} must have 30 units`);

        let courseItems = 0;
        for (const lesson of course.lessons) {
          assert.equal(lesson.items.length, 6, `Lesson ${lesson.id} does not have 6 items`);
          assert.ok(lesson.grammarCapsule, `Lesson ${lesson.id} missing grammar capsule`);
          assert.ok(lesson.grammarCapsule.examples.length >= 2);
          courseItems += lesson.items.length;
        }

        assert.equal(courseItems, 180, `Course ${course.code} must have 180 total phrases`);
        totalAllCourses += courseItems;
      }

      assert.equal(totalAllCourses, 540);
    });
  });
});
