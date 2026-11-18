import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectWordGender,
  getGenderPalette,
  GENDER_PALETTES,
} from '../gender';

describe('Grammatical Gender & Visual Chromatic Immersion Engine (TDD)', () => {
  describe('1. German Chromatic Gender Detection (der / die / das)', () => {
    it('detects masculine German articles and nouns', () => {
      assert.equal(detectWordGender('der', 'de'), 'masculine');
      assert.equal(detectWordGender('einen', 'de'), 'masculine');
      assert.equal(detectWordGender('Kaffee', 'de'), 'masculine');
      assert.equal(detectWordGender('Zug', 'de'), 'masculine');
    });

    it('detects feminine German articles and nouns', () => {
      assert.equal(detectWordGender('die', 'de'), 'feminine');
      assert.equal(detectWordGender('eine', 'de'), 'feminine');
      assert.equal(detectWordGender('Fahrkarte', 'de'), 'feminine');
      assert.equal(detectWordGender('Rechnung', 'de'), 'feminine');
    });

    it('detects neuter German articles and nouns', () => {
      assert.equal(detectWordGender('das', 'de'), 'neuter');
      assert.equal(detectWordGender('Museum', 'de'), 'neuter');
      assert.equal(detectWordGender('Brot', 'de'), 'neuter');
      assert.equal(detectWordGender('Gleis', 'de'), 'neuter');
    });
  });

  describe('2. French Chromatic Gender Detection (le / la)', () => {
    it('detects masculine French articles and nouns', () => {
      assert.equal(detectWordGender('le', 'fr'), 'masculine');
      assert.equal(detectWordGender('un', 'fr'), 'masculine');
      assert.equal(detectWordGender('café', 'fr'), 'masculine');
      assert.equal(detectWordGender('musée', 'fr'), 'masculine');
      assert.equal(detectWordGender('croissant', 'fr'), 'masculine');
    });

    it('detects feminine French articles and nouns', () => {
      assert.equal(detectWordGender('la', 'fr'), 'feminine');
      assert.equal(detectWordGender('une', 'fr'), 'feminine');
      assert.equal(detectWordGender('gare', 'fr'), 'feminine');
      assert.equal(detectWordGender('chambre', 'fr'), 'feminine');
      assert.equal(detectWordGender('addition', 'fr'), 'feminine');
    });
  });

  describe('3. Spanish Chromatic Gender Detection (el / la)', () => {
    it('detects masculine Spanish articles and nouns', () => {
      assert.equal(detectWordGender('el', 'es'), 'masculine');
      assert.equal(detectWordGender('un', 'es'), 'masculine');
      assert.equal(detectWordGender('café', 'es'), 'masculine');
      assert.equal(detectWordGender('museo', 'es'), 'masculine');
      assert.equal(detectWordGender('aeropuerto', 'es'), 'masculine');
    });

    it('detects feminine Spanish articles and nouns', () => {
      assert.equal(detectWordGender('la', 'es'), 'feminine');
      assert.equal(detectWordGender('una', 'es'), 'feminine');
      assert.equal(detectWordGender('tortilla', 'es'), 'feminine');
      assert.equal(detectWordGender('cuenta', 'es'), 'feminine');
      assert.equal(detectWordGender('estación', 'es'), 'feminine');
    });
  });

  describe('4. Chromatic Palettes & Non-Gendered Fallbacks', () => {
    it('provides distinct chromatic styling for masculine, feminine, and neuter', () => {
      const masc = getGenderPalette('masculine');
      assert.equal(masc.symbol, '♂');
      assert.equal(masc.label, 'Masculine');
      assert.equal(masc.badge, '#1E5AA8'); // Cobalt Blue

      const fem = getGenderPalette('feminine');
      assert.equal(fem.symbol, '♀');
      assert.equal(fem.label, 'Feminine');
      assert.equal(fem.badge, '#B8325E'); // Rose Crimson

      const neut = getGenderPalette('neuter');
      assert.equal(neut.symbol, '⚲');
      assert.equal(neut.label, 'Neuter');
      assert.equal(neut.badge, '#2E7D4E'); // Sage Emerald
    });

    it('returns null safely for verbs, adverbs, and non-gendered words', () => {
      assert.equal(detectWordGender('hier', 'fr'), null);
      assert.equal(detectWordGender('visité', 'fr'), null);
      assert.equal(detectWordGender('gestern', 'de'), null);
      assert.equal(detectWordGender('ayer', 'es'), null);
    });
  });
});
