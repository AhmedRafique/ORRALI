import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { diagnoseMistakes, buildRemedialWorkout } from '../companion/clinic';
import { askTutor, TUTOR_KNOWLEDGE_BASE } from '../companion/tutor';
import { ROLEPLAY_SCENARIOS, evaluateRoleplayTurn } from '../companion/roleplay';
import { MistakeRecord } from '../types';

describe('AI Companion & Roleplay Engine (TDD)', () => {
  const frCourse = courses.find((c) => c.code === 'fr')!;
  const deCourse = courses.find((c) => c.code === 'de')!;
  const allFrItems = frCourse.lessons.flatMap((l) => l.items);

  describe('1. Smart Mistake Clinic', () => {
    it('diagnoses mistake records and sorts by highest failure rate', () => {
      const records: MistakeRecord[] = [
        { itemId: 'fr-1-4', courseCode: 'fr', failCount: 4, passCount: 1, lastFailedAt: 1000 },
        { itemId: 'fr-1-1', courseCode: 'fr', failCount: 1, passCount: 8, lastFailedAt: 500 },
        { itemId: 'fr-4-1', courseCode: 'fr', failCount: 3, passCount: 2, lastFailedAt: 800 },
      ];

      const diagnoses = diagnoseMistakes(records, allFrItems);

      assert.equal(diagnoses.length, 3);
      // Top mistake should be fr-1-4 (highest error rate)
      assert.equal(diagnoses[0].item.id, 'fr-1-4');
      assert.equal(diagnoses[0].failCount, 4);
      assert.ok(diagnoses[0].accuracyPercent < 50);
      assert.ok(diagnoses[0].suggestedTip.length > 0);
    });

    it('ignores records with 0 failures', () => {
      const records: MistakeRecord[] = [
        { itemId: 'fr-1-1', courseCode: 'fr', failCount: 0, passCount: 10, lastFailedAt: 0 },
      ];
      const diagnoses = diagnoseMistakes(records, allFrItems);
      assert.equal(diagnoses.length, 0);
    });

    it('builds a focused remedial workout targeting problem items', () => {
      const records: MistakeRecord[] = [
        { itemId: 'fr-1-4', courseCode: 'fr', failCount: 3, passCount: 1, lastFailedAt: 1000 },
        { itemId: 'fr-4-1', courseCode: 'fr', failCount: 2, passCount: 1, lastFailedAt: 900 },
      ];
      const diagnoses = diagnoseMistakes(records, allFrItems);
      const exercises = buildRemedialWorkout(diagnoses, frCourse);

      assert.ok(exercises.length > 0);
      // Remedial workout should include intro/listen/type to reinforce correct form
      const kinds = new Set(exercises.map((e) => e.kind));
      assert.ok(kinds.has('listen'));
      assert.ok(kinds.has('type'));
    });
  });

  describe('2. "Ask ORRALI" Contextual AI Tutor', () => {
    it('answers French polite address questions (Tu vs Vous)', () => {
      const answer = askTutor('When do I use tu versus vous in French?', 'fr');
      assert.ok(answer.topic.toLowerCase().includes('vous') || answer.topic.toLowerCase().includes('polite'));
      assert.ok(answer.childFriendlySummary.length > 0);
      assert.ok(answer.goldenRule.length > 0);
      assert.ok(answer.examples.length >= 2);
    });

    it('answers French gender and article questions (Un vs Une / Le vs La)', () => {
      const answer = askTutor('What is the difference between un and une?', 'fr');
      assert.ok(answer.topic.toLowerCase().includes('gender') || answer.topic.toLowerCase().includes('article'));
      assert.ok(answer.detailedExplanation.includes('masculine') || answer.detailedExplanation.includes('feminine'));
    });

    it('answers German gender and accusative questions (Der Die Das / Einen Kaffee)', () => {
      const answer = askTutor('Why is it einen Kaffee and not ein Kaffee?', 'de');
      assert.ok(answer.topic.toLowerCase().includes('accusative') || answer.topic.toLowerCase().includes('case'));
      assert.ok(answer.examples.some((ex) => ex.target.includes('Kaffee')));
    });

    it('provides encouraging fallback for open-ended queries', () => {
      const answer = askTutor('How can I sound more natural when speaking?', 'fr');
      assert.ok(answer.childFriendlySummary.length > 0);
      assert.ok(answer.goldenRule.length > 0);
    });

    it('knowledge base covers all core A1 grammar themes', () => {
      assert.ok(TUTOR_KNOWLEDGE_BASE.length >= 8);
    });
  });

  describe('3. Conversational AI Roleplay Engine', () => {
    it('provides authentic roleplay scenarios for both French and German', () => {
      assert.ok(ROLEPLAY_SCENARIOS.length >= 4);
      const frScenarios = ROLEPLAY_SCENARIOS.filter((s) => s.courseCode === 'fr');
      const deScenarios = ROLEPLAY_SCENARIOS.filter((s) => s.courseCode === 'de');
      assert.ok(frScenarios.length >= 2);
      assert.ok(deScenarios.length >= 2);
    });

    it('progresses café ordering roleplay from greeting to order and payment', () => {
      const scenario = ROLEPLAY_SCENARIOS.find((s) => s.id === 'roleplay-fr-cafe')!;

      // Turn 1: User says hello and orders
      const turn1 = evaluateRoleplayTurn(scenario.id, 0, 'Bonjour, un café s’il vous plaît');
      assert.equal(turn1.reply.sender, 'ai');
      assert.ok(turn1.reply.target.length > 0);
      assert.ok(turn1.reply.feedback?.includes('Polite') || turn1.reply.feedback?.includes('Great'));
      assert.equal(turn1.isCompleted, false);
      assert.ok(turn1.suggestedNextReplies.length > 0);

      // Turn 2: User asks for the bill
      const turn2 = evaluateRoleplayTurn(scenario.id, 1, "L'addition, s'il vous plaît");
      assert.equal(turn2.reply.sender, 'ai');
      assert.equal(turn2.isCompleted, false);

      // Turn 3: User pays and finishes
      const turn3 = evaluateRoleplayTurn(scenario.id, 2, 'Je peux payer par carte ? Merci beaucoup !');
      assert.equal(turn3.isCompleted, true);
      assert.equal(turn3.earnedXp, 20);
    });

    it('handles German train station ticket booking roleplay', () => {
      const scenario = ROLEPLAY_SCENARIOS.find((s) => s.id === 'roleplay-de-station')!;

      const turn1 = evaluateRoleplayTurn(scenario.id, 0, 'Guten Tag, eine Fahrkarte nach München bitte');
      assert.equal(turn1.reply.sender, 'ai');
      assert.equal(turn1.isCompleted, false);

      const turn2 = evaluateRoleplayTurn(scenario.id, 1, 'Kann ich mit Karte zahlen? Vielen Dank!');
      assert.equal(turn2.isCompleted, true);
      assert.equal(turn2.earnedXp, 20);
    });
  });
});
