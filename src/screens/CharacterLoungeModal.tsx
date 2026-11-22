import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { playEmotionalSpeech } from '../audio/emotionalTts';
import { playEarcon } from '../earcons';
import { getRelationshipTier } from '../personas/emotionEngine';
import {
  CHARACTER_BACKSTORIES,
  getCharacterBackstory,
  getCharacterGreeting,
  getUnlockedAnecdotes,
} from '../personas/backstories';
import { getPersonasByLanguage } from '../personas/roster';
import VisualAvatar from '../personas/VisualAvatar';
import { triggerHaptic } from '../sensory';
import { CharacterPersona, LangCode, Progress } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  green: '#638B70',
  amber: '#E5A548',
  cardBg: '#2A1F45',
  cardBgAlt: '#1F1735',
};

interface Props {
  visible: boolean;
  currentLang: LangCode;
  progress: Progress;
  onClose: () => void;
}

export default function CharacterLoungeModal({
  visible,
  currentLang,
  progress,
  onClose,
}: Props) {
  const [selectedLang, setSelectedLang] = useState<LangCode>(currentLang);
  const [selectedCharId, setSelectedCharId] = useState<string>('pierre');

  const personas = useMemo(
    () => getPersonasByLanguage(selectedLang),
    [selectedLang]
  );

  // Default selection when switching language
  const activePersona: CharacterPersona =
    personas.find((p) => p.id === selectedCharId) ?? personas[0] ?? personas[0];

  const characterLevel =
    (progress as unknown as { characterRelationships?: Record<string, number> })
      .characterRelationships?.[activePersona?.id ?? ''] ?? 12; // default friendly regular for demonstration

  const tier = getRelationshipTier(characterLevel);
  const backstory = getCharacterBackstory(activePersona?.id ?? '');
  const greeting = getCharacterGreeting(activePersona?.id ?? '', characterLevel);
  const unlockedAnecdotes = getUnlockedAnecdotes(
    activePersona?.id ?? '',
    characterLevel
  );

  const handlePlayGreeting = () => {
    triggerHaptic('light');
    void playEarcon('success');
    void playEmotionalSpeech(greeting.target, {
      characterId: activePersona.id,
      languageId: selectedLang,
      inflection: 'warm_greeting',
    });
  };

  if (!activePersona || !backstory) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>✦ EUROPEAN TRIAD · FRIENDSHIP LOUNGE</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Character Friendship Hub</Text>
          <Text style={s.subtitle}>
            Build rapport through lessons and missions to unlock intimate cultural anecdotes.
          </Text>

          {/* Language Tabs */}
          <View style={s.langTabsRow}>
            {(['fr', 'de', 'es'] as const).map((code) => {
              const isActive = selectedLang === code;
              const label = code === 'fr' ? '🇫🇷 Paris' : code === 'de' ? '🇩🇪 Berlin' : '🇪🇸 Madrid';
              return (
                <Pressable
                  key={code}
                  style={[s.langTab, isActive && s.langTabActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedLang(code);
                    const langPersonas = getPersonasByLanguage(code);
                    if (langPersonas[0]) setSelectedCharId(langPersonas[0].id);
                  }}
                >
                  <Text style={[s.langTabText, isActive && s.langTabTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Character Roster Strip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.rosterScroll}
            contentContainerStyle={s.rosterContent}
          >
            {personas.map((p) => {
              const isSelected = p.id === activePersona.id;
              return (
                <Pressable
                  key={p.id}
                  style={[s.charTabPill, isSelected && s.charTabPillActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedCharId(p.id);
                  }}
                >
                  <Text style={s.charTabEmoji}>{p.avatar}</Text>
                  <Text
                    style={[s.charTabText, isSelected && s.charTabTextActive]}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Active Persona Deep Dive */}
          <ScrollView style={s.detailsScroll} showsVerticalScrollIndicator={false}>
            <View style={s.profileCard}>
              <View style={s.avatarHeaderRow}>
                <VisualAvatar
                  persona={activePersona}
                  emotion="happy"
                  size="large"
                  relationshipLevel={characterLevel}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={s.profileName}>{activePersona.name}</Text>
                  <Text style={s.profileRole}>{activePersona.role}</Text>
                  <Text style={s.originText}>📍 {backstory.originCity}</Text>

                  <View style={s.tierPill}>
                    <Text style={s.tierPillText}>
                      {tier.badge} {tier.title} · Lv. {characterLevel}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Greeting Bubble */}
              <View style={s.greetingBubble}>
                <View style={s.greetingHeader}>
                  <Text style={s.greetingLabel}>CURRENT GREETING</Text>
                  <Pressable style={s.voiceBtn} onPress={handlePlayGreeting}>
                    <Text style={s.voiceBtnText}>🔊 Hear Voice</Text>
                  </Pressable>
                </View>
                <Text style={s.greetingTarget}>"{greeting.target}"</Text>
                <Text style={s.greetingEn}>{greeting.en}</Text>
              </View>

              {/* Secret Street Tip */}
              <View style={s.tipCard}>
                <Text style={s.tipHeading}>💡 Cultural Insider Tip</Text>
                <Text style={s.tipBody}>{backstory.secretTip}</Text>
              </View>

              {/* Favorite Spot */}
              <View style={s.spotCard}>
                <Text style={s.spotHeading}>☕ Favorite City Spot</Text>
                <Text style={s.spotBody}>{backstory.favoriteSpot}</Text>
              </View>

              {/* Unlocked Anecdotes */}
              <Text style={s.anecdoteSectionHeading}>
                📖 Unlocked Cultural Backstories ({unlockedAnecdotes.length} of 4)
              </Text>
              {backstory.anecdotes.map((anecdote, i) => {
                const isUnlocked = unlockedAnecdotes.some(
                  (a) => a.title === anecdote.title
                );
                return (
                  <View
                    key={i}
                    style={[
                      s.anecdoteCard,
                      !isUnlocked && s.anecdoteCardLocked,
                    ]}
                  >
                    <View style={s.anecdoteHeader}>
                      <Text style={s.anecdoteBadge}>
                        {isUnlocked ? '✓ UNLOCKED' : '🔒 TIER LOCKED'}
                      </Text>
                      <Text style={s.anecdoteTierRequired}>
                        Requires {anecdote.tierRequired.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={s.anecdoteTitle}>{anecdote.title}</Text>
                    <Text
                      style={[
                        s.anecdoteStory,
                        !isUnlocked && s.anecdoteStoryLocked,
                      ]}
                    >
                      {isUnlocked
                        ? anecdote.story
                        : 'Continue practicing conversations to deepen your trust and unlock this story.'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.midnight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.gold,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: C.purple,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: C.muted,
    fontSize: 18,
  },
  title: {
    color: C.ivory,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 16,
  },
  langTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#130E26',
    borderRadius: 10,
    padding: 4,
    marginBottom: 10,
    gap: 6,
  },
  langTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  langTabActive: {
    backgroundColor: C.purple,
  },
  langTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  langTabTextActive: {
    color: C.gold,
  },
  rosterScroll: {
    flexGrow: 0,
    marginBottom: 14,
  },
  rosterContent: {
    gap: 8,
  },
  charTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  charTabPillActive: {
    borderColor: C.gold,
    backgroundColor: '#3F2C68',
  },
  charTabEmoji: {
    fontSize: 16,
  },
  charTabText: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '700',
  },
  charTabTextActive: {
    color: C.gold,
  },
  detailsScroll: {
    flexGrow: 0,
  },
  profileCard: {
    paddingBottom: 20,
  },
  avatarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBgAlt,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  profileName: {
    color: C.ivory,
    fontSize: 20,
    fontWeight: '800',
  },
  profileRole: {
    color: C.gold,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  originText: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  tierPill: {
    alignSelf: 'flex-start',
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierPillText: {
    color: C.ivory,
    fontSize: 11,
    fontWeight: '700',
  },
  greetingBubble: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
    marginBottom: 12,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  greetingLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  voiceBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  voiceBtnText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  greetingTarget: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  greetingEn: {
    color: C.gold,
    fontSize: 12,
    fontStyle: 'italic',
  },
  tipCard: {
    backgroundColor: '#1E1838',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  tipHeading: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  tipBody: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  spotCard: {
    backgroundColor: '#1E1838',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  spotHeading: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  spotBody: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  anecdoteSectionHeading: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  anecdoteCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  anecdoteCardLocked: {
    opacity: 0.5,
  },
  anecdoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  anecdoteBadge: {
    color: C.green,
    fontSize: 10,
    fontWeight: '800',
  },
  anecdoteTierRequired: {
    color: C.muted,
    fontSize: 10,
  },
  anecdoteTitle: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  anecdoteStory: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  anecdoteStoryLocked: {
    fontStyle: 'italic',
    color: C.muted,
  },
});
