import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllDomainPhrases,
  getDomainStatistics,
  queryDomainLexicon,
  StreetDomain,
} from '../lexicon/index';
import { getLexiconEntries } from '../lexicon';
import { courses } from '../content/index';
import { Progress } from '../types';

const mockProgress: Progress = {
  xp: 0,
  streak: 0,
  lastDay: '',
  dailyGoal: 20,
  dailyXp: 0,
  dailyXpDay: '',
  completed: {},
  cards: {},
};

describe('3,000+ Real-World Street Phrase & Domain Lexicon Bank (TDD)', () => {
  const domains: StreetDomain[] = [
    'medical_pharmacy',
    'housing_rental',
    'public_admin_visas',
    'transit_breakdown',
    'romance_social',
    'work_tech_finance',
    'gastronomy_culinary',
    'urban_slang_nuance',
  ];

  describe('1. European Triad Domain Coverage & Integrity', () => {
    it('provides rich street phrase entries across all 8 survival domains for FR, DE, and ES', () => {
      for (const lang of ['fr', 'de', 'es'] as const) {
        const phrases = getAllDomainPhrases(lang);
        assert.ok(phrases.length >= 24, `Lang ${lang} should have multiple domain phrases`);

        const representedDomains = new Set(phrases.map((p) => p.domain));
        for (const dom of domains) {
          assert.ok(representedDomains.has(dom), `Lang ${lang} missing domain: ${dom}`);
        }

        // Verify data integrity
        for (const phrase of phrases) {
          assert.ok(phrase.id.length > 0);
          assert.ok(phrase.target.length > 0);
          assert.ok(phrase.en.length > 0);
          assert.ok((phrase.phonetic ?? '').length > 0);
          assert.ok(['A1', 'A2', 'B1', 'B2', 'C1'].includes(phrase.level));
        }
      }
    });
  });

  describe('2. Lexicon Search & Filter Engine', () => {
    it('performs accent-lenient and case-insensitive query matching on target and translation', () => {
      // Search in French for "urgence"
      const resFr = queryDomainLexicon({
        languageId: 'fr',
        query: 'urgence',
      });
      assert.ok(resFr.length > 0);
      assert.ok(resFr.some((p) => p.target.toLowerCase().includes('urgence')));

      // Search in German for "Apotheke" with lowercase query
      const resDe = queryDomainLexicon({
        languageId: 'de',
        query: 'apotheke',
      });
      assert.ok(resDe.length > 0);
      assert.ok(resDe.some((p) => p.target.toLowerCase().includes('apotheke')));

      // Search in Spanish for "coche"
      const resEs = queryDomainLexicon({
        languageId: 'es',
        query: 'coche',
      });
      assert.ok(resEs.length > 0);
      assert.ok(resEs.some((p) => p.target.toLowerCase().includes('coche')));
    });

    it('filters phrases accurately by specific street domain', () => {
      const medPhrases = queryDomainLexicon({
        languageId: 'fr',
        domain: 'medical_pharmacy',
      });
      assert.ok(medPhrases.length > 0);
      assert.ok(medPhrases.every((p) => p.domain === 'medical_pharmacy'));
    });

    it('filters phrases accurately by CEFR level', () => {
      const b2Phrases = queryDomainLexicon({
        languageId: 'de',
        level: 'B2',
      });
      assert.ok(b2Phrases.length > 0);
      assert.ok(b2Phrases.every((p) => p.level === 'B2'));
    });
  });

  describe('3. Domain Statistics Engine', () => {
    it('computes breakdown across all 8 street domains with correct icons and non-zero counts', () => {
      for (const lang of ['fr', 'de', 'es'] as const) {
        const stats = getDomainStatistics(lang);
        assert.equal(stats.length, 8);
        for (const s of stats) {
          assert.ok(s.count > 0, `Domain ${s.domain} in ${lang} should have items`);
          assert.ok(s.icon.length > 0);
          assert.ok(s.label.length > 0);
        }
      }
    });
  });

  describe('4. Seamless Integration with Core Lexicon & SRS Store', () => {
    it('enriches getLexiconEntries with both curriculum items and domain street phrases', () => {
      const frCourse = courses.find((c) => c.code === 'fr')!;
      const entries = getLexiconEntries(frCourse, mockProgress);

      // 180 curriculum phrases + domain phrases
      assert.ok(entries.length > 180);
      assert.ok(entries.some((e) => e.item.id.startsWith('fr_lex_med_')));
      assert.ok(entries.some((e) => e.item.id.startsWith('fr-1-1')));
    });
  });
});
