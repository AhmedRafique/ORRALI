import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course } from '../types';
import {
  GrammarSlotType,
  MatrixExercise,
  MatrixSlotOption,
  MatrixTemplate,
} from '../matrix/types';
import {
  evaluateMatrixExercise,
  generateMatrixExercise,
  generateMatrixSentence,
} from '../matrix/generator';
import { getTemplatesByLanguage } from '../matrix/templates';

const C = {
  midnight: '#1B1536',
  purple: '#30234D',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
  amber: '#E5A548',
  blue: '#3A5A98',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinishDrill?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function MatrixDrillModal({
  visible,
  course,
  onFinishDrill,
  onClose,
}: Props) {
  const templates = useMemo(
    () => getTemplatesByLanguage(course.code),
    [course.code]
  );

  const [activeTemplateIndex, setActiveTemplateIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<
    Partial<Record<GrammarSlotType, MatrixSlotOption>>
  >({});

  // Interactive drill mode state
  const [drillMode, setDrillMode] = useState<'forge' | 'exercise'>('forge');
  const [currentExercise, setCurrentExercise] = useState<MatrixExercise | null>(null);
  const [drillInput, setDrillInput] = useState('');
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);
  const [isDrillCorrect, setIsDrillCorrect] = useState<boolean | null>(null);
  const [earnedXp, setEarnedXp] = useState(0);

  const activeTemplate: MatrixTemplate | undefined = templates[activeTemplateIndex] ?? templates[0];

  // Initialize slots
  useEffect(() => {
    if (visible && activeTemplate) {
      const initial: Partial<Record<GrammarSlotType, MatrixSlotOption>> = {};
      for (const slot of activeTemplate.slots) {
        initial[slot.type] = slot.options[0];
      }
      setSelectedSlots(initial);
      setDrillMode('forge');
      setDrillInput('');
      setDrillFeedback(null);
      setIsDrillCorrect(null);
      setEarnedXp(0);
    }
  }, [visible, activeTemplateIndex, activeTemplate]);

  // Compute live synthesized sentence
  const liveSentence = useMemo(() => {
    if (!activeTemplate) return null;
    return generateMatrixSentence(activeTemplate, selectedSlots);
  }, [activeTemplate, selectedSlots]);

  function handleSelectSlotOption(type: GrammarSlotType, option: MatrixSlotOption) {
    triggerHaptic('selection');
    setSelectedSlots((prev) => ({ ...prev, [type]: option }));
  }

  function handleStartExercise() {
    triggerHaptic('light');
    const ex = generateMatrixExercise(course.code, activeTemplate?.level ?? 'A1', 'substitution');
    setCurrentExercise(ex);
    setDrillMode('exercise');
    setDrillInput('');
    setDrillFeedback(null);
    setIsDrillCorrect(null);
  }

  function handleSubmitDrill() {
    if (!currentExercise || !drillInput.trim()) return;
    const res = evaluateMatrixExercise(currentExercise, drillInput);
    setIsDrillCorrect(res.isCorrect);
    setDrillFeedback(res.feedback);
    setEarnedXp(res.earnedXp);

    if (res.isCorrect) {
      triggerHaptic('success');
      void playEarcon('fanfare');
      onFinishDrill?.(res.earnedXp);
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  }

  if (!activeTemplate || !liveSentence) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContainer}>
          {/* Header */}
          <View style={s.headerRow}>
            <View style={s.badgePill}>
              <Text style={s.badgePillText}>
                SENTENCE FORGE · {activeTemplate.level} MATRIX
              </Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Combinatorial Sentence Matrix</Text>
          <Text style={s.subtitle}>{activeTemplate.title}</Text>

          {/* Mode Switcher */}
          <View style={s.modeTabsRow}>
            <Pressable
              style={[s.modeTab, drillMode === 'forge' && s.modeTabActive]}
              onPress={() => setDrillMode('forge')}
            >
              <Text style={[s.modeTabText, drillMode === 'forge' && s.modeTabTextActive]}>
                ⚡ Live Forge
              </Text>
            </Pressable>
            <Pressable
              style={[s.modeTab, drillMode === 'exercise' && s.modeTabActive]}
              onPress={handleStartExercise}
            >
              <Text style={[s.modeTabText, drillMode === 'exercise' && s.modeTabTextActive]}>
                🎯 Substitution Drill
              </Text>
            </Pressable>
          </View>

          <ScrollView style={s.scrollArea} contentContainerStyle={s.scrollContent}>
            {drillMode === 'forge' ? (
              <View>
                {/* Live Morphing Output Card */}
                <View style={s.forgeOutputCard}>
                  <Text style={s.forgeLabel}>Synthesized Target Phrase:</Text>
                  <Text style={s.forgeTargetText}>{liveSentence.target}</Text>
                  <Text style={s.forgeEnText}>"{liveSentence.en}"</Text>

                  <View style={s.ruleBox}>
                    <Text style={s.ruleHeading}>📘 Morphological Agreement Rule</Text>
                    <Text style={s.ruleText}>{liveSentence.grammarExplanation}</Text>
                  </View>
                </View>

                {/* Slot Selector Matrix */}
                <Text style={s.sectionHeading}>Swap Sentence Slots</Text>
                {activeTemplate.slots.map((slot) => {
                  const currentSelected = selectedSlots[slot.type];
                  return (
                    <View key={slot.type} style={s.slotRowCard}>
                      <Text style={s.slotTypeLabel}>{slot.label}</Text>
                      <View style={s.optionsPillRow}>
                        {slot.options.map((opt) => {
                          const isSelected = currentSelected?.id === opt.id;
                          return (
                            <Pressable
                              key={opt.id}
                              style={[s.slotOptionPill, isSelected && s.slotOptionActive]}
                              onPress={() => handleSelectSlotOption(slot.type, opt)}
                            >
                              <Text
                                style={[
                                  s.slotOptionText,
                                  isSelected && s.slotOptionTextActive,
                                ]}
                              >
                                {opt.text}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}

                <Pressable style={s.primaryBtn} onPress={handleStartExercise}>
                  <Text style={s.primaryBtnText}>Test Your Skills with a Drill →</Text>
                </Pressable>
              </View>
            ) : (
              /* EXERCISE MODE */
              currentExercise && (
                <View>
                  <View style={s.exercisePromptCard}>
                    <Text style={s.drillTag}>SUBSTITUTION CHALLENGE</Text>
                    <Text style={s.drillPrompt}>{currentExercise.prompt}</Text>
                    <Text style={s.drillInstruction}>{currentExercise.instructions}</Text>

                    <View style={s.baseSentenceBox}>
                      <Text style={s.baseLabel}>Base Phrase:</Text>
                      <Text style={s.baseTarget}>{currentExercise.baseSentence}</Text>
                      <Text style={s.baseEn}>"{currentExercise.baseEn}"</Text>
                    </View>
                  </View>

                  <TextInput
                    style={s.drillInput}
                    placeholder="Type the transformed sentence..."
                    placeholderTextColor={C.muted}
                    value={drillInput}
                    onChangeText={setDrillInput}
                  />

                  {!drillFeedback ? (
                    <Pressable
                      style={[s.primaryBtn, { opacity: drillInput.trim() ? 1.0 : 0.5 }]}
                      disabled={!drillInput.trim()}
                      onPress={handleSubmitDrill}
                    >
                      <Text style={s.primaryBtnText}>Check Transformation</Text>
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        s.feedbackCard,
                        { borderColor: isDrillCorrect ? C.green : C.red },
                      ]}
                    >
                      <Text
                        style={[
                          s.feedbackHeading,
                          { color: isDrillCorrect ? C.green : C.red },
                        ]}
                      >
                        {isDrillCorrect ? '✓ Correct Transformation' : '⚠️ Agreement Slip'}
                      </Text>
                      <Text style={s.feedbackText}>{drillFeedback}</Text>
                      {earnedXp > 0 && <Text style={s.xpBanner}>+{earnedXp} XP EARNED</Text>}

                      <Pressable
                        style={s.primaryBtn}
                        onPress={() => {
                          setDrillMode('forge');
                        }}
                      >
                        <Text style={s.primaryBtnText}>Back to Matrix Forge</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )
            )}
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
    fontSize: 13,
    marginBottom: 14,
  },
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#130E26',
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    gap: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: C.purple,
  },
  modeTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: C.gold,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  forgeOutputCard: {
    backgroundColor: '#1E1838',
    padding: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: C.gold,
    marginBottom: 16,
  },
  forgeLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  forgeTargetText: {
    color: C.ivory,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  forgeEnText: {
    color: C.gold,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  ruleBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 10,
    borderRadius: 8,
  },
  ruleHeading: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  ruleText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeading: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  slotRowCard: {
    backgroundColor: C.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  slotTypeLabel: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  optionsPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotOptionPill: {
    backgroundColor: C.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotOptionActive: {
    borderColor: C.gold,
    backgroundColor: '#3F2C68',
  },
  slotOptionText: {
    color: C.ivory,
    fontSize: 12,
    fontWeight: '600',
  },
  slotOptionTextActive: {
    color: C.gold,
    fontWeight: '800',
  },
  exercisePromptCard: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
  },
  drillTag: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  drillPrompt: {
    color: C.ivory,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  drillInstruction: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 12,
  },
  baseSentenceBox: {
    backgroundColor: '#130E26',
    padding: 10,
    borderRadius: 8,
  },
  baseLabel: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  baseTarget: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '700',
  },
  baseEn: {
    color: C.gold,
    fontSize: 12,
    fontStyle: 'italic',
  },
  drillInput: {
    backgroundColor: C.cardBg,
    color: C.ivory,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: C.purple,
    marginBottom: 12,
  },
  feedbackCard: {
    backgroundColor: C.cardBg,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginTop: 6,
  },
  feedbackHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackText: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  xpBanner: {
    color: C.amber,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  primaryBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryBtnText: {
    color: C.midnight,
    fontSize: 14,
    fontWeight: '800',
  },
});
