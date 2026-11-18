import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLearningEvent,
  deriveObjectiveIds,
  inferErrorCategory,
  levenshteinDistance,
  recordLearningEvent,
  recordLearningEventsBatch,
  queryLearningEvents,
  summarizeLearningEvents,
  clearInMemoryEvents,
  getInMemoryEvents,
} from '../events';
import { LearningEvent, LearningErrorCategory } from '../types';

describe('Standardized Learning Events & Telemetry Engine (TDD)', () => {
  beforeEach(() => {
    clearInMemoryEvents();
  });

  describe('1. Standardized Event Creation & Validation', () => {
    it('creates an event with auto-generated ID, timestamp, and default values', () => {
      const evt = createLearningEvent({
        languageId: 'fr',
        activityId: 'lesson',
        objectiveIds: ['item:fr-1-1', 'level:A1'],
        result: 'correct',
        difficulty: 'A1',
      });

      assert.ok(evt.id.startsWith('evt_'));
      assert.equal(evt.languageId, 'fr');
      assert.equal(evt.activityId, 'lesson');
      assert.deepEqual(evt.objectiveIds, ['item:fr-1-1', 'level:A1']);
      assert.equal(evt.result, 'correct');
      assert.equal(evt.difficulty, 'A1');
      assert.equal(evt.confidence, 1.0);
      assert.equal(evt.durationMs, 0);
      assert.equal(evt.hintsUsed, 0);
      assert.equal(evt.attemptsCount, 1);
      assert.ok(evt.createdAt > 0);
    });

    it('clamps confidence and score to [0.0, 1.0]', () => {
      const evtHigh = createLearningEvent({
        languageId: 'de',
        activityId: 'shadowing',
        result: 'correct',
        confidence: 1.8,
        score: 1.2,
      });
      assert.equal(evtHigh.confidence, 1.0);
      assert.equal(evtHigh.score, 1.0);

      const evtLow = createLearningEvent({
        languageId: 'de',
        activityId: 'shadowing',
        result: 'incorrect',
        confidence: -0.5,
        score: -0.2,
      });
      assert.equal(evtLow.confidence, 0.0);
      assert.equal(evtLow.score, 0.0);
    });

    it('normalizes negative durations and invalid attempt counts', () => {
      const evt = createLearningEvent({
        languageId: 'es',
        activityId: 'speed_recall',
        result: 'correct',
        durationMs: -500,
        hintsUsed: -2,
        attemptsCount: 0,
      });

      assert.equal(evt.durationMs, 0);
      assert.equal(evt.hintsUsed, 0);
      assert.equal(evt.attemptsCount, 1);
    });
  });

  describe('2. Standardized Error Taxonomy (10 Categories)', () => {
    it('infers conjugation error for verb gym', () => {
      const cat = inferErrorCategory({
        activityId: 'verb_gym',
        target: 'suis',
        userResponse: 'sommes',
      });
      assert.equal(cat, 'conjugation');
    });

    it('infers gender error when isGender flag is set', () => {
      const cat = inferErrorCategory({
        activityId: 'lesson',
        isGender: true,
        target: 'der Kaffee',
        userResponse: 'die Kaffee',
      });
      assert.equal(cat, 'gender');
    });

    it('infers word_order error for scramble exercise', () => {
      const cat = inferErrorCategory({
        activityId: 'lesson',
        exerciseKind: 'scramble',
        target: 'Je voudrais un café',
        userResponse: 'Un café voudrais je',
      });
      assert.equal(cat, 'word_order');
    });

    it('infers listening error for radio lab dictation', () => {
      const cat = inferErrorCategory({
        activityId: 'radio_lab',
        exerciseKind: 'listen',
        target: 'vous avez',
        userResponse: 'vous allez',
      });
      assert.equal(cat, 'listening');
    });

    it('infers pronunciation error for shadowing or speak drills', () => {
      const cat = inferErrorCategory({
        activityId: 'shadowing',
        exerciseKind: 'speak',
        target: 'Guten Tag',
      });
      assert.equal(cat, 'pronunciation');
    });

    it('infers communication_intent error when roleplay intent is not met', () => {
      const cat = inferErrorCategory({
        activityId: 'roleplay',
        intentMet: false,
        target: 'Order food',
        userResponse: 'Bla bla bla',
      });
      assert.equal(cat, 'communication_intent');
    });

    it('infers spelling error when Levenshtein distance is minor (1-2 chars)', () => {
      assert.equal(levenshteinDistance('croissant', 'croisant'), 1);
      const cat = inferErrorCategory({
        activityId: 'lesson',
        exerciseKind: 'type',
        target: 'croissant',
        userResponse: 'croisant',
      });
      assert.equal(cat, 'spelling');
    });

    it('infers vocabulary error for multiple choice distractors', () => {
      const cat = inferErrorCategory({
        activityId: 'lesson',
        exerciseKind: 'choice',
        target: 'pomme',
        userResponse: 'orange',
      });
      assert.equal(cat, 'vocabulary');
    });

    it('infers grammar as standard fallback for structural errors', () => {
      const cat = inferErrorCategory({
        activityId: 'lesson',
        exerciseKind: 'type',
        target: 'Nous sommes allés',
        userResponse: 'Nous avons allé',
      });
      assert.equal(cat, 'grammar');
    });
  });

  describe('3. Objective IDs Derivation', () => {
    it('derives item, level, skill, and grammar objective tags', () => {
      const tags = deriveObjectiveIds({
        itemId: 'fr-1-2',
        level: 'A1',
        activityId: 'lesson',
        exerciseKind: 'speak',
        grammarTag: 'politeness',
        errorCategory: 'pronunciation',
      });

      assert.deepEqual(tags, [
        'activity:lesson',
        'error:pronunciation',
        'grammar:politeness',
        'item:fr-1-2',
        'level:A1',
        'skill:speaking',
      ]);
    });

    it('maps all exercise kinds to appropriate pedagogical skills', () => {
      assert.ok(deriveObjectiveIds({ activityId: 'lesson', exerciseKind: 'listen' }).includes('skill:listening'));
      assert.ok(deriveObjectiveIds({ activityId: 'lesson', exerciseKind: 'type' }).includes('skill:writing'));
      assert.ok(deriveObjectiveIds({ activityId: 'lesson', exerciseKind: 'choice' }).includes('skill:reading'));
      assert.ok(deriveObjectiveIds({ activityId: 'lesson', exerciseKind: 'scramble' }).includes('skill:syntax'));
      assert.ok(deriveObjectiveIds({ activityId: 'lesson', exerciseKind: 'intro' }).includes('skill:scaffolding'));
    });
  });

  describe('4. Event Recording, Batching & Filtering', () => {
    it('records an event to the in-memory buffer', async () => {
      const evt = createLearningEvent({
        languageId: 'fr',
        activityId: 'lesson',
        result: 'correct',
      });

      await recordLearningEvent(evt);
      const events = getInMemoryEvents();
      assert.equal(events.length, 1);
      assert.equal(events[0].id, evt.id);
    });

    it('records a batch of events atomically', async () => {
      const e1 = createLearningEvent({ languageId: 'de', activityId: 'verb_gym', result: 'correct' });
      const e2 = createLearningEvent({ languageId: 'de', activityId: 'verb_gym', result: 'incorrect', errorCategory: 'conjugation' });
      const e3 = createLearningEvent({ languageId: 'es', activityId: 'roleplay', result: 'correct' });

      await recordLearningEventsBatch([e1, e2, e3]);
      const events = getInMemoryEvents();
      assert.equal(events.length, 3);
    });

    it('filters events by language, activity, objective, and error category', async () => {
      const e1 = createLearningEvent({
        languageId: 'fr',
        activityId: 'lesson',
        objectiveIds: ['item:fr-1-1'],
        result: 'correct',
      });
      const e2 = createLearningEvent({
        languageId: 'fr',
        activityId: 'verb_gym',
        objectiveIds: ['verb:avoir'],
        result: 'incorrect',
        errorCategory: 'conjugation',
      });
      const e3 = createLearningEvent({
        languageId: 'de',
        activityId: 'lesson',
        objectiveIds: ['item:de-1-1'],
        result: 'correct',
      });

      await recordLearningEventsBatch([e1, e2, e3]);

      const frEvents = await queryLearningEvents({ languageId: 'fr' });
      assert.equal(frEvents.length, 2);

      const verbGymEvents = await queryLearningEvents({ activityId: 'verb_gym' });
      assert.equal(verbGymEvents.length, 1);
      assert.equal(verbGymEvents[0].errorCategory, 'conjugation');

      const itemEvents = await queryLearningEvents({ objectiveId: 'item:fr-1-1' });
      assert.equal(itemEvents.length, 1);
    });
  });

  describe('5. Analytics & Event Summarization', () => {
    it('summarizes an empty array safely without division by zero', () => {
      const summary = summarizeLearningEvents([]);
      assert.equal(summary.totalEvents, 0);
      assert.equal(summary.correctCount, 0);
      assert.equal(summary.overallAccuracyPercent, 0);
      assert.equal(summary.averageConfidence, 1.0);
      assert.equal(summary.topStumbleObjectives.length, 0);
    });

    it('computes accuracy, error distributions, and identifies top stumble objectives', () => {
      const events: LearningEvent[] = [
        createLearningEvent({
          languageId: 'fr',
          activityId: 'lesson',
          objectiveIds: ['item:fr-1-1', 'grammar:passé_composé'],
          result: 'correct',
          durationMs: 3000,
          confidence: 1.0,
        }),
        createLearningEvent({
          languageId: 'fr',
          activityId: 'verb_gym',
          objectiveIds: ['item:fr-1-1', 'grammar:passé_composé'],
          result: 'incorrect',
          errorCategory: 'conjugation',
          durationMs: 4000,
          confidence: 0.9,
        }),
        createLearningEvent({
          languageId: 'fr',
          activityId: 'lesson',
          objectiveIds: ['item:fr-2-1', 'grammar:gender'],
          result: 'incorrect',
          errorCategory: 'gender',
          durationMs: 2500,
          confidence: 1.0,
        }),
        createLearningEvent({
          languageId: 'fr',
          activityId: 'lesson',
          objectiveIds: ['item:fr-1-1', 'grammar:passé_composé'],
          result: 'incorrect',
          errorCategory: 'conjugation',
          durationMs: 3500,
          confidence: 1.0,
        }),
      ];

      const summary = summarizeLearningEvents(events);

      assert.equal(summary.totalEvents, 4);
      assert.equal(summary.correctCount, 1);
      assert.equal(summary.incorrectCount, 3);
      assert.equal(summary.overallAccuracyPercent, 25.0);
      assert.equal(summary.averageConfidence, 0.98);
      assert.equal(summary.totalDurationMs, 13000);

      // Error distribution
      assert.equal(summary.errorDistribution.conjugation, 2);
      assert.equal(summary.errorDistribution.gender, 1);
      assert.equal(summary.errorDistribution.spelling, 0);

      // Top stumbles
      assert.ok(summary.topStumbleObjectives.length >= 2);
      assert.equal(summary.topStumbleObjectives[0].objectiveId, 'item:fr-1-1');
      assert.equal(summary.topStumbleObjectives[0].failureCount, 2);
    });
  });
});
