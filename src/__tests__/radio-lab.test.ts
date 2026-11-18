import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRadioLabRound,
  evaluateDictationAnswer,
  generateDictationChallenge,
  getConnectedSpeechInsight,
} from '../radioLab';
import { Course, Item } from '../types';

const mockCourse: Course = {
  code: 'fr',
  name: 'French',
  flag: '🇫🇷',
  speechLang: 'fr-FR',
  lessons: [
    {
      id: 'fr-1',
      title: 'Au Café',
      subtitle: 'Café essentials',
      items: [
        { id: 'fr-1-1', target: 'Un café, s’il vous plaît', en: 'A coffee, please' },
        { id: 'fr-1-2', target: 'Vous avez une table ?', en: 'Do you have a table?' },
        { id: 'fr-1-3', target: 'L’addition, s’il vous plaît', en: 'The check, please' },
        { id: 'fr-1-4', target: 'C’est tout à fait délicieux', en: 'It is absolutely delicious' },
        { id: 'fr-1-5', target: 'Je voudrais payer par carte', en: 'I would like to pay by card' },
        { id: 'fr-1-6', target: 'Merci beaucoup et bonne journée', en: 'Thank you and good day' },
      ],
    },
  ],
};

describe('Radio Lab Audio Dictation & Connected Speech Engine (TDD)', () => {
  describe('1. Dictation Challenge Generator', () => {
    it('generates a cloze dictation challenge with blank indices and word bank', () => {
      const item = mockCourse.lessons[0].items[1]; // "Vous avez une table ?"
      const challenge = generateDictationChallenge(item, mockCourse, 2);

      assert.equal(challenge.item.id, item.id);
      assert.ok(challenge.tokens.length >= 4);
      assert.ok(challenge.blankIndices.length >= 1 && challenge.blankIndices.length <= 2);
      assert.equal(challenge.targetWords.length, challenge.blankIndices.length);

      // Word bank contains target words plus distractors
      for (const targetW of challenge.targetWords) {
        assert.ok(
          challenge.wordBank.some(
            (b) => b.toLowerCase() === targetW.toLowerCase()
          ),
          `Word bank must include target word ${targetW}`
        );
      }
      assert.ok(challenge.wordBank.length > challenge.targetWords.length);
    });
  });

  describe('2. Dictation Answer Evaluation', () => {
    it('accepts accurately assembled words for the blanks', () => {
      const item = mockCourse.lessons[0].items[0];
      const challenge = generateDictationChallenge(item, mockCourse, 2);

      const isOk = evaluateDictationAnswer(challenge, challenge.targetWords);
      assert.equal(isOk, true);
    });

    it('rejects wrong words or incomplete answers', () => {
      const item = mockCourse.lessons[0].items[0];
      const challenge = generateDictationChallenge(item, mockCourse, 2);

      const wrong = evaluateDictationAnswer(challenge, ['fakeWord', 'nonsense']);
      assert.equal(wrong, false);

      const incomplete = evaluateDictationAnswer(challenge, [challenge.targetWords[0]]);
      assert.equal(incomplete, false);
    });
  });

  describe('3. Connected Speech & Acoustic Insights', () => {
    it('detects French liaisons (e.g. vous avez -> /z/)', () => {
      const tip = getConnectedSpeechInsight('Vous avez une table ?', 'fr');
      assert.ok(tip.toLowerCase().includes('liaison') || tip.toLowerCase().includes('connect'));
    });

    it('detects German contractions (e.g. am, im, zum)', () => {
      const tip = getConnectedSpeechInsight('Ich bin am Bahnhof', 'de');
      assert.ok(tip.toLowerCase().includes('contract') || tip.toLowerCase().includes('am'));
    });

    it('detects Spanish sinalefa vowel blending', () => {
      const tip = getConnectedSpeechInsight('De acuerdo, muchas gracias', 'es');
      assert.ok(tip.toLowerCase().includes('sinalefa') || tip.toLowerCase().includes('vowel'));
    });
  });

  describe('4. Broadcast Round Builder', () => {
    it('builds a 5-challenge broadcast round across course items', () => {
      const round = buildRadioLabRound(mockCourse, 5);
      assert.equal(round.length, 5);
      assert.notEqual(round[0].item.id, round[1].item.id);
    });
  });
});
