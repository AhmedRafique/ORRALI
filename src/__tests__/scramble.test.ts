import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { courses } from '../content';
import { tokenizePhrase, buildScrambleExercise, evaluateScramble } from '../exercises';

describe('Interactive Sentence Scramble (Word Tiles) Engine (TDD)', () => {
  const fr = courses.find((c) => c.code === 'fr')!;
  const testItem = fr.lessons[0].items.find((i) => i.target.includes('plaît'))!; // S'il vous plaît

  it('correctly tokenizes target phrases into clean word tiles', () => {
    const tokens = tokenizePhrase("Hier, j'ai visité le musée");
    assert.deepEqual(tokens, ['Hier', "j'ai", 'visité', 'le', 'musée']);
  });

  it('builds a scramble exercise with shuffled tokens matching original word count', () => {
    const ex = buildScrambleExercise(testItem);

    assert.equal(ex.kind, 'scramble');
    assert.ok(ex.tokens && ex.tokens.length >= 3);
    // Tokens contain all words from the target phrase
    for (const token of tokenizePhrase(testItem.target)) {
      assert.ok(ex.tokens.includes(token));
    }
  });

  it('validates correctly ordered word tiles as true', () => {
    const tokens = tokenizePhrase("S'il vous plaît");
    const ok = evaluateScramble(tokens, testItem);
    assert.equal(ok, true);
  });

  it('rejects incorrectly ordered word tiles as false', () => {
    const scrambled = ["plaît", "vous", "S'il"];
    const ok = evaluateScramble(scrambled, testItem);
    assert.equal(ok, false);
  });
});
