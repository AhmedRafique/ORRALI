import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectPhoneticLiaisons,
  evaluateEarTrainingAnswer,
  generateEarTrainingChallenge,
  SPEECH_RATES,
} from '../audio/acousticEarTrainer';

describe('Fast Native Speech & Street Noise Ear Trainer (TDD)', () => {
  describe('1. Phonetic Liaison & Acoustic Boundary Detection', () => {
    it('detects French liaisons where silent consonant meets initial vowel', () => {
      const liaisons = detectPhoneticLiaisons('Vous avez un rendez-vous important', 'fr');
      assert.ok(liaisons.length >= 2);
      assert.ok(liaisons.some((l) => l.word1.toLowerCase() === 'vous' && l.word2.toLowerCase() === 'avez'));
      assert.ok(liaisons.some((l) => l.word1.toLowerCase() === 'rendez-vous' || l.word2.toLowerCase() === 'important'));
    });

    it('detects German glottal stop boundaries (Knacklaut) before vowel-initial words', () => {
      const breaks = detectPhoneticLiaisons('Ich habe eine wichtige Antwort', 'de');
      assert.ok(breaks.length >= 1);
      assert.ok(breaks.some((b) => b.kind === 'glottal_de'));
    });

    it('detects Spanish sinalefa vowel mergers across word boundaries', () => {
      const mergers = detectPhoneticLiaisons('Ella está esperando de aquí a mañana', 'es');
      assert.ok(mergers.length >= 1);
      assert.ok(mergers.some((m) => m.kind === 'sinalefa_es'));
    });
  });

  describe('2. Speech Rate Scaling & Acoustic Ambiance', () => {
    it('accurately resolves speech rates from 0.75x to 1.5x', () => {
      assert.equal(SPEECH_RATES.learner, 0.75);
      assert.equal(SPEECH_RATES.standard, 1.0);
      assert.equal(SPEECH_RATES.fast_street, 1.25);
      assert.equal(SPEECH_RATES.blazing_native, 1.5);
    });
  });

  describe('3. Ear Training Challenge Generation & Evaluation', () => {
    it('generates challenge masking target word and creating multiple choice options', () => {
      const ch = generateEarTrainingChallenge(
        "C'est un truc de ouf, j'en reviens pas",
        "That's completely crazy, I can't believe it",
        'fr',
        'fast_street',
        'subway_rumble'
      );

      assert.ok(ch.maskedTarget.includes('____'));
      assert.ok(ch.missingWord.length > 0);
      assert.ok(ch.distractors.includes(ch.missingWord));
      assert.equal(ch.playbackRate, 1.25);
      assert.equal(ch.ambientProfile, 'subway_rumble');
    });

    it('evaluates correct answer with speed bonus XP and constructive feedback', () => {
      const ch = generateEarTrainingChallenge(
        'Hast du Bock auf ein kühles Bierchen',
        'Are you up for a cold beer',
        'de',
        'blazing_native',
        'cafe_clatter'
      );

      const res = evaluateEarTrainingAnswer(ch, ch.missingWord);
      assert.equal(res.isCorrect, true);
      assert.equal(res.earnedXp, 30);
      assert.ok(res.feedback.includes('1.5x'));
    });

    it('rejects incorrect ear choices with pedagogical explanation', () => {
      const ch = generateEarTrainingChallenge(
        'Vaya marrón que nos ha caído encima',
        'What a massive headache we got',
        'es'
      );

      const res = evaluateEarTrainingAnswer(ch, 'wrongWord');
      assert.equal(res.isCorrect, false);
      assert.equal(res.earnedXp, 5);
      assert.ok(res.feedback.includes('correct word was'));
    });
  });
});
