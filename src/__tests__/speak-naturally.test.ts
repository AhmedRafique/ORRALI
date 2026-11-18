import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateAcousticMetrics,
  updatePronunciationMap,
  getProgressiveAudioLibrary
} from '../speakNaturally';
import { PronunciationResult, PronunciationMap } from '../types';

describe('6.6.0 - Speak Naturally & Listening World', () => {
  describe('Acoustic Cadence & Intonation Metrics', () => {
    it('calculates WPM and identifies cadence health', () => {
      // 5 words in 2 seconds (2000ms) = 150 WPM -> too_fast
      let metrics = evaluateAcousticMetrics(2000, 5, [0.1, 0.5, 0.8, 0.3, 0.2]);
      assert.equal(metrics.cadenceWpm, 150);
      assert.equal(metrics.cadenceHealth, 'too_fast');

      // 5 words in 3.5 seconds = ~85 WPM -> good
      metrics = evaluateAcousticMetrics(3500, 5, [0.2, 0.6, 0.4]);
      assert.equal(metrics.cadenceHealth, 'good');

      // 5 words in 8 seconds = ~37.5 WPM -> too_slow
      metrics = evaluateAcousticMetrics(8000, 5, [0.1, 0.1]);
      assert.equal(metrics.cadenceHealth, 'too_slow');
    });

    it('calculates intonation variance from intensity samples', () => {
      // Flat intonation
      const flat = evaluateAcousticMetrics(3000, 5, [0.5, 0.5, 0.5, 0.5]);
      assert.ok(flat.intonationVariance < 10);

      // Highly variable intonation
      const dynamic = evaluateAcousticMetrics(3000, 5, [0.1, 0.9, 0.2, 0.8, 0.1]);
      assert.ok(dynamic.intonationVariance > 20);
    });
  });

  describe('Visual Pronunciation Skill Map', () => {
    it('aggregates word scores and average cadence', () => {
      const initialMap: PronunciationMap = {
        languageId: 'fr',
        wordScores: {},
        averageCadenceWpm: 0,
        cadenceHealth: 'good'
      };

      const result: PronunciationResult = {
        overallScore: 80,
        words: [
          { word: 'bonjour', score: 90, status: 'great' },
          { word: 'ça', score: 60, status: 'good' },
          { word: 'va', score: 70, status: 'good' }
        ],
        feedback: 'Good',
        passed: true,
        cadenceWpm: 100,
        intonationVariance: 40
      };

      const updated = updatePronunciationMap(initialMap, result);
      
      assert.ok(updated.wordScores['bonjour']);
      assert.equal(updated.wordScores['bonjour'].occurrences, 1);
      assert.equal(updated.wordScores['bonjour'].averageScore, 90);
      
      assert.equal(updated.averageCadenceWpm, 100);

      // Add a second result for 'bonjour'
      const result2: PronunciationResult = {
        overallScore: 90,
        words: [
          { word: 'bonjour', score: 100, status: 'great' }
        ],
        feedback: 'Great',
        passed: true,
        cadenceWpm: 120
      };

      const updated2 = updatePronunciationMap(updated, result2);
      assert.equal(updated2.wordScores['bonjour'].occurrences, 2);
      assert.equal(updated2.wordScores['bonjour'].averageScore, 95); // (90 + 100) / 2
      assert.equal(updated2.averageCadenceWpm, 110); // (100 + 120) / 2
    });
  });

  describe('Progressive Audio Library', () => {
    it('returns structured audio items for a specific level and focus', () => {
      const items = getProgressiveAudioLibrary('fr', 'B1', 'intonation');
      assert.ok(items.length > 0);
      assert.equal(items[0].level, 'B1');
      assert.equal(items[0].focus, 'intonation');
    });
  });
});
