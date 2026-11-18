import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocationsForLanguage,
  getCharacterPersona,
  updateNarrativeState,
  unlockLocation
} from '../learningWorld';
import { NarrativeState, LocationHub } from '../types';

describe('6.8.0 - Learning World & Living Characters', () => {
  describe('2D World Exploration (Locations)', () => {
    it('returns a list of locations for a specific language', () => {
      const locations = getLocationsForLanguage('fr');
      assert.ok(locations.length > 0);
      assert.equal(locations[0].languageId, 'fr');
    });

    it('unlocks a location based on narrative progress', () => {
      const location: LocationHub = {
        id: 'paris_cafe',
        name: 'Le Café de Paris',
        description: 'A cozy cafe',
        languageId: 'fr',
        unlocked: false,
        characters: ['pierre']
      };

      const unlocked = unlockLocation(location);
      assert.equal(unlocked.unlocked, true);
    });
  });

  describe('Living Characters & Personas', () => {
    it('retrieves a character persona by ID', () => {
      const char = getCharacterPersona('pierre');
      assert.ok(char);
      assert.equal(char?.name, 'Pierre');
    });
  });

  describe('Narrative Continuity', () => {
    it('updates narrative state with completed events and relationship changes', () => {
      const initialState: NarrativeState = {
        completedEvents: [],
        activeStoryline: null,
        characterRelationships: {}
      };

      const newState = updateNarrativeState(initialState, {
        newEvent: 'met_pierre',
        relationshipChange: { characterId: 'pierre', delta: 5 }
      });

      assert.ok(newState.completedEvents.includes('met_pierre'));
      assert.equal(newState.characterRelationships['pierre'], 5);

      const state2 = updateNarrativeState(newState, {
        relationshipChange: { characterId: 'pierre', delta: 3 }
      });
      assert.equal(state2.characterRelationships['pierre'], 8);
    });
  });
});
