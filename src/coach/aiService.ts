import {
  CEFRLevel,
  ConversationMemoryContext,
  LangCode,
  PersonaEmotion,
} from '../types';

export type AiProvider =
  | 'local_heuristic'
  | 'gemini'
  | 'openai'
  | 'custom_endpoint';

export interface AiServiceConfig {
  provider: AiProvider;
  apiKey?: string;
  apiEndpoint?: string;
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}

export interface CoachRequestParams {
  languageId: LangCode;
  cefrLevel: CEFRLevel;
  userMessage: string;
  personaName?: string;
  personaRole?: string;
  conversationHistory?: Array<{ sender: 'user' | 'ai'; text: string }>;
  memory?: ConversationMemoryContext;
  config?: AiServiceConfig;
}

export interface CoachResponse {
  replyText: string;
  suggestedFollowUps: string[];
  detectedEmotion: PersonaEmotion;
  remedialNote?: string;
  providerUsed: AiProvider;
  latencyMs: number;
}

let activeConfig: AiServiceConfig = {
  provider: 'local_heuristic',
  temperature: 0.7,
  timeoutMs: 8000,
};

export function setAiServiceConfig(config: Partial<AiServiceConfig>): void {
  activeConfig = { ...activeConfig, ...config };
}

export function getAiServiceConfig(): AiServiceConfig {
  return { ...activeConfig };
}

/**
 * Builds the strict pedagogical system prompt with CEFR level guardrails.
 */
export function buildPedagogicalSystemPrompt(params: {
  languageId: LangCode;
  cefrLevel: CEFRLevel;
  personaName: string;
  personaRole: string;
  knownMistakes?: string[];
  userPreferences?: Record<string, string>;
}): string {
  const { languageId, cefrLevel, personaName, personaRole, knownMistakes = [] } = params;

  const langNames: Record<LangCode, string> = {
    fr: 'French',
    de: 'German',
    es: 'Spanish',
  };

  const mistakesNote =
    knownMistakes.length > 0
      ? `Learner has struggled with: ${knownMistakes.join(', ')}. Gently model correct forms.`
      : 'Maintain encouraging tone.';

  return [
    `You are ${personaName}, an authentic ${langNames[languageId]} ${personaRole}.`,
    `Speak strictly in natural ${langNames[languageId]} calibrated to CEFR ${cefrLevel}.`,
    `Do not interrupt the conversation for minor mistakes; model correct phrasing naturally in your reply.`,
    mistakesNote,
    `Keep your reply between 1 and 3 sentences so the learner can easily respond.`,
  ].join(' ');
}

/**
 * Generates local deterministic fallback reply when offline or no API key is provided.
 */
export function generateLocalHeuristicReply(
  languageId: LangCode,
  cefrLevel: CEFRLevel,
  userMessage: string
): CoachResponse {
  const norm = userMessage.toLowerCase().trim();

  let replyText = 'Je vous écoute avec attention ! Pouvez-vous préciser votre pensée ?';
  let suggestedFollowUps = ['Oui, bien sûr', 'Je voudrais ajouter ceci'];

  if (languageId === 'fr') {
    if (norm.includes('bonjour') || norm.includes('salut')) {
      replyText = 'Bonjour ! Ravi de vous retrouver. De quoi souhaitez-vous discuter aujourd’hui ?';
      suggestedFollowUps = ['Parlons de mes projets', 'Je voudrais pratiquer le passé composé'];
    } else if (norm.includes('merci')) {
      replyText = 'Je vous en prie ! C’est un plaisir d’échanger avec vous.';
      suggestedFollowUps = ['À bientôt !', 'Encore une question...'];
    } else if (cefrLevel === 'C1') {
      replyText = 'Votre remarque est particulièrement pertinente. Quel contre-argument pourrait-on envisager ?';
      suggestedFollowUps = ['En dépit de cela...', 'À première vue, certes'];
    }
  } else if (languageId === 'de') {
    replyText = 'Ich höre Ihnen aufmerksam zu ! Möchten Sie das näher erläutern ?';
    suggestedFollowUps = ['Ja, gerne', 'Lassen Sie mich überlegen'];
    if (norm.includes('hallo') || norm.includes('guten tag')) {
      replyText = 'Guten Tag ! Schön, Sie zu sehen. Worüber möchten Sie heute sprechen ?';
      suggestedFollowUps = ['Über meine Pläne', 'Ich möchte Grammatik üben'];
    }
  } else if (languageId === 'es') {
    replyText = '¡Te escucho atentamente ! ¿Podrías explicarme un poco más ?';
    suggestedFollowUps = ['Sí, por supuesto', 'Déjame pensar'];
    if (norm.includes('hola') || norm.includes('buenos dias')) {
      replyText = '¡Hola ! Qué alegría saludarte. ¿De qué te gustaría hablar hoy ?';
      suggestedFollowUps = ['Sobre mis viajes', 'Quiero practicar vocabulario'];
    }
  }

  return {
    replyText,
    suggestedFollowUps,
    detectedEmotion: 'happy',
    providerUsed: 'local_heuristic',
    latencyMs: 15,
  };
}

/**
 * High-level coach interaction entrypoint.
 * Automatically routes to cloud generative endpoints if configured, with bulletproof offline fallback.
 */
export async function generateCoachResponse(
  params: CoachRequestParams
): Promise<CoachResponse> {
  const config = params.config ?? activeConfig;
  const startTime = Date.now();

  // Guard: if no API key or local provider, return instant heuristic reply
  if (config.provider === 'local_heuristic' || !config.apiKey) {
    return generateLocalHeuristicReply(
      params.languageId,
      params.cefrLevel,
      params.userMessage
    );
  }

  // Attempt remote LLM invocation
  try {
    const systemPrompt = buildPedagogicalSystemPrompt({
      languageId: params.languageId,
      cefrLevel: params.cefrLevel,
      personaName: params.personaName ?? 'Coach',
      personaRole: params.personaRole ?? 'Conversational Partner',
      knownMistakes: params.memory?.knownMistakes,
      userPreferences: params.memory?.userPreferences,
    });

    const endpoint =
      config.apiEndpoint ??
      (config.provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 8000);

    const bodyPayload =
      config.provider === 'openai'
        ? {
            model: config.model ?? 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: params.userMessage },
            ],
            temperature: config.temperature ?? 0.7,
          }
        : {
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}

User: ${params.userMessage}` }],
              },
            ],
          };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Remote API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    let replyText = '';

    if (config.provider === 'openai') {
      replyText = data.choices?.[0]?.message?.content?.trim() ?? '';
    } else {
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    }

    if (!replyText) {
      throw new Error('Empty response from LLM provider');
    }

    return {
      replyText,
      suggestedFollowUps: ['D’accord !', 'Pouvez-vous m’en dire plus ?'],
      detectedEmotion: 'impressed',
      providerUsed: config.provider,
      latencyMs: Date.now() - startTime,
    };
  } catch (err) {
    console.warn('[ORRALI AICoach] Remote provider call failed, falling back to local heuristic:', err);
    return generateLocalHeuristicReply(
      params.languageId,
      params.cefrLevel,
      params.userMessage
    );
  }
}
