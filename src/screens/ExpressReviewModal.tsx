import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { playPhraseAudio, stopAllAudio } from '../audio';
import { playEarcon } from '../earcons';
import {
  evaluateExpressSwipe,
  extractExpressReviewDeck,
  ExpressSwipeAction,
} from '../expressReview';
import { detectWordGender, getGenderPalette } from '../gender';
import { triggerHaptic } from '../sensory';
import { Course, Progress } from '../types';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
  amber: '#E5A548',
};

interface Props {
  visible: boolean;
  course: Course;
  progress: Progress;
  onFinish: (result: { correctIds: string[]; wrongIds: string[]; earnedXp: number }) => void;
  onClose: () => void;
}

export default function ExpressReviewModal({ visible, course, progress, onFinish, onClose }: Props) {
  const deck = useMemo(() => extractExpressReviewDeck(course, progress), [course, progress, visible]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = deck[index];
  const totalCards = deck.length;

  useEffect(() => {
    if (visible && deck.length === 0) {
      setIsFinished(true);
    }
  }, [visible, deck.length]);

  const handleSwipe = (action: ExpressSwipeAction) => {
    void triggerHaptic(action === 'knew_it' ? 'success' : 'light');
    void stopAllAudio();
    const res = evaluateExpressSwipe(action);

    if (res.isOk) {
      setCorrectIds((prev) => [...prev, currentCard.item.id]);
    } else {
      setWrongIds((prev) => [...prev, currentCard.item.id]);
    }
    setTotalXp((xp) => xp + res.earnedXp);

    if (index + 1 >= totalCards) {
      setIsFinished(true);
      void playEarcon('success');
    } else {
      setIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleClose = () => {
    void stopAllAudio();
    onClose();
  };

  const handleClaim = () => {
    void triggerHaptic('success');
    void stopAllAudio();
    onFinish({ correctIds, wrongIds, earnedXp: totalXp });
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>⚡ 3-MIN EXPRESS REVIEW</Text>
            </View>
            <Pressable onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {!isFinished ? (
            <View style={s.content}>
              <View style={s.progressRow}>
                <Text style={s.counter}>
                  Card {index + 1} of {totalCards}
                </Text>
                <Text style={s.streakText}>Fast-Track Sprint</Text>
              </View>

              <View style={s.track}>
                <View style={[s.fill, { width: `${((index + 1) / Math.max(1, totalCards)) * 100}%` }]} />
              </View>

              {currentCard && (
                <Pressable
                  style={[s.flashcard, isFlipped && s.flashcardFlipped]}
                  onPress={() => {
                    void triggerHaptic('selection');
                    setIsFlipped(!isFlipped);
                  }}
                >
                  <Text style={s.flipHint}>Tap card to flip ↻</Text>
                  {!isFlipped ? (
                    <View style={s.flashcardContent}>
                      <Text style={s.flashcardTarget}>{currentCard.item.target}</Text>
                      {(() => {
                        const words = currentCard.item.target.split(/\s+/);
                        const gender = words.map((w) => detectWordGender(w, course.code)).find(Boolean);
                        if (!gender) return null;
                        const pal = getGenderPalette(gender);
                        return (
                          <View
                            style={{
                              backgroundColor: pal.badgeBg,
                              borderColor: pal.border,
                              borderWidth: 1,
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 8,
                              marginTop: 10,
                              alignSelf: 'center',
                            }}
                          >
                            <Text style={{ color: pal.badge, fontSize: 12, fontWeight: '800' }}>
                              {pal.symbol} {pal.label.toUpperCase()}
                            </Text>
                          </View>
                        );
                      })()}
                      {currentCard.item.phonetic && (
                        <Text style={s.flashcardPhonetic}>/{currentCard.item.phonetic}/</Text>
                      )}
                      <View style={s.flashcardAudioRow}>
                        <Pressable
                          style={s.flashcardAudioBtn}
                          onPress={() => playPhraseAudio(currentCard.item, course.code, undefined, false)}
                        >
                          <Text style={s.flashcardAudioIcon}>🔊 Normal</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={s.flashcardContent}>
                      <Text style={s.flashcardMeaning}>{currentCard.item.en}</Text>
                      <Text style={s.flashcardLesson}>Chapter: {currentCard.lessonTitle}</Text>
                      {currentCard.item.notes && (
                        <Text style={s.flashcardNotes}>{currentCard.item.notes}</Text>
                      )}
                    </View>
                  )}
                </Pressable>
              )}

              {/* Swipe Buttons Row */}
              <View style={s.swipeRow}>
                <Pressable style={s.swipeBtnLeft} onPress={() => handleSwipe('needs_practice')}>
                  <Text style={s.swipeBtnIconLeft}>✕</Text>
                  <Text style={s.swipeBtnTextLeft}>Needs Practice</Text>
                </Pressable>

                <Pressable style={s.swipeBtnRight} onPress={() => handleSwipe('knew_it')}>
                  <Text style={s.swipeBtnIconRight}>✓</Text>
                  <Text style={s.swipeBtnTextRight}>I Knew It</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.finishArea}>
              <Text style={s.finishIcon}>⚡</Text>
              <Text style={s.finishTitle}>Sprint Complete!</Text>
              <Text style={s.finishSub}>
                {totalCards > 0
                  ? `You cleared your due queue in under 3 minutes and earned ${totalXp} XP. Your daily streak is safe!`
                  : 'You have no urgently due cards right now. You are all caught up!'}
              </Text>
              <Pressable style={s.claimBtn} onPress={handleClaim}>
                <Text style={s.claimBtnText}>Claim +{totalXp} XP & Return</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#FAF0DE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#8A5D1E',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EEF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  content: {
    alignItems: 'center',
  },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counter: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  streakText: {
    color: C.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: C.line,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  fill: {
    height: '100%',
    backgroundColor: C.amber,
    borderRadius: 3,
  },
  flashcard: {
    width: '100%',
    backgroundColor: '#F3EEF8',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5DCEF',
    minHeight: 260,
    justifyContent: 'center',
    marginBottom: 24,
  },
  flashcardFlipped: {
    backgroundColor: '#FAF9FC',
  },
  flipHint: {
    position: 'absolute',
    top: 14,
    color: '#A49CAA',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  flashcardContent: {
    alignItems: 'center',
    width: '100%',
  },
  flashcardTarget: {
    color: C.purple,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  flashcardPhonetic: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 10,
  },
  flashcardAudioRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  flashcardAudioBtn: {
    backgroundColor: C.midnight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  flashcardAudioIcon: {
    color: C.white,
    fontSize: 12,
    fontWeight: '800',
  },
  flashcardMeaning: {
    color: C.ink,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  flashcardLesson: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  flashcardNotes: {
    color: '#554C62',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 10,
  },
  swipeRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 16,
  },
  swipeBtnLeft: {
    flex: 1,
    backgroundColor: '#FDEEEF',
    borderColor: '#F5C5C8',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  swipeBtnIconLeft: {
    color: C.red,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  swipeBtnTextLeft: {
    color: C.red,
    fontSize: 13,
    fontWeight: '800',
  },
  swipeBtnRight: {
    flex: 1,
    backgroundColor: '#EDF7F1',
    borderColor: '#BFE3CE',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  swipeBtnIconRight: {
    color: C.green,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  swipeBtnTextRight: {
    color: C.green,
    fontSize: 13,
    fontWeight: '800',
  },
  finishArea: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  finishIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  finishTitle: {
    color: C.midnight,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  finishSub: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  claimBtn: {
    backgroundColor: C.midnight,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  claimBtnText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
});
