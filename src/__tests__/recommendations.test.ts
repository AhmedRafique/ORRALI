import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateLearningRecommendations,
  generatePersonalizedSession,
} from '../recommendations';
import {
  createEmptyLanguageProfile,
  applyLearningEventToProfile,
  applyEventsBatchToProfile,
} from '../learnerModel';
import { createLearningEvent } from '../events';

describe('Recommendation Engine & Dynamic Session Generator (TDD)', () => {
  describe('1. Explainable Recommendation Rules', () => {
    it('generates urgent stumble review with explicit failure count in reason', () => {
      let profile = createEmptyLanguageProfile('fr');

      // Fail an objective 3 times
      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-2'], result: 'incorrect' }),
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-2'], result: 'incorrect' }),
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-2'], result: 'incorrect' }),
      ]);

      const recs = generateLearningRecommendations({ profile });
      const stumbleRec = recs.find((r) => r.actionType === 'review_stumbles');

      assert.ok(stumbleRec);
      assert.equal(stumbleRec.priority, 'urgent');
      assert.equal(stumbleRec.suggestedActivity, 'mistake_clinic');
      assert.ok(stumbleRec.reason.includes('3 mistakes'));
      assert.ok(stumbleRec.reason.includes('item fr-1-2'));
    });

    it('generates past tense grammar recommendation when past tense needs practice', () => {
      let profile = createEmptyLanguageProfile('fr');

      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({
          languageId: 'fr',
          activityId: 'verb_gym',
          objectiveIds: ['grammar:passé_composé'],
          result: 'incorrect',
          errorCategory: 'conjugation',
        }),
      ]);

      const recs = generateLearningRecommendations({ profile });
      const grammarRec = recs.find((r) => r.actionType === 'practice_grammar');

      assert.ok(grammarRec);
      assert.equal(grammarRec.targetDomain, 'grammar_past');
      assert.equal(grammarRec.suggestedActivity, 'verb_gym');
      assert.ok(grammarRec.reason.includes('Passé Composé'));
    });

    it('detects skill asymmetry and recommends listening when reading is much stronger', () => {
      let profile = createEmptyLanguageProfile('de');

      // 4 reading successes
      for (let i = 0; i < 4; i++) {
        profile = applyLearningEventToProfile(
          profile,
          createLearningEvent({ languageId: 'de', activityId: 'cafe_library', objectiveIds: ['skill:reading'], result: 'correct' })
        );
      }

      // 1 listening failure
      profile = applyLearningEventToProfile(
        profile,
        createLearningEvent({ languageId: 'de', activityId: 'radio_lab', objectiveIds: ['skill:listening'], result: 'incorrect' })
      );

      const recs = generateLearningRecommendations({ profile });
      const listeningRec = recs.find((r) => r.actionType === 'train_listening');

      assert.ok(listeningRec);
      assert.equal(listeningRec.suggestedActivity, 'radio_lab');
      assert.ok(listeningRec.reason.includes('reading comprehension'));
    });

    it('recommends conversational simulation when foundational mastery is solid', () => {
      let profile = createEmptyLanguageProfile('es');

      // Master multiple items
      for (let i = 1; i <= 6; i++) {
        for (let rep = 0; rep < 3; rep++) {
          profile = applyLearningEventToProfile(
            profile,
            createLearningEvent({ languageId: 'es', activityId: 'lesson', objectiveIds: [`item:es-1-${i}`], result: 'correct' })
          );
        }
      }

      assert.ok(profile.overallMastery >= 0.65);

      const recs = generateLearningRecommendations({ profile });
      const roleplayRec = recs.find((r) => r.actionType === 'roleplay_simulation');

      assert.ok(roleplayRec);
      assert.equal(roleplayRec.suggestedActivity, 'roleplay');
      assert.ok(roleplayRec.reason.includes('foundational vocabulary'));
    });

    it('strictly sorts recommendations by priority (urgent > high > recommended > maintenance)', () => {
      let profile = createEmptyLanguageProfile('fr');

      // Stumble
      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'incorrect' }),
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'incorrect' }),
      ]);

      const recs = generateLearningRecommendations({ profile });
      assert.ok(recs.length >= 2);
      assert.equal(recs[0].priority, 'urgent');
    });
  });

  describe('2. Dynamic Personalized Session Generator', () => {
    it('assembles a Quick (3–5 min) remedial sprint focusing on stumbles', () => {
      let profile = createEmptyLanguageProfile('fr');
      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'incorrect' }),
      ]);

      const session = generatePersonalizedSession({ profile, workoutType: 'quick' });

      assert.equal(session.workoutType, 'quick');
      assert.equal(session.targetDurationMinutes, 4);
      assert.ok(session.title.includes('Quick'));
      assert.equal(session.activities.length, 1);
      assert.equal(session.activities[0].activityId, 'mistake_clinic');
      assert.ok(session.activities[0].rationale.length > 0);
    });

    it('assembles a Balanced (10–15 min) workout combining review, core lesson, and drill', () => {
      const profile = createEmptyLanguageProfile('de');
      const session = generatePersonalizedSession({ profile, workoutType: 'balanced' });

      assert.equal(session.workoutType, 'balanced');
      assert.equal(session.targetDurationMinutes, 12);
      assert.equal(session.activities.length, 3);

      const kinds = session.activities.map((a) => a.activityId);
      assert.ok(kinds.includes('express_review'));
      assert.ok(kinds.includes('lesson'));
      assert.equal(
        session.activities.reduce((sum, a) => sum + a.durationMinutes, 0),
        12
      );
    });

    it('assembles an exhaustive Deep (20–30 min) immersion session across 4 skill dimensions', () => {
      const profile = createEmptyLanguageProfile('es');
      const session = generatePersonalizedSession({ profile, workoutType: 'deep' });

      assert.equal(session.workoutType, 'deep');
      assert.equal(session.targetDurationMinutes, 25);
      assert.equal(session.activities.length, 4);

      const kinds = session.activities.map((a) => a.activityId);
      assert.ok(kinds.includes('mistake_clinic'));
      assert.ok(kinds.includes('lesson'));
      assert.ok(kinds.includes('radio_lab'));
      assert.ok(kinds.includes('roleplay'));

      assert.equal(
        session.activities.reduce((sum, a) => sum + a.durationMinutes, 0),
        25
      );
    });
  });
});
