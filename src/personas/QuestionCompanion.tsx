import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ExerciseKind, LangCode } from '../types';
import { resolveQuestionCompanionTheme } from './companionIllustrations';
import { triggerHaptic } from '../sensory';

interface Props {
  courseCode: LangCode;
  exerciseKind: ExerciseKind;
  state: 'waiting' | 'evaluating' | 'correct' | 'incorrect';
  characterIndex?: number;
  onPress?: () => void;
}

export default function QuestionCompanion({
  courseCode,
  exerciseKind,
  state,
  characterIndex = 0,
  onPress,
}: Props) {
  const theme = resolveQuestionCompanionTheme({
    courseCode,
    exerciseKind,
    state,
    characterIndex,
  });

  const handlePress = () => {
    void triggerHaptic('light');
    onPress?.();
  };

  return (
    <Pressable
      style={[
        s.container,
        {
          backgroundColor: theme.palette.cardBg,
          borderColor: theme.palette.border,
          shadowColor: theme.palette.border,
        },
      ]}
      onPress={handlePress}
    >
      {/* 1. Character Avatar with Floating Accessory */}
      <View
        style={[
          s.avatarFrame,
          {
            borderColor: theme.palette.border,
          },
        ]}
      >
        <Text style={s.avatarGlyph}>{theme.avatarGlyph}</Text>
        <View style={[s.accessoryBadge, { borderColor: theme.palette.border }]}>
          <Text style={s.accessoryText}>{theme.accessoryEmoji}</Text>
        </View>
      </View>

      {/* 2. Character Speech Bubble & Pedagogical Encouragement */}
      <View style={s.speechContent}>
        <View style={s.namePillRow}>
          <View style={[s.namePill, { backgroundColor: theme.palette.badgeBg }]}>
            <Text style={s.namePillText}>
              {theme.name} · {theme.role}
            </Text>
          </View>
          {state === 'correct' && (
            <View style={s.celebrateBadge}>
              <Text style={s.celebrateText}>+XP SPARK ✨</Text>
            </View>
          )}
        </View>

        <Text style={[s.exclamationText, { color: theme.palette.textColor }]}>
          "{theme.dialogueExclamation}"
        </Text>
        <Text style={s.subText}>{theme.dialogueSub}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  avatarFrame: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarGlyph: {
    fontSize: 30,
  },
  accessoryBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryText: {
    fontSize: 11,
  },
  speechContent: {
    flex: 1,
    justifyContent: 'center',
  },
  namePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  namePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  namePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  celebrateBadge: {
    backgroundColor: '#638B70',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  celebrateText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  exclamationText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  subText: {
    color: '#827B8D',
    fontSize: 11,
    marginTop: 1,
  },
});
