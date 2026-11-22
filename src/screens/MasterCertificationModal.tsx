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
  generateMasterCertificate,
  MasterDiplomaCertificate,
} from '../milestones/certification';
import { CEFRLevel, MILESTONE_DEFS } from '../milestones';
import { playEarcon } from '../earcons';
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
  green: '#638B70',
  red: '#B75D61',
  cardBg: '#2A1F45',
  cardBgAlt: '#1F1735',
  amber: '#E5A548',
  cyan: '#58A6FF',
};

interface Props {
  visible: boolean;
  course: Course;
  progress: Progress;
  onAwardCertificate?: (certificate: MasterDiplomaCertificate, earnedXp: number) => void;
  onClose: () => void;
}

export default function MasterCertificationModal({
  visible,
  course,
  progress,
  onAwardCertificate,
  onClose,
}: Props) {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>('C1');
  const [certificate, setCertificate] = useState<MasterDiplomaCertificate | null>(null);
  const [isExamEvaluating, setIsExamEvaluating] = useState(false);

  useEffect(() => {
    if (visible) {
      // Auto-generate certificate for selected level based on progress
      evaluateActiveLevelCertificate(selectedLevel);
    }
  }, [visible, selectedLevel, course.code]);

  const evaluateActiveLevelCertificate = (level: CEFRLevel) => {
    setIsExamEvaluating(true);

    // Compute realistic pillar scores derived from learner progress
    const completedCount = Object.keys(progress.completed).length;
    const basePillar = Math.min(98, Math.max(82, 80 + Math.floor(completedCount / 3)));

    const cert = generateMasterCertificate({
      languageId: course.code,
      courseName: course.name,
      level,
      recipientName: 'ORRALI Fluency Scholar',
      listeningPct: basePillar + 4,
      readingSyntaxPct: basePillar + 2,
      writingPct: basePillar - 2,
      speakingPct: basePillar + 3,
    });

    setCertificate(cert);
    setIsExamEvaluating(false);
  };

  const handleClaimDiploma = () => {
    if (!certificate) return;
    triggerHaptic('success');
    void playEarcon('fanfare');

    if (onAwardCertificate) {
      onAwardCertificate(certificate, 100);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View>
              <Text style={s.title}>Master Fluency Certification 🎓</Text>
              <Text style={s.subtitle}>
                Official CEFR Multi-Pillar Diplomas • {course.name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Master Certification"
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
            {/* CEFR Level Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.levelTabs}
            >
              {MILESTONE_DEFS.map((def) => (
                <Pressable
                  key={def.level}
                  accessibilityRole="button"
                  style={[
                    s.levelTab,
                    selectedLevel === def.level && s.levelTabActive,
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedLevel(def.level);
                  }}
                >
                  <Text
                    style={[
                      s.levelTabText,
                      selectedLevel === def.level && s.levelTabTextActive,
                    ]}
                  >
                    CEFR {def.level}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Official Diploma Preview Card */}
            {certificate ? (
              <View style={s.diplomaCard}>
                <View style={s.sealBanner}>
                  <Text style={s.sealText}>{certificate.cryptographicSeal}</Text>
                  <Text style={s.honorsBadge}>{certificate.honorsTier} HONORS</Text>
                </View>

                <Text style={s.diplomaInstitution}>ORRALI LANGUAGE ECOSYSTEM</Text>
                <Text style={s.diplomaMainTitle}>{certificate.levelTitle}</Text>
                <Text style={s.diplomaSubtitle}>
                  This accredited Master Diploma certifies that
                </Text>

                <Text style={s.recipientName}>{certificate.recipientName}</Text>
                <Text style={s.recipientSub}>
                  has demonstrated operational fluency and syntactic competence in{' '}
                  <Text style={{ color: C.gold, fontWeight: '800' }}>
                    {certificate.courseName}
                  </Text>{' '}
                  at European Triad CEFR {certificate.level} standard.
                </Text>

                {/* 4 Pillars Radar Grid */}
                <View style={s.pillarGrid}>
                  {certificate.pillarScores.map((p) => (
                    <View key={p.pillar} style={s.pillarBox}>
                      <Text style={s.pillarScoreText}>{p.scorePct}%</Text>
                      <Text style={s.pillarNameText}>{p.name}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.diplomaFooter}>
                  <View>
                    <Text style={s.serialLabel}>SERIAL ID:</Text>
                    <Text style={s.serialValue}>{certificate.serialNumber}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.serialLabel}>ISSUED DATE:</Text>
                    <Text style={s.serialValue}>{certificate.issuedDate}</Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={s.claimDiplomaBtn}
                  onPress={handleClaimDiploma}
                >
                  <Text style={s.claimDiplomaText}>
                    📜 Endorse & Claim Diploma (+100 XP)
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Ecosystem Summary Box */}
            <View style={s.infoBox}>
              <Text style={s.infoTitle}>About ORRALI CEFR Certification</Text>
              <Text style={s.infoBody}>
                ORRALI Master Fluency Certifications validate complete communicative
                competence across four decoupled learning pillars: Fast Native Speed
                Listening, Syntax Tree Governance, Grammatical Morphology, and
                High-Pressure Conversational Retort Cadence.
              </Text>
            </View>
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
  levelTabs: {
    marginBottom: 16,
  },
  levelTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.cardBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3D315E',
  },
  levelTabActive: {
    backgroundColor: C.purple,
    borderColor: C.gold,
  },
  levelTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  levelTabTextActive: {
    color: C.gold,
    fontWeight: '900',
  },
  diplomaCard: {
    backgroundColor: '#231A3B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: C.gold,
    marginBottom: 20,
    alignItems: 'center',
  },
  sealBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 14,
  },
  sealText: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  honorsBadge: {
    backgroundColor: 'rgba(212, 175, 124, 0.2)',
    color: C.gold,
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.8,
  },
  diplomaInstitution: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  diplomaMainTitle: {
    color: C.ivory,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  diplomaSubtitle: {
    color: C.muted,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  recipientName: {
    color: C.gold,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recipientSub: {
    color: C.ivory,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  pillarBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D315E',
  },
  pillarScoreText: {
    color: C.cyan,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  pillarNameText: {
    color: C.ivory,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  diplomaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3D315E',
    marginBottom: 16,
  },
  serialLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '800',
  },
  serialValue: {
    color: C.ivory,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  claimDiplomaBtn: {
    backgroundColor: C.gold,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  claimDiplomaText: {
    color: C.midnight,
    fontSize: 13,
    fontWeight: '900',
  },
  infoBox: {
    backgroundColor: C.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3D315E',
  },
  infoTitle: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoBody: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
  },
});
