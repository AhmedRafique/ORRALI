import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { breakdownSentence } from '../anatomy';

describe('Tap-to-Inspect Sentence Anatomy Engine (TDD)', () => {
  it('breaks down French sentences into individual word anatomy tokens', () => {
    const tokens = breakdownSentence("Hier, j'ai visité le musée", 'fr');

    assert.ok(tokens.length >= 4);
    assert.equal(tokens[0].word, 'Hier');
    assert.ok(tokens[0].meaningEn.length > 0);

    const visiteToken = tokens.find((t) => t.word.toLowerCase().includes('visité'));
    assert.ok(visiteToken, 'Missing visité token');
    assert.ok(visiteToken.meaningEn.length > 0);
  });

  it('breaks down German sentences and identifies articles and verbs', () => {
    const tokens = breakdownSentence('Ich habe das Museum besucht', 'de');

    assert.ok(tokens.length >= 4);
    assert.equal(tokens[0].word, 'Ich');

    const museumToken = tokens.find((t) => t.word === 'Museum');
    assert.ok(museumToken);
    assert.ok(museumToken.meaningEn.length > 0);
  });

  it('breaks down Spanish sentences and handles contractions/clitics', () => {
    const tokens = breakdownSentence('Ayer visité el museo del Prado', 'es');

    assert.ok(tokens.length >= 4);
    assert.equal(tokens[0].word, 'Ayer');

    const pradoToken = tokens.find((t) => t.word === 'Prado');
    assert.ok(pradoToken);
  });

  it('handles empty or single-word strings safely without crashing', () => {
    const empty = breakdownSentence('', 'fr');
    assert.equal(empty.length, 0);

    const single = breakdownSentence('Bonjour', 'fr');
    assert.equal(single.length, 1);
    assert.equal(single[0].word, 'Bonjour');
  });

  it('identifies grammatical gender for articles and nouns with chromatic metadata', () => {
    const frTokens = breakdownSentence('le café', 'fr');
    assert.equal(frTokens[0].gender, 'masculine');
    assert.equal(frTokens[1].gender, 'masculine');

    const deTokens = breakdownSentence('das Museum', 'de');
    assert.equal(deTokens[0].gender, 'neuter');
    assert.equal(deTokens[1].gender, 'neuter');

    const esTokens = breakdownSentence('la tortilla', 'es');
    assert.equal(esTokens[0].gender, 'feminine');
    assert.equal(esTokens[1].gender, 'feminine');
  });
});
