import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  conjugateFrenchVerb,
  elideFrench,
  inflectFrenchAdjective,
  conjugateGermanVerb,
  inflectGermanArticle,
  conjugateSpanishVerb,
} from '../matrix/morphology';
import {
  generateMatrixSentence,
  generateMatrixExercise,
  evaluateMatrixExercise,
} from '../matrix/generator';
import {
  MATRIX_TEMPLATES,
  getTemplateById,
  getTemplatesByLanguage,
} from '../matrix/templates';

describe('Combinatorial Sentence Matrix Engine & Zero-Gap Morphology (TDD)', () => {
  describe('1. French Morphological Agreement & Elisions', () => {
    it('conjugates regular and irregular French verbs correctly', () => {
      assert.equal(conjugateFrenchVerb('chercher', '1s'), 'cherche');
      assert.equal(conjugateFrenchVerb('chercher', '1p'), 'cherchons');
      assert.equal(conjugateFrenchVerb('être', '1s'), 'suis');
      assert.equal(conjugateFrenchVerb('être', '1p'), 'sommes');
      assert.equal(conjugateFrenchVerb('avoir', '1s'), 'ai');
      assert.equal(conjugateFrenchVerb('vouloir', '2p'), 'voulez');
    });

    it("performs vowel elision automatically (je + vowel -> j', de + vowel -> d')", () => {
      assert.equal(elideFrench('je', 'aime'), "j'aime");
      assert.equal(elideFrench('je', 'cherche'), 'je cherche');
      assert.equal(elideFrench('que', 'il'), "qu'il");
    });

    it('inflects French adjectives across gender and number', () => {
      assert.equal(inflectFrenchAdjective('beau', 'm', 's'), 'beau');
      assert.equal(inflectFrenchAdjective('beau', 'f', 's'), 'belle');
      assert.equal(inflectFrenchAdjective('beau', 'm', 'p'), 'beaux');
      assert.equal(inflectFrenchAdjective('grand', 'f', 'p'), 'grandes');
    });
  });

  describe('2. German Case Governance & Inflections', () => {
    it('conjugates regular and modal German verbs', () => {
      assert.equal(conjugateGermanVerb('brauchen', '1s'), 'brauche');
      assert.equal(conjugateGermanVerb('brauchen', '1p'), 'brauchen');
      assert.equal(conjugateGermanVerb('können', '1s'), 'kann');
      assert.equal(conjugateGermanVerb('können', '2s'), 'kannst');
    });

    it('inflects German articles for Nominative, Accusative, and Dative cases', () => {
      // Masculine accusative: ein -> einen
      assert.equal(inflectGermanArticle('indef', 'acc', 'm', 's'), 'einen');
      // Feminine accusative: eine -> eine
      assert.equal(inflectGermanArticle('indef', 'acc', 'f', 's'), 'eine');
      // Masculine dative: der -> dem
      assert.equal(inflectGermanArticle('def', 'dat', 'm', 's'), 'dem');
      // Feminine dative: die -> der
      assert.equal(inflectGermanArticle('def', 'dat', 'f', 's'), 'der');
    });
  });

  describe('3. Spanish Conjugations & Pro-Drop Flexibility', () => {
    it('conjugates Spanish regular and irregular verbs in present and subjunctive', () => {
      assert.equal(conjugateSpanishVerb('necesitar', '1s', 'present'), 'necesito');
      assert.equal(conjugateSpanishVerb('necesitar', '1p', 'present'), 'necesitamos');
      assert.equal(conjugateSpanishVerb('ser', '1s', 'present'), 'soy');
      assert.equal(conjugateSpanishVerb('ser', '3s', 'subjunctive_present'), 'sea');
    });
  });

  describe('4. Combinatorial Sentence Generation from Templates', () => {
    it('generates valid French A1 direct request sentence permutations', () => {
      const tpl = getTemplateById('fr_tpl_a1_direct')!;
      const sentence = generateMatrixSentence(tpl, {
        subject: { id: 's3', text: 'nous', translation: 'we' },
        verb: { id: 'v1', text: 'chercher', translation: 'to look for' },
        direct_object: { id: 'o1', text: 'un café', translation: 'a coffee' },
      });

      assert.equal(sentence.target, 'nous cherchons un café');
      assert.equal(sentence.en, 'we look for a coffee');
      assert.ok(sentence.grammarExplanation.length > 0);
    });

    it('generates valid German A1 sentence with accusative case agreement', () => {
      const tpl = getTemplateById('de_tpl_a1_accusative')!;
      const sentence = generateMatrixSentence(tpl, {
        subject: { id: 's1', text: 'ich', translation: 'I' },
        verb: { id: 'v1', text: 'brauchen', translation: 'to need' },
        direct_object: { id: 'o1', text: 'Kaffee', translation: 'coffee', gender: 'm' },
      });

      assert.equal(sentence.target, 'ich brauche einen Kaffee');
      assert.ok(sentence.en.includes('coffee'));
    });

    it('generates valid Spanish A1 sentence supporting pro-drop alternatives', () => {
      const tpl = getTemplateById('es_tpl_a1_direct')!;
      const sentence = generateMatrixSentence(tpl, {
        subject: { id: 's1', text: 'yo', translation: 'I' },
        verb: { id: 'v1', text: 'necesitar', translation: 'to need' },
        direct_object: { id: 'o1', text: 'un billete de tren', translation: 'a train ticket' },
      });

      assert.equal(sentence.target, 'yo necesito un billete de tren');
      assert.ok(sentence.alternatives.includes('necesito un billete de tren'));
    });
  });

  describe('5. Matrix Exercise Generator & Validation', () => {
    it('builds an interactive substitution exercise and accepts valid solution', () => {
      const ex = generateMatrixExercise('fr', 'A1', 'substitution');
      assert.ok(ex.prompt.length > 0);
      assert.ok(ex.baseSentence.length > 0);
      assert.ok(ex.targetSolution.length > 0);

      const res = evaluateMatrixExercise(ex, ex.targetSolution);
      assert.equal(res.isCorrect, true);
      assert.equal(res.earnedXp, 20);
    });

    it('rejects incorrect grammatical agreements with constructive feedback', () => {
      const ex = generateMatrixExercise('fr', 'A1', 'substitution');
      const res = evaluateMatrixExercise(ex, 'incorrect answer phrase');

      assert.equal(res.isCorrect, false);
      assert.ok(res.feedback.includes('expected'));
    });
  });
});
