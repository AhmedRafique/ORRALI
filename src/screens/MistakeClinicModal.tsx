import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildRemedialWorkout, diagnoseMistakes } from '../companion/clinic';
import { getItemAttemptStatsFromDb, ItemAttemptStats } from '../db';
import { Course, Exercise, MistakeRecord, Progress } from '../types';

const C = {
  midnight: '#1B1536',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  lilac: '#EEE9F6',
  green: '#638B70',
  red: '#B75D61',
};

interface Props {
  visible: boolean;
  course: Course;
  progress: Progress;
  onStartRemedialWorkout: (exercises: Exercise[]) => void;
  onClose: () => void;
}

export default function MistakeClinicModal({
  visible,
  course,
  progress,
  onStartRemedialWorkout,
  onClose,
}: Props) {
  const allItems = course.lessons.flatMap((l) => l.items);
  const [dbStats, setDbStats] = useState<Record<string, ItemAttemptStats>>({});

  useEffect(() => {
    if (visible) {
      void getItemAttemptStatsFromDb(course.code).then((stats) => {
        setDbStats(stats);
      });
    }
  }, [visible, course.code]);

  // Generate mistake records preferring real SQLite historical attempts when available
  const records: MistakeRecord[] = allItems
    .map((item) => {
      const card = progress.cards[item.id];
      const stats = dbStats[item.id];

      const failCount = stats ? stats.failCount : (card?.lapses ?? 0);
      const passCount = stats
        ? stats.passCount
        : Math.max(
            card?.reps ?? 0,
            card && card.interval >= 21 ? 5 : card && card.interval >= 6 ? 3 : card && card.interval >= 1 ? 1 : 0
          );
      const lastFailedAt = stats?.lastFailedAt || (card?.lastReviewed ?? 0);

      return {
        itemId: item.id,
        courseCode: course.code,
        failCount,
        passCount,
        lastFailedAt,
      };
    })
    .filter((r) => r.failCount > 0);

  const diagnoses = diagnoseMistakes(records, allItems);

  const handleLaunch = () => {
    const workout = buildRemedialWorkout(diagnoses, course);
    if (workout.length > 0) {
      onStartRemedialWorkout(workout);
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.header}>
            <View style={s.badge}>
              <Text style={s.badgeText}>✦ SMART MISTAKE CLINIC</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <Text style={s.title}>Turn stumbles into mastery</Text>
          <Text style={s.subtitle}>
            {diagnoses.length > 0
              ? `Our AI analyzed your recent practice and identified ${diagnoses.length} phrase${
                  diagnoses.length > 1 ? 's' : ''
                } that need a quick tune-up.`
              : 'Clean slate! You have no recorded mistakes in this course.'}
          </Text>

          {diagnoses.length > 0 ? (
            <ScrollView style={s.diagnosesScroll} showsVerticalScrollIndicator={false}>
              {diagnoses.map((d, idx) => (
                <View key={idx} style={s.diagnosisCard}>
                  <View style={s.diagTop}>
                    <Text style={s.diagTarget}>{d.item.target}</Text>
                    <View style={s.errorPill}>
                      <Text style={s.errorPillText}>{d.failCount} lapse{d.failCount > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                  <Text style={s.diagEn}>{d.item.en}</Text>

                  <View style={s.accuracyRow}>
                    <Text style={s.accuracyText}>Accuracy: {d.accuracyPercent}%</Text>
                    <View style={s.accuracyTrack}>
                      <View style={[s.accuracyFill, { width: `${d.accuracyPercent}%` }]} />
                    </View>
                  </View>

                  <View style={s.tipBox}>
                    <Text style={s.tipTitle}>COACHING TIP</Text>
                    <Text style={s.tipText}>{d.suggestedTip}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>🎉</Text>
              <Text style={s.emptyTitle}>Flawless Progress!</Text>
              <Text style={s.emptyDesc}>
                Every phrase practiced has been retained. Keep completing chapters to discover new material.
              </Text>
            </View>
          )}

          <View style={s.footer}>
            {diagnoses.length > 0 ? (
              <Pressable style={s.startBtn} onPress={handleLaunch}>
                <Text style={s.startBtnText}>Start 5-min Remedial Workout</Text>
              </Pressable>
            ) : (
              <Pressable style={s.startBtn} onPress={onClose}>
                <Text style={s.startBtnText}>Continue Exploring</Text>
              </Pressable>
            )}
          </View>
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
    padding: 22,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 22,
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
    backgroundColor: '#FBECEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    color: '#9C3A42',
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
  title: { color: C.midnight, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: C.muted, fontSize: 11, lineHeight: 16, marginBottom: 14 },
  diagnosesScroll: { maxHeight: 320, marginBottom: 14 },
  diagnosisCard: {
    backgroundColor: '#FAF8FB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECE6F2',
  },
  diagTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diagTarget: { color: C.midnight, fontSize: 15, fontWeight: '800' },
  errorPill: { backgroundColor: '#FAD7D9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  errorPillText: { color: '#882228', fontSize: 10, fontWeight: '900' },
  diagEn: { color: C.muted, fontSize: 12, marginTop: 2, marginBottom: 10 },
  accuracyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  accuracyText: { color: C.ink, fontSize: 10, fontWeight: '700' },
  accuracyTrack: { flex: 1, height: 6, backgroundColor: '#E2DCE8', borderRadius: 4, overflow: 'hidden' },
  accuracyFill: { height: 6, backgroundColor: C.gold, borderRadius: 4 },
  tipBox: {
    backgroundColor: C.white,
    borderLeftWidth: 3,
    borderLeftColor: C.gold,
    padding: 8,
    borderRadius: 6,
  },
  tipTitle: { color: '#8A692E', fontSize: 8, fontWeight: '900', letterSpacing: 0.8, marginBottom: 2 },
  tipText: { color: C.ink, fontSize: 11, lineHeight: 15 },
  emptyBox: { alignItems: 'center', paddingVertical: 36 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { color: C.midnight, fontSize: 17, fontWeight: '800' },
  emptyDesc: { color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },
  footer: { marginTop: 4 },
  startBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  startBtnText: { color: C.white, fontWeight: '800', fontSize: 13 },
});
