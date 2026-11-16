import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses, stories } from '../content';
import { evaluateAnswer } from '../exercises';

describe('Spanish Multi-Language World Expansion (TDD)', () => {
  it('includes Spanish course with valid speech code and metadata', () => {
    const es = courses.find((c) => c.code === 'es');
    assert.ok(es, 'Spanish course is missing');
    assert.equal(es.name, 'Español');
    assert.equal(es.flag, '🇪🇸');
    assert.equal(es.speechLang, 'es');
    assert.equal(es.lessons.length, 10);
  });

  it('all 10 Spanish lessons have 6 items each (60 phrases) with phonetics and grammar capsules', () => {
    const es = courses.find((c) => c.code === 'es')!;
    let totalItems = 0;

    for (const lesson of es.lessons) {
      assert.equal(lesson.items.length, 6);
      assert.ok(lesson.grammarCapsule);
      assert.ok(lesson.grammarCapsule.examples.length >= 2);

      for (const item of lesson.items) {
        assert.ok(item.id.startsWith('es-'));
        assert.ok(item.target.length > 0);
        assert.ok(item.en.length > 0);
        assert.ok((item.phonetic ?? '').length > 0);
        assert.ok((item.notes ?? '').length > 0);
        assert.ok(Array.isArray(item.alternatives));
        totalItems++;
      }
    }

    assert.equal(totalItems, 60);
  });

  it('includes Spanish real-world conversational story', () => {
    const esStory = stories.find((s) => s.courseCode === 'es');
    assert.ok(esStory, 'Spanish story is missing');
    assert.ok(esStory.dialog.length >= 4);
    assert.ok(esStory.question.options.length >= 3);
  });

  it('evaluates Spanish answers with smart inverted punctuation and accent leniency', () => {
    const es = courses.find((c) => c.code === 'es')!;
    const item = es.lessons[0].items[0]; // ¡Hola! ¿Cómo estás?
    const res = evaluateAnswer('Hola como estas', item);
    assert.equal(res.ok, true);
  });
});
