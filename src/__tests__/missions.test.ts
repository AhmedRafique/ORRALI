import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateMissionTurn,
  evaluateUnexpectedEvent,
  evaluateFinalChallenge,
  calculateMissionScore,
  createMissionCompletionEvents,
  normalizeText,
} from '../missions/engine';
import {
  MISSIONS_CATALOG,
  getMissionsByLanguage,
  getMissionById,
} from '../missions/catalog';

describe('Real-Life Missions Engine & Communicative Multi-Metric Scoring (TDD)', () => {
  const restaurantMission = getMissionById('fr_mission_travel_04_restaurant')!;

  describe('1. Turn Evaluation & Anti-Gibberish Intent Matching', () => {
    it('accepts authentic communicative phrasing with keywords', () => {
      const turn = restaurantMission.dialogueTurns[0];
      const result = evaluateMissionTurn(turn, 'Bonsoir, une eau gazeuse s’il vous plaît');

      assert.equal(result.isCommunicative, true);
      assert.ok(result.relevanceScore >= 0.8);
      assert.ok(result.grammarScore >= 0.8);
      assert.ok(result.matchedKeywords.length >= 2);
    });

    it('tolerates unaccented spelling and minor punctuation while preserving communication', () => {
      const turn = restaurantMission.dialogueTurns[0];
      const result = evaluateMissionTurn(turn, 'bonsoir de l eau gazeuse svp');

      assert.equal(result.isCommunicative, true);
      assert.ok(result.matchedKeywords.includes('bonsoir'));
      assert.ok(result.matchedKeywords.includes('eau'));
    });

    it('strictly REJECTS meaningless random consonants and gibberish', () => {
      const turn = restaurantMission.dialogueTurns[0];
      const result = evaluateMissionTurn(turn, 'zzqqrrttwwxxkk');

      assert.equal(result.isCommunicative, false);
      assert.ok(result.relevanceScore <= 0.2);
    });

    it('strictly REJECTS off-topic replies', () => {
      const turn = restaurantMission.dialogueTurns[1]; // expecting food order
      const result = evaluateMissionTurn(turn, 'Où est la gare centrale ?');

      assert.equal(result.isCommunicative, false);
      assert.ok(result.feedback.includes('Communication goal not achieved'));
    });

    it('triggers dynamic NPC branching when specific condition keywords are matched', () => {
      const turn = restaurantMission.dialogueTurns[1];
      const result = evaluateMissionTurn(turn, 'Je prends le poulet rôti s’il vous plaît');

      assert.equal(result.isCommunicative, true);
      assert.ok(result.branchTaken);
      assert.ok(result.branchTaken!.includes('poulet rôti aux herbes'));
    });
  });

  describe('2. Unexpected Curveball & Final Payoff Resolution', () => {
    it('evaluates successful resolution of unexpected curveball', () => {
      const curveball = restaurantMission.unexpectedEvent;
      const result = evaluateUnexpectedEvent(curveball, 'Dans ce cas, je prends le poisson grillé, s’il vous plaît');

      assert.equal(result.isResolved, true);
      assert.equal(result.relevanceScore, 1.0);
    });

    it('flags failure when curveball is ignored or unaddressed', () => {
      const curveball = restaurantMission.unexpectedEvent;
      const result = evaluateUnexpectedEvent(curveball, 'Merci au revoir');

      assert.equal(result.isResolved, false);
      assert.ok(result.feedback.includes('curveball'));
    });

    it('evaluates final mission payoff challenge (asking for bill & payment)', () => {
      const finalChallenge = restaurantMission.finalChallenge;
      const result = evaluateFinalChallenge(finalChallenge, 'L’addition s’il vous plaît, puis-je payer par carte ?');

      assert.equal(result.isPassed, true);
    });
  });

  describe('3. Multi-Metric Scoring Breakdown', () => {
    it('accurately computes multi-dimensional scores and awards XP', () => {
      const score = calculateMissionScore({
        mission: restaurantMission,
        prepCorrectCount: 2,
        prepTotal: 2,
        listeningPassed: true,
        dialogueResults: [
          { isCommunicative: true, relevanceScore: 1.0, grammarScore: 0.9 },
          { isCommunicative: true, relevanceScore: 1.0, grammarScore: 0.85 },
        ],
        unexpectedResolved: true,
        finalChallengePassed: true,
      });

      assert.equal(score.passed, true);
      assert.equal(score.comprehension, 1.0);
      assert.equal(score.communicationSuccess, 1.0);
      assert.ok(score.overallScore >= 0.85);
      assert.ok(score.earnedXp >= 40);
      assert.ok(score.suggestedPhrasebookAdds.length > 0);
    });

    it('fails mission if communication goal is not met even if comprehension was tested', () => {
      const score = calculateMissionScore({
        mission: restaurantMission,
        prepCorrectCount: 2,
        prepTotal: 2,
        listeningPassed: true,
        dialogueResults: [
          { isCommunicative: false, relevanceScore: 0.2, grammarScore: 0.2 },
          { isCommunicative: false, relevanceScore: 0.2, grammarScore: 0.2 },
        ],
        unexpectedResolved: false,
        finalChallengePassed: false,
      });

      assert.equal(score.passed, false);
      assert.ok(score.communicationSuccess < 0.5);
      assert.equal(score.earnedXp, 10);
      assert.ok(score.remedialRecommendations.length > 0);
    });
  });

  describe('4. Telemetry & Learning Events Bridge', () => {
    it('creates standardized LearningEvents for communication and listening from mission score', () => {
      const score = calculateMissionScore({
        mission: restaurantMission,
        prepCorrectCount: 2,
        prepTotal: 2,
        listeningPassed: true,
        dialogueResults: [
          { isCommunicative: true, relevanceScore: 1.0, grammarScore: 0.9 },
        ],
        unexpectedResolved: true,
        finalChallengePassed: true,
      });

      const events = createMissionCompletionEvents(restaurantMission, score);

      assert.equal(events.length, 2);
      assert.equal(events[0].activityId, 'mission');
      assert.ok(events[0].objectiveIds.includes('skill:communication'));
      assert.ok(events[0].objectiveIds.includes('mission:fr_mission_travel_04_restaurant'));
      assert.equal(events[1].activityId, 'mission');
      assert.ok(events[1].objectiveIds.includes('skill:listening'));
    });
  });

  describe('5. Mission Catalog Coverage', () => {
    it('verifies catalog covers French, German, and Spanish across Travel and Professional categories', () => {
      const frMissions = getMissionsByLanguage('fr');
      const deMissions = getMissionsByLanguage('de');
      const esMissions = getMissionsByLanguage('es');

      assert.ok(frMissions.length >= 2);
      assert.ok(deMissions.length >= 1);
      assert.ok(esMissions.length >= 1);

      for (const m of MISSIONS_CATALOG) {
        assert.ok(m.id.length > 0);
        assert.ok(m.title.length > 0);
        assert.ok(m.context.length > 0);
        assert.ok(m.dialogueTurns.length > 0);
        assert.ok(m.unexpectedEvent.title.length > 0);
        assert.ok(m.finalChallenge.objective.length > 0);
      }
    });
  });
});
