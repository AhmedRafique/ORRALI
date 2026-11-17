import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { buildFlashcardDeck, filterLexicon, getLexiconEntries, MasteryStatus } from '../lexicon';
import { Course, Item, Progress } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  lilac: '#EEE9F6',
  green: '#638B70',
  amber: '#E5A548',
  red: '#B75D61',
};

interface Props {
  visible: boolean;
  course: Course;
  progress: Progress;
  onClose: () => void;
}

export default function LexiconModal({ visible, course, progress, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MasteryStatus | 'all'>('all');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Build all entries
  const allEntries = useMemo(() => getLexiconEntries(course, progress), [course, progress]);

  // Filter entries
  const filteredEntries = useMemo(
    () => filterLexicon(allEntries, query, activeFilter),
    [allEntries, query, activeFilter]
  );

  // Flashcard deck
  const flashcardDeck = useMemo(
    () => buildFlashcardDeck(allEntries, 12, activeFilter === 'all' ? undefined : activeFilter),
    [allEntries, activeFilter]
  );

  const currentFlashcard = flashcardDeck[flashcardIndex];

  const playAudio = (item: Item, isSlow = false) => {
    void playPhraseAudio(item, course.code, undefined, isSlow);
  };

  const handleClose = () => {
    void stopAllAudio();
    setIsFlashcardMode(false);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>✦ SMART LEXICON · DICTIONARY</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{course.name} Dictionary</Text>
              <Text style={s.subtitle}>
                {allEntries.length} phrases · Filter by spaced repetition mastery
              </Text>
            </View>
            <Pressable
              style={[s.modeToggle, isFlashcardMode && s.modeToggleActive]}
              onPress={() => {
                setIsFlashcardMode(!isFlashcardMode);
                setFlashcardIndex(0);
                setIsFlipped(false);
              }}
            >
              <Text style={[s.modeToggleText, isFlashcardMode && s.modeToggleTextActive]}>
                {isFlashcardMode ? 'List View 📋' : 'Flashcard Flip 🎴'}
              </Text>
            </Pressable>
          </View>

          {/* Flashcard Flip Mode */}
          {isFlashcardMode ? (
            <View style={s.flashcardContainer}>
              {flashcardDeck.length === 0 ? (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>🎉</Text>
                  <Text style={s.emptyTitle}>No flashcards in this filter</Text>
                  <Text style={s.emptyDesc}>
                    You have no words matching this status. Switch to "All" to drill all vocabulary!
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={s.flashcardCounter}>
                    Card {flashcardIndex + 1} of {flashcardDeck.length}
                  </Text>

                  {currentFlashcard && (
                    <Pressable
                      style={[s.flashcard, isFlipped && s.flashcardFlipped]}
                      onPress={() => setIsFlipped(!isFlipped)}
                    >
                      <Text style={s.flipHint}>Tap card to flip ↻</Text>
                      {!isFlipped ? (
                        <View style={s.flashcardContent}>
                          <Text style={s.flashcardTarget}>{currentFlashcard.item.target}</Text>
                          {currentFlashcard.item.phonetic && (
                            <Text style={s.flashcardPhonetic}>/{currentFlashcard.item.phonetic}/</Text>
                          )}
                          <View style={s.flashcardAudioRow}>
                            <Pressable
                              style={s.flashcardAudioBtn}
                              onPress={() => playAudio(currentFlashcard.item, false)}
                            >
                              <Text style={s.flashcardAudioIcon}>🔊 Normal</Text>
                            </Pressable>
                            <Pressable
                              style={s.flashcardTurtleBtn}
                              onPress={() => playAudio(currentFlashcard.item, true)}
                            >
                              <Text style={s.flashcardTurtleIcon}>🐢 Slow</Text>
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View style={s.flashcardContent}>
                          <Text style={s.flashcardMeaning}>{currentFlashcard.item.en}</Text>
                          <Text style={s.flashcardLesson}>Chapter: {currentFlashcard.lessonTitle}</Text>
                          {currentFlashcard.item.notes && (
                            <Text style={s.flashcardNotes}>{currentFlashcard.item.notes}</Text>
                          )}
                        </View>
                      )}
                    </Pressable>
                  )}

                  <View style={s.flashcardNav}>
                    <Pressable
                      disabled={flashcardIndex === 0}
                      style={[s.navBtn, flashcardIndex === 0 && s.navBtnDisabled]}
                      onPress={() => {
                        setFlashcardIndex((v) => Math.max(0, v - 1));
                        setIsFlipped(false);
                      }}
                    >
                      <Text style={s.navBtnText}>‹ Previous</Text>
                    </Pressable>
                    <Pressable
                      disabled={flashcardIndex >= flashcardDeck.length - 1}
                      style={[s.navBtn, flashcardIndex >= flashcardDeck.length - 1 && s.navBtnDisabled]}
                      onPress={() => {
                        setFlashcardIndex((v) => Math.min(flashcardDeck.length - 1, v + 1));
                        setIsFlipped(false);
                      }}
                    >
                      <Text style={s.navBtnText}>Next Card ›</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ) : (
            <>
              {/* Search Bar */}
              <View style={s.searchBar}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  placeholder="Search French, German, English or phonetics…"
                  placeholderTextColor="#A49CAA"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery('')}>
                    <Text style={s.clearText}>×</Text>
                  </Pressable>
                )}
              </View>

              {/* Filter Chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll}>
                {(['all', 'mastered', 'learning', 'stumble', 'new'] as const).map((filter) => {
                  const active = activeFilter === filter;
                  const label =
                    filter === 'all'
                      ? `All (${allEntries.length})`
                      : filter === 'mastered'
                      ? '🌟 Mastered'
                      : filter === 'learning'
                      ? '⏳ In Progress'
                      : filter === 'stumble'
                      ? '⚠️ Stumbles'
                      : '🌱 New';
                  return (
                    <Pressable
                      key={filter}
                      onPress={() => setActiveFilter(filter)}
                      style={[s.filterChip, active && s.filterChipActive]}
                    >
                      <Text style={[s.filterChipText, active && s.filterChipTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Entries List */}
              <ScrollView style={s.entriesScroll} showsVerticalScrollIndicator={false}>
                {filteredEntries.length === 0 ? (
                  <View style={s.emptyState}>
                    <Text style={s.emptyIcon}>🔍</Text>
                    <Text style={s.emptyTitle}>No matching vocabulary</Text>
                    <Text style={s.emptyDesc}>Try searching with different spelling or reset filters.</Text>
                  </View>
                ) : (
                  filteredEntries.map((entry) => {
                    const badgeColor =
                      entry.mastery === 'mastered'
                        ? C.green
                        : entry.mastery === 'stumble'
                        ? C.red
                        : entry.mastery === 'learning'
                        ? C.amber
                        : C.muted;

                    const masteryLabel =
                      entry.mastery === 'mastered'
                        ? `Mastered · ${entry.interval}d`
                        : entry.mastery === 'stumble'
                        ? `Stumble · ${entry.lapses} lapse${entry.lapses > 1 ? 's' : ''}`
                        : entry.mastery === 'learning'
                        ? `Review in ${entry.interval}d`
                        : 'Not yet practiced';

                    return (
                      <View key={entry.item.id} style={s.entryCard}>
                        <View style={s.entryTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={s.entryTarget}>{entry.item.target}</Text>
                            {entry.item.phonetic && (
                              <Text style={s.entryPhonetic}>/{entry.item.phonetic}/</Text>
                            )}
                          </View>
                          <View style={s.entryAudioGroup}>
                            <Pressable
                              style={s.entryAudioBtn}
                              onPress={() => playAudio(entry.item, false)}
                            >
                              <Text style={s.entryAudioIcon}>🔊</Text>
                            </Pressable>
                            <Pressable
                              style={s.entryTurtleBtn}
                              onPress={() => playAudio(entry.item, true)}
                            >
                              <Text style={s.entryTurtleIcon}>🐢</Text>
                            </Pressable>
                          </View>
                        </View>

                        <Text style={s.entryEn}>{entry.item.en}</Text>

                        <View style={s.entryBottom}>
                          <Text style={s.entryLesson}>
                            {entry.lessonTitle} · {entry.level}
                          </Text>
                          <View style={[s.masteryPill, { borderColor: badgeColor }]}>
                            <Text style={[s.masteryText, { color: badgeColor }]}>
                              {masteryLabel}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </>
          )}

          <Pressable style={s.doneBtn} onPress={handleClose}>
            <Text style={s.doneBtnText}>Close Dictionary</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#F7F2E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#8A692E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: C.midnight, fontSize: 22, lineHeight: 25 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { color: C.midnight, fontSize: 19, fontWeight: '800' },
  subtitle: { color: C.muted, fontSize: 11, marginTop: 2 },
  modeToggle: {
    backgroundColor: '#F1EBE5',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2D7C8',
  },
  modeToggleActive: { backgroundColor: C.gold, borderColor: C.gold },
  modeToggleText: { color: '#775727', fontSize: 10, fontWeight: '800' },
  modeToggleTextActive: { color: C.midnight },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 13, marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 12, color: C.ink },
  clearText: { fontSize: 18, color: C.muted, paddingHorizontal: 4 },
  filtersScroll: { maxHeight: 36, marginBottom: 12 },
  filterChip: {
    backgroundColor: '#F3EEF8',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#E6DCF0',
  },
  filterChipActive: { backgroundColor: C.midnight, borderColor: C.midnight },
  filterChipText: { color: C.midnight, fontSize: 10, fontWeight: '700' },
  filterChipTextActive: { color: C.white },
  entriesScroll: { maxHeight: 350, marginBottom: 12 },
  entryCard: {
    backgroundColor: '#FAF9FB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAE5EF',
  },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryTarget: { color: C.midnight, fontSize: 15, fontWeight: '800' },
  entryPhonetic: { color: C.gold, fontSize: 12, fontWeight: '700', marginTop: 2 },
  entryAudioGroup: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  entryAudioBtn: { padding: 4 },
  entryAudioIcon: { fontSize: 14 },
  entryTurtleBtn: { padding: 4 },
  entryTurtleIcon: { fontSize: 13 },
  entryEn: { color: C.ink, fontSize: 12, marginTop: 4, marginBottom: 8 },
  entryBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryLesson: { color: C.muted, fontSize: 10 },
  masteryPill: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  masteryText: { fontSize: 9, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 28, marginBottom: 8 },
  emptyTitle: { color: C.midnight, fontSize: 15, fontWeight: '800' },
  emptyDesc: { color: C.muted, fontSize: 11, marginTop: 3 },

  // Flashcard Flip Styles
  flashcardContainer: { alignItems: 'center', paddingVertical: 8 },
  flashcardCounter: { color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 8 },
  flashcard: {
    width: '100%',
    height: 220,
    backgroundColor: C.midnight,
    borderRadius: 22,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  flashcardFlipped: { backgroundColor: '#30234D' },
  flipHint: { position: 'absolute', top: 12, right: 14, color: '#A592BD', fontSize: 10, fontWeight: '800' },
  flashcardContent: { alignItems: 'center' },
  flashcardTarget: { color: C.white, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  flashcardPhonetic: { color: C.gold, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  flashcardAudioRow: { flexDirection: 'row', gap: 8 },
  flashcardAudioBtn: { backgroundColor: '#43345E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  flashcardAudioIcon: { color: C.gold, fontSize: 11, fontWeight: '800' },
  flashcardTurtleBtn: { backgroundColor: '#3A2C52', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  flashcardTurtleIcon: { color: C.gold, fontSize: 11, fontWeight: '800' },
  flashcardMeaning: { color: C.white, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  flashcardLesson: { color: C.gold, fontSize: 11, fontWeight: '800', marginBottom: 8 },
  flashcardNotes: { color: '#E4DBEC', fontSize: 11, textAlign: 'center', paddingHorizontal: 10 },
  flashcardNav: { flexDirection: 'row', gap: 14, marginTop: 16, marginBottom: 8 },
  navBtn: { backgroundColor: '#F0EBF4', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { color: C.midnight, fontSize: 12, fontWeight: '800' },
  doneBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
});
