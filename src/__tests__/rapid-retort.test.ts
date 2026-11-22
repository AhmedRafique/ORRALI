import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RAPID_RETORT_CATALOG,
  getRetortScenariosByLanguage,
  getRetortScenarioById,
  buildRetortDuelDeck,
  detectDiscourseFillers,
  evaluateRetortSubmission,
} from '../coach/rapidRetort';

describe('Rapid Retort Conversational Duel & Discourse Fillers (TDD)', () => {
  describe('1. European Triad Retort Scenarios Catalog', () => {
    it('provides pressure scenarios for French, German, and Spanish', () => {
      const frScenarios = getRetortScenariosByLanguage('fr');
      const deScenarios = getRetortScenariosByLanguage('de');
      const esScenarios = getRetortScenariosByLanguage('es');

      assert.ok(frScenarios.length >= 2, 'French catalog should have at least 2 scenarios');
      assert.ok(deScenarios.length >= 2, 'German catalog should have at least 2 scenarios');
      assert.ok(esScenarios.length >= 2, 'Spanish catalog should have at least 2 scenarios');
    });

    it('verifies all scenarios have interlocutor, translation, ideal retort, and options', () => {
      for (const sc of RAPID_RETORT_CATALOG) {
        assert.ok(sc.id.length > 0);
        assert.ok(sc.interlocutorName.length > 0);
        assert.ok(sc.incomingPrompt.length > 0);
        assert.ok(sc.englishTranslation.length > 0);
        assert.ok(sc.idealRetort.length > 0);
        assert.ok(sc.validFillers.length > 0);
        assert.ok(sc.options.length >= 3);
        assert.ok(sc.options.some((o) => o.isNaturalComeback && o.hasFiller));
      }
    });

    it('retrieves specific scenario by ID', () => {
      const sc = getRetortScenarioById('de-retort-delayed-train');
      assert.ok(sc);
      assert.equal(sc?.languageId, 'de');
      assert.ok(sc?.incomingPrompt.includes('München'));
    });
  });

  describe('2. Discourse Filler Detection Engine', () => {
    it('detects French discourse fillers', () => {
      assert.equal(detectDiscourseFillers('Écoute, je suis désolé', 'fr'), 'écoute');
      assert.equal(detectDiscourseFillers('Du coup on fait quoi ?', 'fr'), 'du coup');
      assert.equal(detectDiscourseFillers('En fait c’est simple', 'fr'), 'en fait');
    });

    it('detects German modal particles and discourse fillers', () => {
      assert.equal(detectDiscourseFillers('Das ist halt so gelaufen', 'de'), 'halt');
      assert.equal(detectDiscourseFillers('Na ja, schauen wir mal', 'de'), 'na ja');
      assert.equal(detectDiscourseFillers('Pass auf, ich erkläre es dir', 'de'), 'pass auf');
    });

    it('detects Spanish conversational muletillas', () => {
      assert.equal(detectDiscourseFillers('O sea, no me parece justo', 'es'), 'o sea');
      assert.equal(detectDiscourseFillers('A ver, déjame pensar', 'es'), 'a ver');
      assert.equal(detectDiscourseFillers('Es que no tenía tiempo', 'es'), 'es que');
    });
  });

  describe('3. Retort Duel Evaluation Under Pressure', () => {
    it('evaluates lightning natural comeback (<= 5s) with top XP and speed bonus', () => {
      const sc = getRetortScenarioById('fr-retort-late-arrival');
      assert.ok(sc);
      if (!sc) return;

      const naturalOption = sc.options.find((o) => o.isNaturalComeback);
      assert.ok(naturalOption);

      const res = evaluateRetortSubmission(sc, naturalOption!.text, 3.2);
      assert.equal(res.isSuccessful, true);
      assert.ok(res.earnedXp >= 40); // 25 base + 15 speed + 10 filler
      assert.ok(res.fluencyScore >= 95);
      assert.ok(res.feedback.includes('Lightning Retort'));
    });

    it('evaluates robotic or unnatural option as failure', () => {
      const sc = getRetortScenarioById('fr-retort-late-arrival');
      assert.ok(sc);
      if (!sc) return;

      const roboticOption = sc.options.find((o) => !o.isNaturalComeback);
      assert.ok(roboticOption);

      const res = evaluateRetortSubmission(sc, roboticOption!.text, 4.0);
      assert.equal(res.isSuccessful, false);
      assert.equal(res.earnedXp, 5);
      assert.ok(res.feedback.includes('conversational rhythm'));
    });

    it('penalizes hesitation past 10 seconds timeout', () => {
      const sc = getRetortScenarioById('es-retort-split-bill');
      assert.ok(sc);
      if (!sc) return;

      const res = evaluateRetortSubmission(sc, 'A ver, yo pago lo mío', 12.5);
      assert.equal(res.isSuccessful, false);
      assert.ok(res.feedback.includes('Time freeze'));
    });

    it('builds randomized duel decks for sessions', () => {
      const deck = buildRetortDuelDeck('fr', 2);
      assert.equal(deck.length, 2);
      for (const d of deck) {
        assert.equal(d.languageId, 'fr');
      }
    });
  });
});
