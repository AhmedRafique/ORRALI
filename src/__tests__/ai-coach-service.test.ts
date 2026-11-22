import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPedagogicalSystemPrompt,
  generateLocalHeuristicReply,
  generateCoachResponse,
  setAiServiceConfig,
  getAiServiceConfig,
} from '../coach/aiService';

describe('Live Generative AI Coach Service & Guardrails (TDD)', () => {
  describe('1. Pedagogical System Prompt Builder', () => {
    it('constructs prompt enforcing language immersion and calibrated CEFR level', () => {
      const prompt = buildPedagogicalSystemPrompt({
        languageId: 'fr',
        cefrLevel: 'B2',
        personaName: 'Pierre',
        personaRole: 'Bistro Host',
        knownMistakes: ['passé composé auxiliary'],
      });

      assert.ok(prompt.includes('Pierre'));
      assert.ok(prompt.includes('French'));
      assert.ok(prompt.includes('B2'));
      assert.ok(prompt.includes('passé composé auxiliary'));
      assert.ok(prompt.includes('Do not interrupt the conversation for minor mistakes'));
    });
  });

  describe('2. Local Heuristic Conversational Fallback', () => {
    it('returns natural, immediate replies in French, German, and Spanish without internet', () => {
      const frRes = generateLocalHeuristicReply('fr', 'A1', 'Bonjour Pierre !');
      assert.equal(frRes.providerUsed, 'local_heuristic');
      assert.ok(frRes.replyText.includes('Bonjour'));
      assert.ok(frRes.suggestedFollowUps.length >= 2);

      const deRes = generateLocalHeuristicReply('de', 'B1', 'Guten Tag !');
      assert.ok(deRes.replyText.includes('Guten Tag'));

      const esRes = generateLocalHeuristicReply('es', 'B2', '¡Hola Mateo!');
      assert.ok(esRes.replyText.includes('Hola'));
    });
  });

  describe('3. Dynamic Provider Routing & Resilient Fallback', () => {
    it('falls back to local heuristic when remote provider is missing credentials', async () => {
      setAiServiceConfig({ provider: 'gemini', apiKey: undefined });

      const res = await generateCoachResponse({
        languageId: 'fr',
        cefrLevel: 'A2',
        userMessage: 'Merci beaucoup !',
      });

      assert.equal(res.providerUsed, 'local_heuristic');
      assert.ok(res.replyText.includes('Je vous en prie'));
    });

    it('manages and reads active provider configuration predictably', () => {
      setAiServiceConfig({ provider: 'local_heuristic', temperature: 0.5 });
      const conf = getAiServiceConfig();
      assert.equal(conf.provider, 'local_heuristic');
      assert.equal(conf.temperature, 0.5);
    });
  });
});
