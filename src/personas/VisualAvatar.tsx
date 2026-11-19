import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CharacterPersona, PersonaEmotion } from '../types';
import { derivePersonaReaction, getRelationshipTier } from './emotionEngine';

interface Props {
  persona: CharacterPersona;
  emotion?: PersonaEmotion;
  size?: 'small' | 'medium' | 'large';
  showReactionPill?: boolean;
  relationshipLevel?: number;
}

export default function VisualAvatar({
  persona,
  emotion = 'neutral',
  size = 'medium',
  showReactionPill = true,
  relationshipLevel = 0,
}: Props) {
  const reaction = derivePersonaReaction({ persona });
  const tier = getRelationshipTier(relationshipLevel);

  const moodColor =
    persona.avatarConfig?.moodColor[emotion] ?? reaction.moodColor;
  const expression =
    persona.avatarConfig?.expressions[emotion] ?? persona.avatar;

  const sizeStyles = {
    small: { container: 42, avatarText: 22, badge: 14, badgeText: 10 },
    medium: { container: 62, avatarText: 32, badge: 20, badgeText: 12 },
    large: { container: 88, avatarText: 46, badge: 26, badgeText: 16 },
  }[size];

  return (
    <View style={s.root}>
      {/* Outer Portrait Ring with Dynamic Mood Glow */}
      <View
        style={[
          s.portraitRing,
          {
            width: sizeStyles.container,
            height: sizeStyles.container,
            borderColor: moodColor,
            backgroundColor: persona.avatarConfig?.primaryColor ?? '#2A1F45',
          },
        ]}
      >
        <Text style={{ fontSize: sizeStyles.avatarText }}>{persona.avatar}</Text>

        {/* Emotion Mood Badge Overlay */}
        <View
          style={[
            s.moodBadge,
            {
              width: sizeStyles.badge,
              height: sizeStyles.badge,
              borderColor: moodColor,
            },
          ]}
        >
          <Text style={{ fontSize: sizeStyles.badgeText }}>{expression}</Text>
        </View>
      </View>

      {/* Optional Reaction Headline Pill */}
      {showReactionPill && (
        <View style={s.pillColumn}>
          <View style={s.nameRow}>
            <Text style={s.personaName}>{persona.name}</Text>
            {persona.role && <Text style={s.personaRole}>· {persona.role}</Text>}
          </View>
          <View style={[s.reactionPill, { borderColor: moodColor }]}>
            <Text style={[s.reactionText, { color: moodColor }]}>
              {reaction.reactionHeadline}
            </Text>
          </View>
          {relationshipLevel > 0 && (
            <Text style={s.tierText}>
              {tier.badge} {tier.title} (Lvl {relationshipLevel})
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  portraitRing: {
    borderRadius: 999,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  moodBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1B1536',
    borderRadius: 999,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  personaName: {
    color: '#F8F6F1',
    fontSize: 14,
    fontWeight: '800',
  },
  personaRole: {
    color: '#827B8D',
    fontSize: 11,
  },
  reactionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  reactionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierText: {
    color: '#D4AF7C',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
});
