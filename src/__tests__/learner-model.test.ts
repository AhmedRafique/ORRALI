import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_SKILL_DOMAINS,
  createEmptyLanguageProfile,
  resolveSkillDomain,
  computeEvidenceScore,
  computeConfidence,
  computeNextReviewIntervalDays,
  applyLearningEventToProfile,
  applyEventsBatchToProfile,
  applyTimeDecayToProfile,
  identifyStumbleObjectives,
} from '../learnerModel';
import { createLearningEvent } from '../events';

describe('Learner Knowledge Model & Mastery Engine (TDD)', () => {
  describe('1. Profile Creation & Domain Mapping', () => {
    it('initializes a clean profile covering all 10 skill domains', () => {
      const profile = createEmptyLanguageProfile('fr');

      assert.equal(profile.languageId, 'fr');
      assert.equal(profile.overallMastery, 0);
      assert.equal(profile.overallConfidence, 0);
      assert.deepEqual(Object.keys(profile.objectives), []);
      assert.equal(Object.keys(profile.domains).length, 10);

      for (const d of ALL_SKILL_DOMAINS) {
        assert.ok(profile.domains[d]);
        assert.equal(profile.domains[d].mastery, 0);
        assert.equal(profile.domains[d].confidence, 0);
        assert.equal(profile.domains[d].needsPractice, false);
      }
    });

    it('resolves skill domains correctly across grammar tenses, skills, and communication', () => {
      assert.equal(resolveSkillDomain('skill:speaking'), 'speaking');
      assert.equal(resolveSkillDomain('skill:listening'), 'listening');
      assert.equal(resolveSkillDomain('skill:writing'), 'writing');
      assert.equal(resolveSkillDomain('skill:reading'), 'reading');
      assert.equal(resolveSkillDomain('skill:syntax'), 'syntax');
      assert.equal(resolveSkillDomain('activity:roleplay'), 'communication');
      assert.equal(resolveSkillDomain('grammar:passé_composé'), 'grammar_past');
      assert.equal(resolveSkillDomain('grammar:perfekt'), 'grammar_past');
      assert.equal(resolveSkillDomain('grammar:futur_proche'), 'grammar_future');
      assert.equal(resolveSkillDomain('grammar:articles'), 'grammar_present');
      assert.equal(resolveSkillDomain('item:fr-1-1'), 'vocabulary');
    });
  });

  describe('2. Confidence vs Mastery Decoupling', () => {
    it('strictly prevents 1 correct answer from yielding 100% confidence', () => {
      const conf1 = computeConfidence(1.0);
      // 1 attempt with k=5 gives 1 - exp(-0.2) ≈ 0.18
      assert.ok(conf1 < 0.25);
      assert.ok(conf1 > 0.15);

      const conf5 = computeConfidence(5.0);
      // 5 attempts gives 1 - exp(-1.0) ≈ 0.63
      assert.ok(conf5 >= 0.60 && conf5 <= 0.65);

      const conf10 = computeConfidence(10.0);
      // 10 attempts gives 1 - exp(-2.0) ≈ 0.86
      assert.ok(conf10 >= 0.84 && conf10 <= 0.88);
    });

    it('initializes a single correct answer with moderate mastery and low confidence', () => {
      const initialProfile = createEmptyLanguageProfile('fr');
      const event = createLearningEvent({
        languageId: 'fr',
        activityId: 'lesson',
        objectiveIds: ['item:fr-1-1'],
        result: 'correct',
        difficulty: 'A1',
      });

      const updated = applyLearningEventToProfile(initialProfile, event);
      const obj = updated.objectives['item:fr-1-1'];

      assert.ok(obj);
      assert.equal(obj.totalAttempts, 1);
      assert.equal(obj.correctAttempts, 1);
      assert.equal(obj.failCount, 0);
      // Mastery should be conservative (0.7) and confidence ~0.18 (NOT 100%)
      assert.equal(obj.mastery, 0.7);
      assert.ok(obj.confidence < 0.25);
    });
  });

  describe('3. Mastery Progression, Streaks & Errors', () => {
    it('progresses mastery and confidence asymptotically with repeated practice', () => {
      let profile = createEmptyLanguageProfile('de');

      // 5 consecutive correct answers
      for (let i = 0; i < 5; i++) {
        const evt = createLearningEvent({
          languageId: 'de',
          activityId: 'lesson',
          objectiveIds: ['grammar:akkusativ'],
          result: 'correct',
          difficulty: 'A1',
          createdAt: 1000 + i * 3600000,
        });
        profile = applyLearningEventToProfile(profile, evt);
      }

      const obj = profile.objectives['grammar:akkusativ'];
      assert.equal(obj.totalAttempts, 5);
      assert.equal(obj.correctAttempts, 5);
      assert.equal(obj.streak, 5);
      assert.ok(obj.mastery >= 0.85);
      assert.ok(obj.confidence >= 0.60);
      assert.equal(profile.domains.grammar_present.needsPractice, false);
    });

    it('penalizes mastery on repeated failures and flags active stumbles', () => {
      let profile = createEmptyLanguageProfile('fr');

      // 1 correct, then 3 failures
      profile = applyLearningEventToProfile(
        profile,
        createLearningEvent({
          languageId: 'fr',
          activityId: 'verb_gym',
          objectiveIds: ['grammar:passé_composé'],
          result: 'correct',
        })
      );

      for (let i = 0; i < 3; i++) {
        profile = applyLearningEventToProfile(
          profile,
          createLearningEvent({
            languageId: 'fr',
            activityId: 'verb_gym',
            objectiveIds: ['grammar:passé_composé'],
            result: 'incorrect',
            errorCategory: 'conjugation',
          })
        );
      }

      const obj = profile.objectives['grammar:passé_composé'];
      assert.equal(obj.totalAttempts, 4);
      assert.equal(obj.failCount, 3);
      assert.equal(obj.streak, 0);
      assert.ok(obj.mastery < 0.45);
      assert.equal(obj.errorDistribution.conjugation, 3);
      assert.ok(profile.activeStumbles.includes('grammar:passé_composé'));
      assert.equal(profile.domains.grammar_past.needsPractice, true);
    });
  });

  describe('4. Forgetting Curve / Time Decay', () => {
    it('applies mastery decay when unpracticed for multiple days', () => {
      let profile = createEmptyLanguageProfile('es');
      const start = 1_000_000_000;

      // Master an objective at start time
      for (let i = 0; i < 5; i++) {
        profile = applyLearningEventToProfile(
          profile,
          createLearningEvent({
            languageId: 'es',
            activityId: 'lesson',
            objectiveIds: ['item:es-1-1'],
            result: 'correct',
            createdAt: start,
          })
        );
      }

      const initialMastery = profile.objectives['item:es-1-1'].mastery;
      assert.ok(initialMastery >= 0.85);

      // Simulate 10 days later
      const tenDaysLater = start + 10 * 86_400_000;
      const decayedProfile = applyTimeDecayToProfile(profile, tenDaysLater);

      const decayedObj = decayedProfile.objectives['item:es-1-1'];
      assert.ok(decayedObj.mastery < initialMastery);
      // Decay at 1.5% per day for 10 days -> ~86% of original
      assert.ok(decayedObj.mastery >= initialMastery * 0.80);
      assert.ok(decayedObj.mastery <= initialMastery * 0.90);
    });

    it('leaves recently practiced objectives intact', () => {
      let profile = createEmptyLanguageProfile('es');
      const now = Date.now();

      profile = applyLearningEventToProfile(
        profile,
        createLearningEvent({
          languageId: 'es',
          activityId: 'lesson',
          objectiveIds: ['item:es-1-1'],
          result: 'correct',
          createdAt: now - 3600000, // 1 hour ago
        })
      );

      const before = profile.objectives['item:es-1-1'].mastery;
      const afterProfile = applyTimeDecayToProfile(profile, now);
      assert.equal(afterProfile.objectives['item:es-1-1'].mastery, before);
    });
  });

  describe('5. Stumble Detection & Next Review Scheduling', () => {
    it('computes short review interval for weak objectives and long interval for mature ones', () => {
      // Weak objective
      assert.equal(computeNextReviewIntervalDays(0.3, 0.5, 0), 1);
      // Developing objective
      assert.equal(computeNextReviewIntervalDays(0.6, 0.5, 2), 3);
      // Strong objective
      assert.equal(computeNextReviewIntervalDays(0.8, 0.5, 3), 7);
      // Mature high-confidence objective
      const matureDays = computeNextReviewIntervalDays(0.9, 0.8, 5);
      assert.ok(matureDays >= 14);
    });

    it('identifies top stumble objectives sorted by urgency', () => {
      let profile = createEmptyLanguageProfile('fr');

      // Objective A: 1 fail out of 3
      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'correct' }),
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'correct' }),
        createLearningEvent({ languageId: 'fr', activityId: 'lesson', objectiveIds: ['item:fr-1-1'], result: 'incorrect' }),
      ]);

      // Objective B: 3 fails out of 3
      profile = applyEventsBatchToProfile(profile, [
        createLearningEvent({ languageId: 'fr', activityId: 'verb_gym', objectiveIds: ['grammar:passé_composé'], result: 'incorrect' }),
        createLearningEvent({ languageId: 'fr', activityId: 'verb_gym', objectiveIds: ['grammar:passé_composé'], result: 'incorrect' }),
        createLearningEvent({ languageId: 'fr', activityId: 'verb_gym', objectiveIds: ['grammar:passé_composé'], result: 'incorrect' }),
      ]);

      const stumbles = identifyStumbleObjectives(profile, 5);
      assert.ok(stumbles.length >= 2);
      // Objective B should be top stumble because of lower mastery and higher fail count
      assert.equal(stumbles[0].objectiveId, 'grammar:passé_composé');
    });
  });
});
