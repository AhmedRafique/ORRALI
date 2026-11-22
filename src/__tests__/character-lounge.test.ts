import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_BACKSTORIES,
  getCharacterBackstory,
  getCharacterGreeting,
  getUnlockedAnecdotes,
} from '../personas/backstories';
import { CHARACTER_ROSTER } from '../personas/roster';

describe('Character Friendship Lounge & Cultural Backstory Hub (TDD)', () => {
  const characters = Object.keys(CHARACTER_ROSTER);

  describe('1. Backstory Completeness for all 9 European Triad Personas', () => {
    it('ensures every character in the roster has a rich cultural backstory and 4 anecdotes', () => {
      assert.equal(characters.length, 9);

      for (const charId of characters) {
        const bs = getCharacterBackstory(charId);
        assert.ok(bs, `Missing backstory for ${charId}`);
        assert.ok(bs.originCity.length > 0);
        assert.ok(bs.passions.length >= 2);
        assert.ok(bs.favoriteSpot.length > 0);
        assert.ok(bs.secretTip.length > 0);

        // Greetings across all 4 tiers
        assert.ok(bs.greetings.acquaintance.target.length > 0);
        assert.ok(bs.greetings.regular.target.length > 0);
        assert.ok(bs.greetings.confidant.target.length > 0);
        assert.ok(bs.greetings.partner.target.length > 0);

        // 4 progressive anecdotes
        assert.equal(bs.anecdotes.length, 4);
      }
    });
  });

  describe('2. Progressive Relationship Tier Unlocking', () => {
    it('unlocks anecdotes progressively based on relationship level', () => {
      // Level 0: acquaintance only
      const l0 = getUnlockedAnecdotes('pierre', 0);
      assert.equal(l0.length, 1);
      assert.equal(l0[0].tierRequired, 'acquaintance');

      // Level 15: regular
      const l15 = getUnlockedAnecdotes('pierre', 15);
      assert.equal(l15.length, 2);

      // Level 35: confidant
      const l35 = getUnlockedAnecdotes('pierre', 35);
      assert.equal(l35.length, 3);

      // Level 60: partner (full access)
      const l60 = getUnlockedAnecdotes('pierre', 60);
      assert.equal(l60.length, 4);
    });
  });

  describe('3. Character Voice Greetings & Cultural Etiquette', () => {
    it('returns appropriate greetings that evolve from polite formal to deep friendship', () => {
      const gAcquaintance = getCharacterGreeting('pierre', 0);
      assert.ok(gAcquaintance.target.includes('Bonjour'));

      const gPartner = getCharacterGreeting('pierre', 55);
      assert.ok(gPartner.target.includes('journée'));
    });

    it('provides genuine regional German and Spanish etiquette tips', () => {
      const hans = getCharacterBackstory('hans')!;
      assert.ok(hans.secretTip.includes('Servus'));

      const frauSchmidt = getCharacterBackstory('frau_schmidt')!;
      assert.ok(frauSchmidt.secretTip.includes('Moin'));

      const mateo = getCharacterBackstory('mateo')!;
      assert.ok(mateo.secretTip.includes('Tapas'));
    });
  });
});
