import { ExerciseKind, LangCode } from '../types';

export type CompanionPose =
  | 'presenting'
  | 'listening'
  | 'speaking'
  | 'thinking'
  | 'celebrating'
  | 'encouraging';

export interface CompanionVisualTheme {
  characterId: string;
  name: string;
  role: string;
  avatarGlyph: string;
  accessoryEmoji: string;
  pose: CompanionPose;
  dialogueExclamation: string;
  dialogueSub: string;
  palette: {
    cardBg: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
    bubbleBg: string;
    textColor: string;
  };
}

export const LANGUAGE_PRIMARY_COMPANIONS: Record<LangCode, string[]> = {
  fr: ['pierre', 'claire', 'antoine'],
  de: ['julia', 'hans', 'frau_schmidt'],
  es: ['mateo', 'lucia', 'carlos'],
};

/**
 * Resolves the visual character illustration theme, emotional pose, and color palette
 * based on the active language, exercise modality, and evaluation state.
 */
export function resolveQuestionCompanionTheme(params: {
  courseCode: LangCode;
  exerciseKind: ExerciseKind;
  state: 'waiting' | 'evaluating' | 'correct' | 'incorrect';
  characterIndex?: number;
}): CompanionVisualTheme {
  const { courseCode, exerciseKind, state, characterIndex = 0 } = params;
  const companionList = LANGUAGE_PRIMARY_COMPANIONS[courseCode] ?? ['pierre'];
  const characterId = companionList[characterIndex % companionList.length];

  // Resolve pose
  let pose: CompanionPose = 'presenting';
  if (state === 'correct') {
    pose = 'celebrating';
  } else if (state === 'incorrect') {
    pose = 'encouraging';
  } else if (state === 'evaluating') {
    pose = 'thinking';
  } else if (exerciseKind === 'listen') {
    pose = 'listening';
  } else if (exerciseKind === 'speak') {
    pose = 'speaking';
  } else if (exerciseKind === 'type' || exerciseKind === 'scramble') {
    pose = 'thinking';
  }

  // Base profile by character
  if (courseCode === 'fr') {
    if (characterId === 'claire') {
      return buildTheme({
        characterId: 'claire',
        name: 'Claire',
        role: 'Station Conductor',
        avatarGlyph: '👩‍✈️',
        accessoryEmoji: '⏱️',
        pose,
        courseCode,
        paletteBase: {
          bg: '#F0F7FF',
          border: '#3A5A98',
          badge: '#2B4270',
        },
      });
    }
    // Pierre (Default French)
    return buildTheme({
      characterId: 'pierre',
      name: 'Pierre',
      role: 'Parisian Host',
      avatarGlyph: '👨‍🍳',
      accessoryEmoji: '🥐',
      pose,
      courseCode,
      paletteBase: {
        bg: '#FFF8F0',
        border: '#D4AF7C',
        badge: '#8A692E',
      },
    });
  }

  if (courseCode === 'de') {
    if (characterId === 'hans') {
      return buildTheme({
        characterId: 'hans',
        name: 'Hans',
        role: 'ICE Conductor',
        avatarGlyph: '👨‍✈️',
        accessoryEmoji: '🎫',
        pose,
        courseCode,
        paletteBase: {
          bg: '#FFF5F5',
          border: '#B75D61',
          badge: '#8E282D',
        },
      });
    }
    // Julia (Default German)
    return buildTheme({
      characterId: 'julia',
      name: 'Julia',
      role: 'Bavarian Guide',
      avatarGlyph: '👩‍💼',
      accessoryEmoji: '🥨',
      pose,
      courseCode,
      paletteBase: {
        bg: '#F3FAF5',
        border: '#638B70',
        badge: '#3B6449',
      },
    });
  }

  // Spanish (Mateo default)
  return buildTheme({
    characterId: 'mateo',
    name: 'Mateo',
    role: 'Market Merchant',
    avatarGlyph: '👨‍🌾',
    accessoryEmoji: '☕',
    pose,
    courseCode,
    paletteBase: {
      bg: '#FFF8E7',
      border: '#E5A548',
      badge: '#9C6314',
    },
  });
}

function buildTheme(params: {
  characterId: string;
  name: string;
  role: string;
  avatarGlyph: string;
  accessoryEmoji: string;
  pose: CompanionPose;
  courseCode: LangCode;
  paletteBase: { bg: string; border: string; badge: string };
}): CompanionVisualTheme {
  const { characterId, name, role, avatarGlyph, accessoryEmoji, pose, courseCode, paletteBase } = params;

  let exclamation = 'Ready when you are !';
  let sub = 'Tap the right option or listen carefully';
  let border = paletteBase.border;
  let glow = 'rgba(212, 175, 124, 0.2)';

  if (pose === 'celebrating') {
    border = '#638B70';
    glow = 'rgba(99, 139, 112, 0.4)';
    if (courseCode === 'fr') {
      exclamation = 'Magnifique !';
      sub = `${name} applauds your perfect answer!`;
    } else if (courseCode === 'de') {
      exclamation = 'Ausgezeichnet !';
      sub = `${name} beams with pride at your accuracy!`;
    } else {
      exclamation = '¡Perfecto, qué bien !';
      sub = `${name} celebrates with a big smile!`;
    }
  } else if (pose === 'encouraging') {
    border = '#B75D61';
    glow = 'rgba(183, 93, 97, 0.3)';
    if (courseCode === 'fr') {
      exclamation = 'Presque ! Courage !';
      sub = `${name} gives you a supportive thumbs-up.`;
    } else if (courseCode === 'de') {
      exclamation = 'Fast geschafft !';
      sub = `${name} offers gentle encouragement.`;
    } else {
      exclamation = '¡Casi lo tienes !';
      sub = `${name} encourages you to try once more.`;
    }
  } else if (pose === 'listening') {
    if (courseCode === 'fr') {
      exclamation = 'Écoutez bien...';
      sub = `${name} tunes in to the native pronunciation.`;
    } else if (courseCode === 'de') {
      exclamation = 'Genau hinhören...';
      sub = `${name} listens intently to every syllable.`;
    } else {
      exclamation = 'Escucha con atención...';
      sub = `${name} catches the melodic rhythm.`;
    }
  } else if (pose === 'speaking') {
    if (courseCode === 'fr') {
      exclamation = 'À vous de parler !';
      sub = `${name} leans in to hear your spoken French.`;
    } else if (courseCode === 'de') {
      exclamation = 'Jetzt bist du dran !';
      sub = `${name} invites you to speak clearly into the mic.`;
    } else {
      exclamation = '¡Te toca hablar !';
      sub = `${name} is excited to hear your Spanish.`;
    }
  } else if (pose === 'thinking') {
    if (courseCode === 'fr') {
      exclamation = 'Prenez votre temps...';
      sub = `${name} taps chin thoughtfully.`;
    } else if (courseCode === 'de') {
      exclamation = 'Überleg es dir in Ruhe...';
      sub = `${name} waits with focused curiosity.`;
    } else {
      exclamation = 'Piénsalo bien...';
      sub = `${name} ponders alongside you.`;
    }
  }

  return {
    characterId,
    name,
    role,
    avatarGlyph: pose === 'celebrating' ? '🎉' : pose === 'encouraging' ? '🤝' : avatarGlyph,
    accessoryEmoji,
    pose,
    dialogueExclamation: exclamation,
    dialogueSub: sub,
    palette: {
      cardBg: paletteBase.bg,
      border,
      glow,
      badgeBg: paletteBase.border,
      badgeText: '#FFFFFF',
      bubbleBg: '#FFFFFF',
      textColor: '#211B32',
    },
  };
}
