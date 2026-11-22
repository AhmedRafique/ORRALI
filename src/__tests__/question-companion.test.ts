import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveQuestionCompanionTheme,
  LANGUAGE_PRIMARY_COMPANIONS,
} from '../personas/companionIllustrations';

describe('In-Lesson Visual Character Companion Engine (TDD)', () => {
  describe('1. State & Pose Transitions', () => {
    it('resolves celebrating pose with celebratory exclamation on correct answer', () => {
      const frTheme = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'choice',
        state: 'correct',
      });

      assert.equal(frTheme.pose, 'celebrating');
      assert.ok(frTheme.dialogueExclamation.includes('Magnifique'));
      assert.equal(frTheme.palette.border, '#638B70'); // Emerald celebrate border

      const deTheme = resolveQuestionCompanionTheme({
        courseCode: 'de',
        exerciseKind: 'choice',
        state: 'correct',
      });
      assert.equal(deTheme.pose, 'celebrating');
      assert.ok(deTheme.dialogueExclamation.includes('Ausgezeichnet'));

      const esTheme = resolveQuestionCompanionTheme({
        courseCode: 'es',
        exerciseKind: 'choice',
        state: 'correct',
      });
      assert.equal(esTheme.pose, 'celebrating');
      assert.ok(esTheme.dialogueExclamation.includes('Perfecto'));
    });

    it('resolves encouraging pose with supportive feedback on incorrect answer', () => {
      const frTheme = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'type',
        state: 'incorrect',
      });

      assert.equal(frTheme.pose, 'encouraging');
      assert.ok(frTheme.dialogueExclamation.includes('Presque'));
      assert.equal(frTheme.palette.border, '#B75D61'); // Supportive rose border

      const esTheme = resolveQuestionCompanionTheme({
        courseCode: 'es',
        exerciseKind: 'type',
        state: 'incorrect',
      });
      assert.equal(esTheme.pose, 'encouraging');
      assert.ok(esTheme.dialogueExclamation.includes('Casi lo tienes'));
    });

    it('resolves listening pose for audio dictation and listen exercises', () => {
      const theme = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'listen',
        state: 'waiting',
      });

      assert.equal(theme.pose, 'listening');
      assert.ok(theme.dialogueExclamation.includes('Écoutez'));
    });

    it('resolves speaking pose for microphone and pronunciation drills', () => {
      const theme = resolveQuestionCompanionTheme({
        courseCode: 'de',
        exerciseKind: 'speak',
        state: 'waiting',
      });

      assert.equal(theme.pose, 'speaking');
      assert.ok(theme.dialogueExclamation.includes('Jetzt bist du dran'));
    });

    it('resolves thinking pose for sentence scramble and typing exercises', () => {
      const theme = resolveQuestionCompanionTheme({
        courseCode: 'es',
        exerciseKind: 'scramble',
        state: 'waiting',
      });

      assert.equal(theme.pose, 'thinking');
      assert.ok(theme.dialogueExclamation.includes('Piénsalo'));
    });
  });

  describe('2. Multi-Language Companion Personas & Palettes', () => {
    it('resolves distinct storybook character profiles for French, German, and Spanish', () => {
      const fr = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'choice',
        state: 'waiting',
      });
      assert.equal(fr.characterId, 'pierre');
      assert.equal(fr.name, 'Pierre');
      assert.ok(fr.palette.cardBg.length > 0);

      const de = resolveQuestionCompanionTheme({
        courseCode: 'de',
        exerciseKind: 'choice',
        state: 'waiting',
      });
      assert.equal(de.characterId, 'julia');
      assert.equal(de.name, 'Julia');

      const es = resolveQuestionCompanionTheme({
        courseCode: 'es',
        exerciseKind: 'choice',
        state: 'waiting',
      });
      assert.equal(es.characterId, 'mateo');
      assert.equal(es.name, 'Mateo');
    });

    it('cycles through language companion roster via characterIndex', () => {
      const p1 = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'choice',
        state: 'waiting',
        characterIndex: 0,
      });
      const p2 = resolveQuestionCompanionTheme({
        courseCode: 'fr',
        exerciseKind: 'choice',
        state: 'waiting',
        characterIndex: 1,
      });

      assert.equal(p1.characterId, 'pierre');
      assert.equal(p2.characterId, 'claire');
    });
  });
});
