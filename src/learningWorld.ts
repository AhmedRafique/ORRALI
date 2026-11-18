import { LangCode, CharacterPersona, LocationHub, NarrativeState } from './types';

const MOCK_CHARACTERS: Record<string, CharacterPersona> = {
  'pierre': {
    id: 'pierre',
    name: 'Pierre',
    avatar: '👨‍🍳',
    description: 'A friendly barista in Paris.',
    languageId: 'fr',
    relationshipLevel: 0
  },
  'julia': {
    id: 'julia',
    name: 'Julia',
    avatar: '👩‍💼',
    description: 'A helpful guide in Munich.',
    languageId: 'de',
    relationshipLevel: 0
  }
};

const MOCK_LOCATIONS: LocationHub[] = [
  {
    id: 'paris_cafe',
    name: 'Le Café de Paris',
    description: 'A cozy cafe in the heart of Paris.',
    languageId: 'fr',
    unlocked: true,
    characters: ['pierre']
  },
  {
    id: 'munich_station',
    name: 'München Hauptbahnhof',
    description: 'The bustling central station in Munich.',
    languageId: 'de',
    unlocked: false,
    characters: ['julia']
  }
];

export function getLocationsForLanguage(languageId: LangCode): LocationHub[] {
  return MOCK_LOCATIONS.filter(loc => loc.languageId === languageId);
}

export function unlockLocation(location: LocationHub): LocationHub {
  return { ...location, unlocked: true };
}

export function getCharacterPersona(characterId: string): CharacterPersona | undefined {
  return MOCK_CHARACTERS[characterId];
}

export function updateNarrativeState(
  currentState: NarrativeState,
  updates: { newEvent?: string; relationshipChange?: { characterId: string; delta: number } }
): NarrativeState {
  const nextState = { ...currentState };
  nextState.completedEvents = [...currentState.completedEvents];
  nextState.characterRelationships = { ...currentState.characterRelationships };

  if (updates.newEvent && !nextState.completedEvents.includes(updates.newEvent)) {
    nextState.completedEvents.push(updates.newEvent);
  }

  if (updates.relationshipChange) {
    const { characterId, delta } = updates.relationshipChange;
    const currentRel = nextState.characterRelationships[characterId] || 0;
    nextState.characterRelationships[characterId] = currentRel + delta;
  }

  return nextState;
}
