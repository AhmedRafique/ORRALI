import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PERSONA_VOICE_PROFILES,
  resolveEmotionalSpeechParams,
  playEmotionalSpeech,
  stopEmotionalSpeech,
} from '../audio/emotionalTts';

describe('Generative Emotional TTS & Dynamic Voice Synthesis (TDD)', () => {
  describe('1. European Triad Persona Voice Profiles', () => {
    it('defines distinct vocal acoustic profiles across French, German, and Spanish', () => {
      const keys = Object.keys(PERSONA_VOICE_PROFILES);
      assert.ok(keys.includes('pierre'));
      assert.ok(keys.includes('claire'));
      assert.ok(keys.includes('julia'));
      assert.ok(keys.includes('hans'));
      assert.ok(keys.includes('mateo'));
      assert.ok(keys.includes('lucia'));

      for (const p of Object.values(PERSONA_VOICE_PROFILES)) {
        assert.ok(p.characterId.length > 0);
        assert.ok(['fr-FR', 'de-DE', 'es-ES'].includes(p.baseSpeechLang));
        assert.ok(p.baseRate >= 0.8 && p.baseRate <= 1.2);
        assert.ok(p.basePitch >= 0.8 && p.basePitch <= 1.2);
        assert.ok(p.timbreDescription.length > 0);
      }
    });
  });

  describe('2. Dynamic Emotional Prosody Shaping', () => {
    it('elevates pitch and cadence during surprised curveballs', () => {
      const neutral = resolveEmotionalSpeechParams({
        characterId: 'pierre',
        inflection: 'neutral',
      });
      const surprised = resolveEmotionalSpeechParams({
        characterId: 'pierre',
        inflection: 'surprised_curveball',
      });

      assert.ok(surprised.pitch > neutral.pitch);
      assert.ok(surprised.rate > neutral.rate);
      assert.equal(surprised.inflection, 'surprised_curveball');
    });

    it('slows down cadence for pedagogical clarity during encouraging corrections', () => {
      const neutral = resolveEmotionalSpeechParams({
        characterId: 'julia',
        inflection: 'neutral',
      });
      const encouraging = resolveEmotionalSpeechParams({
        characterId: 'julia',
        inflection: 'encouraging_correction',
      });

      assert.ok(encouraging.rate < neutral.rate);
      assert.equal(encouraging.inflection, 'encouraging_correction');
    });

    it('deepens pitch and steadies cadence for authoritative conductor statements', () => {
      const neutral = resolveEmotionalSpeechParams({
        characterId: 'hans',
        inflection: 'neutral',
      });
      const authoritative = resolveEmotionalSpeechParams({
        characterId: 'hans',
        inflection: 'authoritative',
      });

      assert.ok(authoritative.pitch < neutral.pitch);
      assert.ok(authoritative.rate <= neutral.rate);
    });

    it('provides cheerful pitch boost for celebratory milestones', () => {
      const neutral = resolveEmotionalSpeechParams({
        characterId: 'mateo',
        inflection: 'neutral',
      });
      const celebratory = resolveEmotionalSpeechParams({
        characterId: 'mateo',
        inflection: 'celebratory',
      });

      assert.ok(celebratory.pitch >= neutral.pitch * 1.15);
    });

    it('gracefully provides language-specific defaults for unknown characters', () => {
      const defDe = resolveEmotionalSpeechParams({
        characterId: 'unknown_npc',
        languageId: 'de',
      });
      assert.equal(defDe.language, 'de-DE');

      const defEs = resolveEmotionalSpeechParams({
        characterId: 'unknown_npc',
        languageId: 'es',
      });
      assert.equal(defEs.language, 'es-ES');
    });
  });

  describe('3. Playback & Lifecycle Abstraction', () => {
    it('resolves parameters and executes playEmotionalSpeech safely without throwing', async () => {
      let doneCalled = false;
      const params = await playEmotionalSpeech('Bonjour !', {
        characterId: 'pierre',
        inflection: 'warm_greeting',
        onDone: () => {
          doneCalled = true;
        },
      });

      assert.equal(params.language, 'fr-FR');
      assert.equal(params.inflection, 'warm_greeting');
    });

    it('stops active speech without throwing errors', () => {
      assert.doesNotThrow(() => {
        stopEmotionalSpeech();
      });
    });
  });
});
