import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCafeComprehension,
  getCafeStoriesByLanguage,
  tokenizeStoryParagraph,
  CAFE_STORIES,
} from '../cafeLibrary';

describe('Café Library Reading Lounge Engine (TDD)', () => {
  describe('1. Cultural Story Catalog', () => {
    it('provides multi-paragraph cultural stories for French, German, and Spanish', () => {
      for (const lang of ['fr', 'de', 'es'] as const) {
        const stories = getCafeStoriesByLanguage(lang);
        assert.ok(stories.length >= 1, `Expected at least 1 reading story for ${lang}`);
        for (const story of stories) {
          assert.ok(story.title.length > 0);
          assert.ok(story.paragraphs.length >= 2, 'Story must have at least 2 paragraphs');
          assert.ok(story.questions.length >= 2, 'Story must have at least 2 quiz questions');
        }
      }
    });
  });

  describe('2. Paragraph Word Tokenization', () => {
    it('tokenizes paragraph sentences into interactive words with clean tokens', () => {
      const paragraph = 'Le soleil brille sur les toits de Paris. Les cafés ouvrent leurs portes.';
      const tokens = tokenizeStoryParagraph(paragraph, 'fr');

      assert.ok(tokens.length >= 10);
      assert.equal(tokens[0].cleanWord.toLowerCase(), 'le');
      assert.equal(tokens[0].gender, 'masculine');
      assert.ok(tokens.some((t) => t.cleanWord.toLowerCase() === 'paris'));
    });
  });

  describe('3. Comprehension Quiz Evaluation', () => {
    it('accepts correct answers and returns passing verdict with +20 XP', () => {
      const story = CAFE_STORIES[0];
      const correctIndices = story.questions.map((q) => q.correctIndex);

      const result = evaluateCafeComprehension(story, correctIndices);
      assert.equal(result.isPassed, true);
      assert.equal(result.earnedXp, 20);
    });

    it('rejects incorrect answers without awarding XP', () => {
      const story = CAFE_STORIES[0];
      const wrongIndices = story.questions.map((q) => (q.correctIndex + 1) % q.options.length);

      const result = evaluateCafeComprehension(story, wrongIndices);
      assert.equal(result.isPassed, false);
      assert.equal(result.earnedXp, 0);
    });
  });
});
