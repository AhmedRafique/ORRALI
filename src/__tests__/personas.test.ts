import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHARACTER_ROSTER,
  getPersonaById,
  getPersonasByLanguage,
  DEFAULT_MOOD_COLORS,
} from '../personas/roster';
import {
  derivePersonaReaction,
  getRelationshipTier,
} from '../personas/emotionEngine';
import { PersonaEmotion } from '../types';

describe('Visual Personas & Dynamic Emotion Engine (TDD)', () => {
  const pierre = getPersonaById('pierre')!;
  const julia = getPersonaById('julia')!;
  const mateo = getPersonaById('mateo')!;

  describe('1. Character Roster & European Triad Personas', () => {
    it('provides distinct, rich personas for French, German, and Spanish', () => {
      const frPersonas = getPersonasByLanguage('fr');
      const dePersonas = getPersonasByLanguage('de');
      const esPersonas = getPersonasByLanguage('es');

      assert.ok(frPersonas.length >= 3);
      assert.ok(dePersonas.length >= 3);
      assert.ok(esPersonas.length >= 3);

      for (const p of Object.values(CHARACTER_ROSTER)) {
        assert.ok(p.id.length > 0);
        assert.ok(p.name.length > 0);
        assert.ok(p.avatar.length > 0);
        assert.ok(p.role && p.role.length > 0);
        assert.ok(p.personality && p.personality.length > 0);
        assert.ok(p.avatarConfig);
        assert.ok(p.avatarConfig.primaryColor.startsWith('#'));
        assert.ok(p.avatarConfig.accentColor.startsWith('#'));
      }
    });

    it('verifies all 6 emotion expressions and mood colors are defined for each persona', () => {
      const emotions: PersonaEmotion[] = [
        'neutral',
        'happy',
        'thinking',
        'encouraging',
        'confused',
        'impressed',
      ];

      for (const p of Object.values(CHARACTER_ROSTER)) {
        for (const e of emotions) {
          assert.ok(p.avatarConfig!.expressions[e], `Missing expression ${e} for ${p.id}`);
          assert.ok(p.avatarConfig!.moodColor[e], `Missing mood color ${e} for ${p.id}`);
        }
      }
    });
  });

  describe('2. Performance-Driven Emotion Engine', () => {
    it('returns impressed emotion and golden celebration on high accuracy or winning streak', () => {
      const reactionHigh = derivePersonaReaction({
        persona: pierre,
        isCorrect: true,
        isCommunicative: true,
        score: 0.95,
      });

      assert.equal(reactionHigh.emotion, 'impressed');
      assert.ok(reactionHigh.reactionHeadline.includes('impressed'));
      assert.equal(reactionHigh.moodColor, DEFAULT_MOOD_COLORS.impressed);

      const reactionStreak = derivePersonaReaction({
        persona: julia,
        isCorrect: true,
        isCommunicative: true,
        consecutiveStreak: 3,
      });

      assert.equal(reactionStreak.emotion, 'impressed');
    });

    it('returns happy emotion when answer is both communicative and correct', () => {
      const reaction = derivePersonaReaction({
        persona: mateo,
        isCorrect: true,
        isCommunicative: true,
        score: 0.85,
      });

      assert.equal(reaction.emotion, 'happy');
      assert.ok(reaction.reactionHeadline.includes('smiles'));
      assert.equal(reaction.moodColor, DEFAULT_MOOD_COLORS.happy);
    });

    it('returns encouraging emotion when communicative intent is met despite a grammar error', () => {
      const reaction = derivePersonaReaction({
        persona: pierre,
        isCorrect: false,
        isCommunicative: true,
        errorCategory: 'grammar',
      });

      assert.equal(reaction.emotion, 'encouraging');
      assert.ok(reaction.reactionHeadline.includes('understood your intent'));
      assert.equal(reaction.moodColor, DEFAULT_MOOD_COLORS.encouraging);
    });

    it('returns confused emotion when speech is off-topic or uncommunicative gibberish', () => {
      const reaction = derivePersonaReaction({
        persona: julia,
        isCorrect: false,
        isCommunicative: false,
      });

      assert.equal(reaction.emotion, 'confused');
      assert.ok(reaction.reactionHeadline.includes('tilts their head'));
      assert.equal(reaction.moodColor, DEFAULT_MOOD_COLORS.confused);
    });

    it('returns thinking emotion while assessment is pending or evaluating', () => {
      const reaction = derivePersonaReaction({
        persona: mateo,
        isEvaluating: true,
      });

      assert.equal(reaction.emotion, 'thinking');
      assert.ok(reaction.reactionHeadline.includes('pondering'));
      assert.equal(reaction.moodColor, DEFAULT_MOOD_COLORS.thinking);
    });
  });

  describe('3. Relationship Tier Progression', () => {
    it('correctly maps relationship levels to progressive cultural tiers', () => {
      const t1 = getRelationshipTier(5);
      assert.equal(t1.tier, 1);
      assert.equal(t1.title, 'Acquaintance');

      const t2 = getRelationshipTier(18);
      assert.equal(t2.tier, 2);
      assert.equal(t2.title, 'Friendly Regular');

      const t3 = getRelationshipTier(35);
      assert.equal(t3.tier, 3);
      assert.equal(t3.title, 'Trusted Confidant');

      const t4 = getRelationshipTier(60);
      assert.equal(t4.tier, 4);
      assert.equal(t4.title, 'Lifelong Partner');
      assert.ok(t4.perk.includes('Deep cultural immersion'));
    });
  });
});
