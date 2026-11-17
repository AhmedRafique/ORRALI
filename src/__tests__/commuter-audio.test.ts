import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCommuterQueue,
  estimateCommuterSessionDuration,
  getCommuterPromptText,
  resolveNextCommuterStep,
  CommuterStep,
} from '../commuterAudio';
import { Item } from '../types';

const mockItems: Item[] = [
  { id: 'fr-1-1', target: 'Bonjour', en: 'Hello', phonetic: 'bohn-zhoor' },
  { id: 'fr-1-2', target: "S'il vous plaît", en: 'Please', phonetic: 'seel voo pleh' },
  { id: 'fr-1-3', target: 'Merci beaucoup', en: 'Thank you very much', phonetic: 'mair-see boh-koo' },
  { id: 'fr-1-4', target: 'Au revoir', en: 'Goodbye', phonetic: 'oh ruh-vwahr' },
];

describe('Commuter & Walking Audio Engine (TDD)', () => {
  describe('1. Queue Generation', () => {
    it('builds a bounded commuter queue from available items', () => {
      const queue = buildCommuterQueue(mockItems, 2);
      assert.equal(queue.length, 2);
      assert.equal(queue[0].id, 'fr-1-1');
      assert.equal(queue[1].id, 'fr-1-2');
    });

    it('handles empty item list safely', () => {
      const queue = buildCommuterQueue([], 5);
      assert.deepEqual(queue, []);
    });
  });

  describe('2. Step Sequencing & State Transitions', () => {
    it('progresses through all steps with slow phonetic repetition enabled', () => {
      let step: CommuterStep = 'prompt_en';
      step = resolveNextCommuterStep(step, true);
      assert.equal(step, 'thinking_pause');

      step = resolveNextCommuterStep(step, true);
      assert.equal(step, 'target_normal');

      step = resolveNextCommuterStep(step, true);
      assert.equal(step, 'short_pause');

      step = resolveNextCommuterStep(step, true);
      assert.equal(step, 'target_slow');

      step = resolveNextCommuterStep(step, true);
      assert.equal(step, 'completed');
    });

    it('skips slow repetition step when playSlowRepeat is false', () => {
      let step: CommuterStep = 'prompt_en';
      step = resolveNextCommuterStep(step, false);
      assert.equal(step, 'thinking_pause');

      step = resolveNextCommuterStep(step, false);
      assert.equal(step, 'target_normal');

      step = resolveNextCommuterStep(step, false);
      assert.equal(step, 'completed');
    });
  });

  describe('3. Language-Specific Prompt Generation', () => {
    it('generates clear English prompts for French, German, and Spanish', () => {
      const frPrompt = getCommuterPromptText('fr', 'Good morning');
      assert.equal(frPrompt, 'How do you say in French: Good morning?');

      const dePrompt = getCommuterPromptText('de', 'A coffee, please');
      assert.equal(dePrompt, 'How do you say in German: A coffee, please?');

      const esPrompt = getCommuterPromptText('es', 'The bill, please');
      assert.equal(esPrompt, 'How do you say in Spanish: The bill, please?');
    });
  });

  describe('4. Duration & Session Time Estimation', () => {
    it('calculates realistic duration in seconds for commuter queue', () => {
      const durationSec = estimateCommuterSessionDuration(mockItems.slice(0, 2), true);
      assert.ok(durationSec >= 15 && durationSec <= 35, `Expected 15-35s, got ${durationSec}s`);
    });
  });
});
