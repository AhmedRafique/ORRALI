import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { emptyProgress } from '../streak';
import { getLexiconEntries, filterLexicon, buildFlashcardDeck } from '../lexicon';
import { Progress } from '../types';

describe('Smart Lexicon & Searchable Dictionary Engine (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;

  it('classifies vocabulary into accurate mastery buckets (new, learning, mastered, stumble)', () => {
    let p: Progress = {
      ...emptyProgress(),
      cards: {
        'fr-1-1': { due: Date.now() + 1000000, interval: 25, ease: 2.7, reps: 5, lapses: 0 }, // Mastered
        'fr-1-2': { due: Date.now() + 100000, interval: 3, ease: 2.5, reps: 2, lapses: 0 },   // Learning
        'fr-1-3': { due: Date.now() - 1000, interval: 0, ease: 1.7, reps: 0, lapses: 2 },     // Stumble
        // fr-1-4 is unpracticed -> New
      },
    };

    const entries = getLexiconEntries(fr, p);
    assert.ok(entries.length >= 60);

    const e1 = entries.find((e) => e.item.id === 'fr-1-1')!;
    assert.equal(e1.mastery, 'mastered');
    assert.equal(e1.interval, 25);

    const e2 = entries.find((e) => e.item.id === 'fr-1-2')!;
    assert.equal(e2.mastery, 'learning');

    const e3 = entries.find((e) => e.item.id === 'fr-1-3')!;
    assert.equal(e3.mastery, 'stumble');
    assert.equal(e3.lapses, 2);

    const e4 = entries.find((e) => e.item.id === 'fr-1-4')!;
    assert.equal(e4.mastery, 'new');
  });

  it('searches lexicon across target language, English translation, and phonetics with accent leniency', () => {
    const p = emptyProgress();
    const entries = getLexiconEntries(fr, p);

    // Search by French target with missing accent
    const r1 = filterLexicon(entries, 'plait');
    assert.ok(r1.some((e) => e.item.target.includes('plaît')));

    // Search by English meaning
    const r2 = filterLexicon(entries, 'coffee');
    assert.ok(r2.some((e) => e.item.en.toLowerCase().includes('coffee')));

    // Search by phonetic approximation
    const r3 = filterLexicon(entries, 'zhoor');
    assert.ok(r3.some((e) => e.item.target === 'Bonjour'));
  });

  it('filters lexicon entries by specific mastery status', () => {
    const p: Progress = {
      ...emptyProgress(),
      cards: {
        'fr-1-1': { due: Date.now() + 1000000, interval: 30, ease: 2.8, reps: 6, lapses: 0 },
        'fr-1-2': { due: Date.now() - 100, interval: 0, ease: 1.5, reps: 0, lapses: 3 },
      },
    };
    const entries = getLexiconEntries(fr, p);

    const masteredOnly = filterLexicon(entries, '', 'mastered');
    assert.ok(masteredOnly.length >= 1);
    assert.ok(masteredOnly.every((e) => e.mastery === 'mastered'));

    const stumblesOnly = filterLexicon(entries, '', 'stumble');
    assert.ok(stumblesOnly.length >= 1);
    assert.ok(stumblesOnly.every((e) => e.mastery === 'stumble'));
  });

  it('builds a flashcard flip deck prioritizing stumbles and due cards', () => {
    const p: Progress = {
      ...emptyProgress(),
      cards: {
        'fr-1-3': { due: Date.now() - 1000, interval: 0, ease: 1.5, reps: 0, lapses: 2 },
      },
    };
    const entries = getLexiconEntries(fr, p);
    const deck = buildFlashcardDeck(entries, 8);

    assert.equal(deck.length, 8);
    assert.equal(deck[0].item.id, 'fr-1-3'); // Stumble / due prioritized first
    assert.equal(deck[0].isFlipped, false);
  });
});
