import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  buildSyntaxRadarChallenge,
  DependencyNode,
  evaluateSyntaxAnswer,
  getDependencyTreesByLanguage,
  SentenceDependencyTree,
  SyntaxNodeChallenge,
} from '../grammar/dependencyTree';
import { playEmotionalSpeech } from '../audio/emotionalTts';
import { playEarcon } from '../earcons';
import { triggerHaptic } from '../sensory';
import { Course } from '../types';

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
  cardBgAlt: '#1F1735',
  amber: '#E5A548',
  cyan: '#58A6FF',
  coral: '#E36209',
};

interface Props {
  visible: boolean;
  course: Course;
  onFinish?: (earnedXp: number) => void;
  onClose: () => void;
}

export default function SyntaxRadarModal({
  visible,
  course,
  onFinish,
  onClose,
}: Props) {
  const [trees, setTrees] = useState<SentenceDependencyTree[]>([]);
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(0);
  const [activeNode, setActiveNode] = useState<DependencyNode | null>(null);

  // Drill state
  const [isDrillMode, setIsDrillMode] = useState(false);
  const [drillChallenge, setDrillChallenge] = useState<SyntaxNodeChallenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [drillEvaluation, setDrillEvaluation] = useState<{
    isCorrect: boolean;
    feedback: string;
    ruleExplanation: string;
    earnedXp: number;
  } | null>(null);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (visible) {
      const pool = getDependencyTreesByLanguage(course.code);
      setTrees(pool);
      setSelectedTreeIndex(0);
      setActiveNode(pool[0]?.rootNode ?? null);
      setIsDrillMode(false);
      setDrillChallenge(null);
      setSelectedOption(null);
      setDrillEvaluation(null);
      setTotalXp(0);
    }
  }, [visible, course.code]);

  const currentTree = trees[selectedTreeIndex];

  const handlePlaySentence = () => {
    if (!currentTree) return;
    triggerHaptic('light');
    void playEarcon('success');
    void playEmotionalSpeech(currentTree.fullSentence, {
      languageId: course.code,
      overrideRate: 0.9,
    });
  };

  const startDrillChallenge = () => {
    const ch = buildSyntaxRadarChallenge(course.code);
    setDrillChallenge(ch);
    setSelectedOption(null);
    setDrillEvaluation(null);
    setIsDrillMode(true);
  };

  const handleSelectDrillOption = (token: string) => {
    if (!drillChallenge || selectedOption) return;
    setSelectedOption(token);

    const res = evaluateSyntaxAnswer(drillChallenge, token);
    setDrillEvaluation(res);
    setTotalXp((prev) => prev + res.earnedXp);

    if (res.isCorrect) {
      triggerHaptic('success');
      void playEarcon('success');
    } else {
      triggerHaptic('error');
      void playEarcon('error');
    }
  };

  const handleExitDrill = () => {
    setIsDrillMode(false);
    if (totalXp > 0 && onFinish) {
      onFinish(totalXp);
    }
  };

  const getNodeRoleColor = (role: string) => {
    switch (role) {
      case 'ROOT':
        return C.gold;
      case 'SUBJECT':
        return C.cyan;
      case 'DIRECT_OBJECT':
        return C.green;
      case 'INDIRECT_OBJECT':
        return C.amber;
      case 'SUBORDINATE_CLAUSE':
        return '#BC85FF';
      case 'PREPOSITIONAL_OBJECT':
        return '#F0883E';
      default:
        return C.muted;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Visual Grammar & Syntax Radar</Text>
              <Text style={s.subtitle}>
                Cognitive Sentence Parsing • {course.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Syntax Radar"
              style={s.closeBtn}
              onPress={onClose}
            >
              <Text style={s.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isDrillMode && drillChallenge ? (
              /* --- SYNTAX RADAR DRILL MODE --- */
              <View>
                <View style={s.drillBadgeRow}>
                  <Text style={s.drillBadge}>SYNTAX RADAR ACTIVE</Text>
                  <Text style={s.scoreLabel}>+{totalXp} XP</Text>
                </View>

                <View style={s.sentenceCard}>
                  <Text style={s.targetSentencePrompt}>
                    {drillChallenge.tree.fullSentence}
                  </Text>
                  <Text style={s.targetSentenceTrans}>
                    "{drillChallenge.tree.translation}"
                  </Text>
                  <Text style={s.drillQuestionText}>
                    Which constituent governs the{' '}
                    <Text style={{ color: C.gold, fontWeight: '900' }}>
                      {drillChallenge.targetRole.replace(/_/g, ' ')}
                    </Text>
                    ?
                  </Text>
                </View>

                {/* Options */}
                <View style={s.drillOptionsList}>
                  {drillChallenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === opt.token;
                    const isCorrect = opt.isCorrect;

                    return (
                      <Pressable
                        key={idx}
                        accessibilityRole="button"
                        style={[
                          s.drillOptionBtn,
                          selectedOption && isCorrect && s.drillOptionCorrect,
                          selectedOption && isSelected && !isCorrect && s.drillOptionWrong,
                        ]}
                        onPress={() => handleSelectDrillOption(opt.token)}
                        disabled={!!selectedOption}
                      >
                        <Text style={s.drillOptionToken}>{opt.token}</Text>
                        <Text style={s.drillOptionRole}>
                          {opt.role.replace(/_/g, ' ')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {drillEvaluation && (
                  <View
                    style={[
                      s.feedbackCard,
                      drillEvaluation.isCorrect
                        ? s.feedbackCardCorrect
                        : s.feedbackCardWrong,
                    ]}
                  >
                    <View style={s.feedbackHeader}>
                      <Text style={s.feedbackStatus}>
                        {drillEvaluation.isCorrect ? '✓ TARGET HIT' : '✕ RADAR MISS'}
                      </Text>
                      <Text style={s.earnedXpText}>
                        +{drillEvaluation.earnedXp} XP
                      </Text>
                    </View>
                    <Text style={s.feedbackText}>{drillEvaluation.feedback}</Text>
                    <Text style={s.ruleText}>{drillEvaluation.ruleExplanation}</Text>

                    <View style={s.drillActionsRow}>
                      <Pressable
                        accessibilityRole="button"
                        style={s.drillNextBtn}
                        onPress={startDrillChallenge}
                      >
                        <Text style={s.drillNextText}>Next Radar Target →</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        style={s.drillBackBtn}
                        onPress={handleExitDrill}
                      >
                        <Text style={s.drillBackText}>Back to Tree Inspector</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ) : currentTree ? (
              /* --- VISUAL DEPENDENCY TREE INSPECTION MODE --- */
              <View>
                {/* Sentence Selector Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={s.treeTabs}
                >
                  {trees.map((t, idx) => (
                    <Pressable
                      key={t.id}
                      accessibilityRole="button"
                      style={[
                        s.treeTab,
                        selectedTreeIndex === idx && s.treeTabActive,
                      ]}
                      onPress={() => {
                        setSelectedTreeIndex(idx);
                        setActiveNode(t.rootNode);
                      }}
                    >
                      <Text
                        style={[
                          s.treeTabText,
                          selectedTreeIndex === idx && s.treeTabTextActive,
                        ]}
                      >
                        {t.cefrLevel} • {t.radarHighlights.governanceRule.slice(0, 18)}...
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Sentence Card with Audio Playback */}
                <View style={s.sentenceCard}>
                  <View style={s.sentenceHeaderRow}>
                    <Text style={s.levelBadge}>{currentTree.cefrLevel}</Text>
                    <Pressable
                      accessibilityRole="button"
                      style={s.audioBtn}
                      onPress={handlePlaySentence}
                    >
                      <Text style={s.audioBtnText}>🔊 Listen</Text>
                    </Pressable>
                  </View>

                  <Text style={s.sentenceText}>{currentTree.fullSentence}</Text>
                  <Text style={s.translationText}>"{currentTree.translation}"</Text>

                  {/* Highlights Banner */}
                  <View style={s.ruleBanner}>
                    <Text style={s.ruleBannerTitle}>
                      ⚡ {currentTree.radarHighlights.governanceRule}
                    </Text>
                    <Text style={s.ruleBannerBody}>
                      {currentTree.radarHighlights.linguisticMechanism}
                    </Text>
                  </View>
                </View>

                {/* Interactive Tree Nodes */}
                <Text style={s.sectionHeader}>
                  INTERACTIVE SYNTACTIC CONSTITUENTS
                </Text>
                <Text style={s.sectionSub}>
                  Tap any constituent to inspect case governance and structural role:
                </Text>

                <View style={s.nodesCluster}>
                  {currentTree.allNodes.map((node) => {
                    const isSelected = activeNode?.id === node.id;
                    const roleColor = getNodeRoleColor(node.role);

                    return (
                      <Pressable
                        key={node.id}
                        accessibilityRole="button"
                        style={[
                          s.nodePill,
                          { borderColor: roleColor },
                          isSelected && { backgroundColor: '#352458' },
                        ]}
                        onPress={() => {
                          triggerHaptic('light');
                          setActiveNode(node);
                        }}
                      >
                        <Text style={[s.nodeRoleBadge, { color: roleColor }]}>
                          {node.role.replace(/_/g, ' ')}
                        </Text>
                        <Text style={s.nodeToken}>{node.token}</Text>
                        {node.caseGovernance && (
                          <Text style={s.nodeCaseTag}>[{node.caseGovernance}]</Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {/* Active Node Detail Card */}
                {activeNode && (
                  <View style={s.detailCard}>
                    <View style={s.detailHeaderRow}>
                      <Text style={s.detailRole}>
                        {activeNode.role.replace(/_/g, ' ')}
                      </Text>
                      <Text style={s.detailRelation}>
                        rel: {activeNode.relation}
                      </Text>
                    </View>
                    <Text style={s.detailToken}>{activeNode.token}</Text>
                    {activeNode.lemma && (
                      <Text style={s.detailLemma}>Lemma: "{activeNode.lemma}"</Text>
                    )}
                    {activeNode.caseNote && (
                      <View style={s.caseNoteBox}>
                        <Text style={s.caseNoteText}>
                          📌 {activeNode.caseNote}
                        </Text>
                      </View>
                    )}
                    <Text style={s.detailExplanation}>
                      {activeNode.explanation}
                    </Text>
                  </View>
                )}

                {/* Launch Syntax Drill Button */}
                <Pressable
                  accessibilityRole="button"
                  style={s.launchDrillBtn}
                  onPress={startDrillChallenge}
                >
                  <Text style={s.launchDrillText}>
                    ⚡ Launch Syntax Radar Drill (+25 XP)
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
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
  container: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: C.midnight,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#3D315E',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D234A',
  },
  title: {
    color: C.ivory,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A1F45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  treeTabs: {
    marginBottom: 16,
  },
  treeTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.cardBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3D315E',
  },
  treeTabActive: {
    backgroundColor: C.purple,
    borderColor: C.gold,
  },
  treeTabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  treeTabTextActive: {
    color: C.gold,
    fontWeight: '800',
  },
  sentenceCard: {
    backgroundColor: C.cardBg,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#3D315E',
    marginBottom: 18,
  },
  sentenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: 'rgba(212, 175, 124, 0.2)',
    color: C.gold,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  audioBtn: {
    backgroundColor: C.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  audioBtnText: {
    color: C.white,
    fontSize: 11,
    fontWeight: '700',
  },
  sentenceText: {
    color: C.ivory,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  translationText: {
    color: C.muted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  ruleBanner: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
  },
  ruleBannerTitle: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  ruleBannerBody: {
    color: C.ivory,
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeader: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionSub: {
    color: C.muted,
    fontSize: 11,
    marginBottom: 12,
  },
  nodesCluster: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  nodePill: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2,
  },
  nodeRoleBadge: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  nodeToken: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '800',
  },
  nodeCaseTag: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: C.cardBgAlt,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D315E',
    marginBottom: 18,
  },
  detailHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailRole: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  detailRelation: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  detailToken: {
    color: C.ivory,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  detailLemma: {
    color: C.muted,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  caseNoteBox: {
    backgroundColor: 'rgba(212, 175, 124, 0.15)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  caseNoteText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  detailExplanation: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
  },
  launchDrillBtn: {
    backgroundColor: C.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  launchDrillText: {
    color: C.midnight,
    fontSize: 14,
    fontWeight: '800',
  },

  // Drill Styles
  drillBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drillBadge: {
    color: C.cyan,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  scoreLabel: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  targetSentencePrompt: {
    color: C.ivory,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 4,
  },
  targetSentenceTrans: {
    color: C.muted,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  drillQuestionText: {
    color: C.ivory,
    fontSize: 14,
    fontWeight: '700',
  },
  drillOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  drillOptionBtn: {
    backgroundColor: C.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: '#3D315E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillOptionCorrect: {
    borderColor: C.green,
    backgroundColor: '#1C3127',
  },
  drillOptionWrong: {
    borderColor: C.red,
    backgroundColor: '#351C24',
  },
  drillOptionToken: {
    color: C.ivory,
    fontSize: 15,
    fontWeight: '800',
  },
  drillOptionRole: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  feedbackCardCorrect: {
    backgroundColor: '#182B21',
    borderColor: C.green,
  },
  feedbackCardWrong: {
    backgroundColor: '#2D1820',
    borderColor: C.red,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackStatus: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  earnedXpText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackText: {
    color: C.ivory,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  ruleText: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },
  drillActionsRow: {
    gap: 8,
  },
  drillNextBtn: {
    backgroundColor: C.gold,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  drillNextText: {
    color: C.midnight,
    fontSize: 13,
    fontWeight: '800',
  },
  drillBackBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  drillBackText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
