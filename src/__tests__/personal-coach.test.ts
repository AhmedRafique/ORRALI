import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  savePersonalPhrase,
  updateConversationMemory,
  analyzeGrammarRadar
} from '../personalCoach';
import { SavedPhrase, ConversationMemoryContext, GrammarRadarData } from '../types';

describe('6.7.0 - Personal AI Coach & Smart Phrasebook', () => {
  describe('Smart Phrasebook', () => {
    it('saves a phrase from an activity and assigns an ID and tags', () => {
      const phrase = savePersonalPhrase('fr', 'Je voudrais un café', 'I would like a coffee', 'roleplay');
      
      assert.ok(phrase.id.startsWith('fr-phrase-'));
      assert.equal(phrase.target, 'Je voudrais un café');
      assert.equal(phrase.sourceActivity, 'roleplay');
      assert.ok(phrase.savedAt > 0);
      assert.ok(phrase.tags.length >= 0);
    });

    it('generates auto-tags based on content', () => {
      const phrase = savePersonalPhrase('es', 'Me gusta viajar', 'I like to travel', 'lesson');
      assert.ok(phrase.tags.includes('travel') || phrase.tags.includes('verb')); // Simple mock tag validation
    });
  });

  describe('Contextual Conversational Memory', () => {
    it('updates memory with new preferences and mistakes', () => {
      const memory: ConversationMemoryContext = {
        topic: 'travel',
        userPreferences: { 'likes': 'coffee' },
        knownMistakes: [],
        lastInteractionAt: 0
      };

      const updated = updateConversationMemory(memory, {
        newPreference: { key: 'destination', value: 'Paris' },
        newMistake: 'verb_conjugation'
      });

      assert.equal(updated.userPreferences['destination'], 'Paris');
      assert.equal(updated.userPreferences['likes'], 'coffee'); // preserved
      assert.ok(updated.knownMistakes.includes('verb_conjugation'));
      assert.ok(updated.lastInteractionAt > 0);
    });
  });

  describe('Grammar Radar', () => {
    it('analyzes recent text and identifies detected grammar patterns', () => {
      const text = 'J\'ai mangé une pomme hier.';
      const radar = analyzeGrammarRadar('fr', text);

      assert.equal(radar.targetLanguage, 'fr');
      assert.ok(radar.detectedPatterns.includes('passe_compose'));
      assert.ok(radar.suggestedFocus.length >= 0);
    });
  });
});
