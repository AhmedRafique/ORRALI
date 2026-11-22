import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswer } from '../exercises';
import { evaluatePronunciation } from '../scoring';
import {
  conjugateFrenchVerb,
  elideFrench,
  inflectGermanArticle,
  conjugateSpanishVerb,
} from '../matrix/morphology';
import {
  buildSyntaxRadarChallenge,
  evaluateSyntaxAnswer,
} from '../grammar/dependencyTree';
import {
  detectDiscourseFillers,
  evaluateRetortSubmission,
  getRetortScenarioById,
} from '../coach/rapidRetort';
import {
  evaluatePillars,
  calculateHonorsTier,
  generateMasterCertificate,
} from '../milestones/certification';
import { Item } from '../types';

describe('ROUND 2 ADVERSARIAL AUDIT: Scoring, Normalization & Syntax Engines', () => {
  describe('1. Pedagogical Answer Evaluation & Extreme Normalization', () => {
    it('handles inverted Spanish punctuation, leading/trailing spaces, and diacritics', () => {
      const item: Item = {
        id: 'test-es-1',
        target: '¿Cómo estás?',
        en: 'How are you?',
        alternatives: ['Cómo estás', 'Como estas', 'como estas?'],
      };

      // With inverted marks omitted
      const res1 = evaluateAnswer('Como estas', item);
      assert.equal(res1.ok, true);

      // With extra spaces and casing
      const res2 = evaluateAnswer('   ¿CÓMO   ESTÁS?   ', item);
      assert.equal(res2.ok, true);
    });

    it('handles French curly vs straight apostrophes and vowel elisions', () => {
      const item: Item = {
        id: 'test-fr-1',
        target: "C'est délicieux",
        en: 'It is delicious',
        alternatives: ["C’est délicieux", 'c est delicieux'],
      };

      const res1 = evaluateAnswer('C’est délicieux', item);
      assert.equal(res1.ok, true);

      const res2 = evaluateAnswer("C'est delicieux", item);
      assert.equal(res2.ok, true);
    });

    it('strictly rejects empty strings, whitespace, or nonsense gibberish', () => {
      const item: Item = {
        id: 'test-de-1',
        target: 'Guten Morgen',
        en: 'Good morning',
        alternatives: [],
      };

      assert.equal(evaluateAnswer('', item).ok, false);
      assert.equal(evaluateAnswer('   ', item).ok, false);
      assert.equal(evaluateAnswer('???!!!', item).ok, false);
      assert.equal(evaluateAnswer('asdfghjklqwerty', item).ok, false);
    });
  });

  describe('2. Pronunciation Scoring Anti-Crash & Boundary Conditions', () => {
    it('handles empty, undefined, or punctuation-only transcripts without throwing', () => {
      assert.doesNotThrow(() => {
        const res1 = evaluatePronunciation('Bonjour', 1200, '');
        assert.equal(res1.passed, false);
        assert.ok(res1.overallScore <= 30);
      });

      assert.doesNotThrow(() => {
        const res2 = evaluatePronunciation('Bonjour', 1200, '   ... ??? ');
        assert.equal(res2.passed, false);
        assert.ok(res2.overallScore <= 30);
      });
    });

    it('handles negative, zero, and huge audio durations gracefully without NaN', () => {
      const resZero = evaluatePronunciation('Bonjour', 0, 'bonjour');
      assert.ok(!Number.isNaN(resZero.overallScore));
      assert.ok(resZero.overallScore >= 0 && resZero.overallScore <= 100);

      const resNeg = evaluatePronunciation('Bonjour', -500, 'bonjour');
      assert.ok(!Number.isNaN(resNeg.overallScore));

      const resHuge = evaluatePronunciation('Bonjour', 120000, 'bonjour');
      assert.ok(!Number.isNaN(resHuge.overallScore));
    });
  });

  describe('3. Trilingual Morphological Agreement & Syntax Generators', () => {
    it('performs French vowel elisions across diverse vowel initials', () => {
      assert.equal(elideFrench('je', 'aime'), "j'aime");
      assert.equal(elideFrench('de', 'eau'), "d'eau");
      assert.equal(elideFrench('le', 'arbre'), "l'arbre");
      assert.equal(elideFrench('je', 'veux'), 'je veux');
    });

    it('conjugates French irregular and regular verbs correctly', () => {
      assert.equal(conjugateFrenchVerb('aller', '1s', 'present'), 'vais');
      assert.equal(conjugateFrenchVerb('aller', '1p', 'present'), 'allons');
      assert.equal(conjugateFrenchVerb('avoir', '1s', 'present'), 'ai');
      assert.equal(conjugateFrenchVerb('être', '1s', 'present'), 'suis');
    });

    it('inflects German articles for Nominative, Accusative, and Dative cases', () => {
      // Masculine
      assert.equal(inflectGermanArticle('def', 'nom', 'm'), 'der');
      assert.equal(inflectGermanArticle('def', 'acc', 'm'), 'den');
      assert.equal(inflectGermanArticle('def', 'dat', 'm'), 'dem');

      // Feminine
      assert.equal(inflectGermanArticle('def', 'nom', 'f'), 'die');
      assert.equal(inflectGermanArticle('def', 'acc', 'f'), 'die');
      assert.equal(inflectGermanArticle('def', 'dat', 'f'), 'der');
    });

    it('conjugates Spanish verbs in present and subjunctive', () => {
      assert.equal(conjugateSpanishVerb('hablar', '1s', 'present'), 'hablo');
      assert.equal(conjugateSpanishVerb('tener', '1s', 'present'), 'tengo');
      assert.equal(conjugateSpanishVerb('venir', '2s', 'subjunctive_present'), 'vengas');
    });
  });

  describe('4. Syntax Radar Challenge & Node Evaluation Stress Test', () => {
    it('generates radar challenges across all 3 languages without crashing', () => {
      for (const lang of ['fr', 'de', 'es'] as const) {
        const challenge = buildSyntaxRadarChallenge(lang);
        assert.ok(challenge.tree);
        assert.ok(challenge.targetToken.length > 0);
        assert.ok(challenge.options.length >= 2);

        // Test evaluating both correct and incorrect selections
        const correctRes = evaluateSyntaxAnswer(challenge, challenge.targetToken);
        assert.equal(correctRes.isCorrect, true);
        assert.equal(correctRes.earnedXp, 25);

        const wrongRes = evaluateSyntaxAnswer(challenge, 'NONSENSE_TOKEN');
        assert.equal(wrongRes.isCorrect, false);
        assert.equal(wrongRes.earnedXp, 5);
      }
    });
  });

  describe('5. Rapid Retort Countdown & Boundary Evaluation', () => {
    it('evaluates retort timing boundaries: 3s (speed bonus), 7s (standard), 11s (timeout)', () => {
      const scenario = getRetortScenarioById('fr-retort-expensive-bill');
      assert.ok(scenario);
      if (!scenario) return;

      const naturalOption = scenario.options.find((o) => o.isNaturalComeback)!.text;

      // Fast response (<= 5s)
      const resFast = evaluateRetortSubmission(scenario, naturalOption, 3.0);
      assert.equal(resFast.isSuccessful, true);
      assert.ok(resFast.earnedXp >= 40);

      // Slower response (7s, within 10s)
      const resSlow = evaluateRetortSubmission(scenario, naturalOption, 7.0);
      assert.equal(resSlow.isSuccessful, true);
      assert.ok(resSlow.earnedXp >= 30);

      // Timed-out response (> 10s)
      const resTimeout = evaluateRetortSubmission(scenario, naturalOption, 11.2);
      assert.equal(resTimeout.isSuccessful, false);
    });

    it('detects fillers with punctuation and mixed casing', () => {
      assert.equal(detectDiscourseFillers('¡A ver, qué pasa!', 'es'), 'a ver');
      assert.equal(detectDiscourseFillers('Du coup... c’est bon', 'fr'), 'du coup');
      assert.equal(detectDiscourseFillers('HALT STOPP!', 'de'), 'halt');
    });
  });

  describe('6. Master Fluency Certification Boundary Limits', () => {
    it('clamps negative and excessive pillar scores without throwing', () => {
      const { pillarScores, overallScorePct } = evaluatePillars({
        listeningPct: -25,
        readingSyntaxPct: 150,
        writingPct: 80,
        speakingPct: 80,
      });

      assert.equal(pillarScores[0]?.scorePct, 0);
      assert.equal(pillarScores[1]?.scorePct, 100);
      assert.ok(overallScorePct >= 0 && overallScorePct <= 100);
    });

    it('enforces exact 80% pass threshold and honors tier boundaries', () => {
      // 79% should fail
      const cert79 = generateMasterCertificate({
        languageId: 'fr',
        courseName: 'French',
        level: 'B1',
        listeningPct: 79,
        readingSyntaxPct: 79,
        writingPct: 79,
        speakingPct: 79,
      });
      assert.equal(cert79, null);

      // 80% should pass with Silver
      const cert80 = generateMasterCertificate({
        languageId: 'fr',
        courseName: 'French',
        level: 'B1',
        listeningPct: 80,
        readingSyntaxPct: 80,
        writingPct: 80,
        speakingPct: 80,
      });
      assert.ok(cert80);
      assert.equal(cert80?.honorsTier, 'SILVER');

      // 85% should have Gold
      assert.equal(calculateHonorsTier(85), 'GOLD');

      // 95% should have Honors
      assert.equal(calculateHonorsTier(95), 'HONORS');
    });
  });
});
