import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countWords,
  evaluateWritingSubmission,
  createWritingCompletionEvents,
} from '../writing/engine';
import {
  WRITING_CHALLENGES_CATALOG,
  getWritingChallengesByLanguage,
  getWritingChallengeById,
} from '../writing/catalog';

describe('Writing Lab Correction Engine & Pedagogical Feedback (TDD)', () => {
  const hotelReplyChallenge = getWritingChallengeById('fr_write_01_hotel_reply')!;

  describe('1. Word Counting & Text Analysis', () => {
    it('accurately counts words across spacing and newlines', () => {
      assert.equal(countWords(''), 0);
      assert.equal(countWords('   '), 0);
      assert.equal(countWords('Bonjour tout le monde'), 4);
      assert.equal(countWords('Bonjour,\n\nMerci pour votre confirmation.\nCordialement.'), 6);
    });
  });

  describe('2. Grammatical Error Pattern Detection', () => {
    it('detects French auxiliary error with movement verb (ai allé -> suis allé)', () => {
      const weekendChallenge = getWritingChallengeById('fr_write_02_weekend_desc')!;
      const submission =
        'Ce weekend je ai allé au musée et j’ai visité une exposition formidable. C’était très bien.';
      const result = evaluateWritingSubmission(weekendChallenge, submission);

      const auxiliaryMistake = result.mistakes.find((m) => m.category === 'conjugation');
      assert.ok(auxiliaryMistake);
      assert.ok(auxiliaryMistake.explanation.includes('Movement verbs like "aller"'));
      assert.ok(result.correctedText.includes('suis/est/sommes/êtes/sont allé'));
    });

    it('detects French physical sensation auxiliary error (je suis faim -> j’ai faim)', () => {
      const submission = 'Je suis faim alors je cherche un bon restaurant.';
      const weekendChallenge = getWritingChallengeById('fr_write_02_weekend_desc')!;
      const result = evaluateWritingSubmission(weekendChallenge, submission);

      const sensationMistake = result.mistakes.find(
        (m) => m.category === 'grammar' && m.explanation.includes('Physical sensations')
      );
      assert.ok(sensationMistake);
    });

    it('detects German word order error in subordinate clause with weil', () => {
      const techChallenge = getWritingChallengeById('de_write_02_tech_issue')!;
      const submission =
        'Wir haben ein Problem mit der Datenbank, weil ich kann nicht connecten. Als Lösung schlage ich vor.';
      const result = evaluateWritingSubmission(techChallenge, submission);

      const wordOrderMistake = result.mistakes.find((m) => m.category === 'word_order');
      assert.ok(wordOrderMistake);
      assert.ok(wordOrderMistake.explanation.toLowerCase().includes('subordinate clauses'));
      assert.ok(wordOrderMistake.explanation.toLowerCase().includes('weil'));
    });

    it('detects Spanish gratitude preposition error (gracias para -> gracias por)', () => {
      const apptChallenge = getWritingChallengeById('es_write_01_appointment')!;
      const submission =
        'Muchas gracias para la confirmación de la cita el próximo martes. ¿Qué documentos necesito ? Un cordial saludo.';
      const result = evaluateWritingSubmission(apptChallenge, submission);

      const prepMistake = result.mistakes.find(
        (m) => m.category === 'grammar' && m.explanation.includes('Expressing cause or gratitude')
      );
      assert.ok(prepMistake);
    });
  });

  describe('3. Constraint Adherence & Scoring', () => {
    it('accepts a high-quality submission meeting all instructions and word counts', () => {
      const submission =
        'Bonjour, merci pour votre confirmation de réservation. Je prévois d’arriver vers 19h00 ce vendredi. Est-il possible d’avoir une place de parking ? Cordialement.';
      const result = evaluateWritingSubmission(hotelReplyChallenge, submission);

      assert.equal(result.isAccurate, true);
      assert.ok(result.score >= 0.85);
      assert.ok(result.wordCount >= hotelReplyChallenge.minimumWords);
      assert.ok(result.earnedXp >= 30);
    });

    it('flags deficit when word count is below minimum', () => {
      const submission = 'Merci, j’arrive tard. Parking ? Cordialement.'; // only 6 words, min is 15
      const result = evaluateWritingSubmission(hotelReplyChallenge, submission);

      assert.equal(result.isAccurate, false);
      const deficit = result.mistakes.find((m) => m.id === 'word_count_deficit');
      assert.ok(deficit);
      assert.ok(result.score < 0.7);
    });

    it('flags missing required keywords from prompt instructions', () => {
      const submission =
        'Bonjour, je confirme que je serai présent ce vendredi à 19h00 pour mon séjour. Tout est prêt pour nous.';
      // Missing required keywords: 'merci', 'parking', 'cordialement'
      const result = evaluateWritingSubmission(hotelReplyChallenge, submission);

      assert.equal(result.isAccurate, false);
      const missing = result.mistakes.filter((m) => m.category === 'communication_intent');
      assert.ok(missing.length >= 2);
    });
  });

  describe('4. 8-Point Correction Debrief Structure', () => {
    it('returns complete pedagogical debrief containing natural alternative, rule, and follow-up', () => {
      const submission =
        'Bonjour, merci pour votre confirmation. J’arrive vers 19h. Avez-vous du parking ? Cordialement.';
      const result = evaluateWritingSubmission(hotelReplyChallenge, submission);

      assert.ok(result.originalText.length > 0);
      assert.ok(result.correctedText.length > 0);
      assert.ok(result.naturalAlternative.length > 0);
      assert.ok(result.grammarRule.length > 0);
      assert.ok(result.vocabularyRecommendation.length > 0);
      assert.ok(result.followUpExercise.prompt.length > 0);
      assert.ok(result.followUpExercise.targetHint.length > 0);
      assert.equal(result.offlineEvaluated, true);
    });
  });

  describe('5. Telemetry & Learning Events Bridge', () => {
    it('creates standardized LearningEvents for writing skill and specific grammatical errors', () => {
      const weekendChallenge = getWritingChallengeById('fr_write_02_weekend_desc')!;
      const submission = 'Ce weekend je ai allé au cinéma avec des amis.';
      const result = evaluateWritingSubmission(weekendChallenge, submission);

      const events = createWritingCompletionEvents(weekendChallenge, result);

      assert.ok(events.length >= 2); // 1 main writing event + 1 error category event
      assert.equal(events[0].activityId, 'writing_lab');
      assert.ok(events[0].objectiveIds.includes('skill:writing'));
      assert.ok(events[0].objectiveIds.includes('writing:fr_write_02_weekend_desc'));

      const errorEvent = events.find((e) => e.errorCategory === 'conjugation');
      assert.ok(errorEvent);
    });
  });

  describe('6. Catalog Scale & Multi-Language Coverage', () => {
    it('verifies catalog covers French, German, and Spanish across diverse writing formats', () => {
      const frChallenges = getWritingChallengesByLanguage('fr');
      const deChallenges = getWritingChallengesByLanguage('de');
      const esChallenges = getWritingChallengesByLanguage('es');

      assert.ok(frChallenges.length >= 2);
      assert.ok(deChallenges.length >= 2);
      assert.ok(esChallenges.length >= 2);

      for (const c of WRITING_CHALLENGES_CATALOG) {
        assert.ok(c.id.length > 0);
        assert.ok(c.title.length > 0);
        assert.ok(c.scenario.length > 0);
        assert.ok(c.instructions.length >= 3);
        assert.ok(c.minimumWords > 0);
        assert.ok(c.requiredKeywords.length > 0);
        assert.ok(c.naturalAlternative.length > 0);
        assert.ok(c.grammarRule.length > 0);
      }
    });
  });
});
