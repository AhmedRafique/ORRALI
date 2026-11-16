import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getBadgesWithProgress } from '../badges';
import { Course, LangCode, Progress } from '../types';

const C = {
  midnight: '#1B1536',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  ink: '#211B32',
  muted: '#827B8D',
  white: '#FFFFFF',
  line: '#EAE5EE',
  lilac: '#EEE9F6',
  sage: '#A7C4B0',
};

type Props = {
  courses: Course[];
  code: LangCode;
  progress: Progress;
  onPickCourse: (code: LangCode) => void;
  onSetDailyGoal: (goal: number) => void;
};

export default function ProfileScreen({ courses, code, progress, onPickCourse, onSetDailyGoal }: Props) {
  const badges = getBadgesWithProgress(progress, courses);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const shields = progress.streakShields ?? 1;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Text style={s.kicker}>YOUR SPACE</Text>
      <Text style={s.title}>Made for your journey.</Text>
      <Text style={s.subtitle}>Shape your learning rhythm. ORRALI will grow with you.</Text>

      <View style={s.profileCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>✦</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profileName}>Hello, Explorer</Text>
          <Text style={s.profileMeta}>Curious mind · ORRALI learner</Text>
        </View>
        <Text style={s.level}>A1</Text>
      </View>

      {/* Streak Shield Status */}
      <View style={s.shieldCard}>
        <Text style={s.shieldIcon}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.shieldTitle}>Streak Protection Shield</Text>
          <Text style={s.shieldDesc}>
            {shields > 0
              ? `${shields} active shield ready to protect your streak if you miss a busy day.`
              : 'Shield depleted. Reach a 3-day or 7-day streak to recharge!'}
          </Text>
        </View>
        <View style={[s.shieldPill, shields === 0 && s.shieldPillEmpty]}>
          <Text style={s.shieldPillText}>{shields} / 2</Text>
        </View>
      </View>

      {/* Trophy Shelf Section */}
      <View style={s.sectionTop}>
        <Text style={s.sectionTitle}>Trophy Shelf</Text>
        <Text style={s.sectionCounter}>
          {unlockedCount} of {badges.length} unlocked
        </Text>
      </View>

      <View style={s.badgesGrid}>
        {badges.map((badge) => (
          <View key={badge.id} style={[s.badgeCard, badge.unlocked ? s.badgeUnlocked : s.badgeLocked]}>
            <View style={s.badgeTop}>
              <Text style={s.badgeIcon}>{badge.icon}</Text>
              <Text style={[s.badgeStatus, badge.unlocked && s.badgeStatusUnlocked]}>
                {badge.unlocked ? 'UNLOCKED ✦' : `${badge.current}/${badge.target}`}
              </Text>
            </View>
            <Text style={[s.badgeTitle, badge.unlocked && s.badgeTitleUnlocked]}>{badge.title}</Text>
            <Text style={s.badgeDesc}>{badge.description}</Text>
            {!badge.unlocked && (
              <View style={s.badgeTrack}>
                <View
                  style={[
                    s.badgeFill,
                    { width: `${Math.min(100, Math.round((badge.current / Math.max(1, badge.target)) * 100))}%` },
                  ]}
                />
              </View>
            )}
          </View>
        ))}
      </View>

      <Text style={[s.sectionTitle, { marginTop: 24 }]}>Learning preferences</Text>
      <View style={s.panel}>
        <Text style={s.label}>CURRENT LEARNING WORLD</Text>
        {courses.map((course) => (
          <Pressable
            key={course.code}
            onPress={() => onPickCourse(course.code)}
            style={[s.choice, code === course.code && s.choiceActive]}
          >
            <Text style={s.flag}>{course.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.choiceName}>{course.name}</Text>
              <Text style={s.choiceMeta}>{course.code === 'fr' ? 'French' : 'German'} · A1 foundations</Text>
            </View>
            <Text style={s.check}>{code === course.code ? '✓' : '○'}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.panel}>
        <Text style={s.label}>DAILY LEARNING GOAL</Text>
        <Text style={s.goalTitle}>{progress.dailyGoal} XP per day</Text>
        <Text style={s.goalHint}>Choose a goal that feels achievable and enjoyable.</Text>
        <View style={s.goalRow}>
          {[10, 20, 30].map((goal) => (
            <Pressable
              key={goal}
              onPress={() => onSetDailyGoal(goal)}
              style={[s.goal, progress.dailyGoal === goal && s.goalActive]}
            >
              <Text style={[s.goalText, progress.dailyGoal === goal && s.goalTextActive]}>{goal} XP</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.about}>
        <Text style={s.aboutBrand}>ORRALI</Text>
        <Text style={s.tagline}>Beyond the familiar.</Text>
        <Text style={s.aboutText}>A new world of possibilities. Discover · Connect · Grow.</Text>
        <Text style={s.version}>LEARNING WORLD & TROPHIES · 1.6.0</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { padding: 22, paddingTop: 28, paddingBottom: 36 },
  kicker: { color: C.muted, fontSize: 9, letterSpacing: 2, fontWeight: '800' },
  title: { color: C.midnight, fontSize: 27, fontWeight: '800', marginTop: 8 },
  subtitle: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 7, marginBottom: 21 },
  profileCard: {
    backgroundColor: C.midnight,
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: '#403653',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: C.gold, fontSize: 24 },
  profileName: { color: C.white, fontSize: 15, fontWeight: '800' },
  profileMeta: { color: '#C8B7D9', fontSize: 10, marginTop: 4 },
  level: { color: C.gold, fontSize: 13, fontWeight: '900' },
  shieldCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFE7',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2D9CB',
    gap: 12,
    marginBottom: 24,
  },
  shieldIcon: { fontSize: 26 },
  shieldTitle: { color: '#684F28', fontSize: 12, fontWeight: '800' },
  shieldDesc: { color: '#887455', fontSize: 10, lineHeight: 14, marginTop: 2 },
  shieldPill: {
    backgroundColor: C.gold,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  shieldPillEmpty: { backgroundColor: '#D8CFBF' },
  shieldPillText: { color: C.midnight, fontSize: 10, fontWeight: '900' },
  sectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: C.ink, fontSize: 18, fontWeight: '800' },
  sectionCounter: { color: '#8C74A2', fontSize: 11, fontWeight: '800' },
  badgesGrid: { gap: 10 },
  badgeCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  badgeUnlocked: {
    borderColor: C.gold,
    backgroundColor: '#FAF8F4',
  },
  badgeLocked: { opacity: 0.85 },
  badgeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  badgeIcon: { fontSize: 22 },
  badgeStatus: { color: C.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  badgeStatusUnlocked: { color: '#8A6A2C', fontWeight: '900' },
  badgeTitle: { color: C.muted, fontSize: 14, fontWeight: '800' },
  badgeTitleUnlocked: { color: C.midnight },
  badgeDesc: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  badgeTrack: {
    height: 4,
    backgroundColor: '#ECE7F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
  },
  badgeFill: { height: 4, backgroundColor: C.gold, borderRadius: 4 },
  panel: { backgroundColor: C.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 13 },
  label: { color: C.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: '900', marginBottom: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, borderRadius: 13, borderWidth: 1, borderColor: C.line, marginBottom: 8 },
  choiceActive: { backgroundColor: '#F0EBF7', borderColor: '#CFC0E0' },
  flag: { fontSize: 25 },
  choiceName: { color: C.ink, fontSize: 13, fontWeight: '800' },
  choiceMeta: { color: C.muted, fontSize: 10, marginTop: 3 },
  check: { color: '#8A719F', fontSize: 18, fontWeight: '800' },
  goalTitle: { color: C.ink, fontSize: 19, fontWeight: '800' },
  goalHint: { color: C.muted, fontSize: 11, marginTop: 5 },
  goalRow: { flexDirection: 'row', gap: 8, marginTop: 15 },
  goal: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  goalActive: { backgroundColor: C.midnight, borderColor: C.midnight },
  goalText: { color: C.ink, fontSize: 11, fontWeight: '800' },
  goalTextActive: { color: C.white },
  about: { alignItems: 'center', padding: 22, marginTop: 8 },
  aboutBrand: { color: C.midnight, fontSize: 22, letterSpacing: 6, fontWeight: '600' },
  tagline: { color: C.muted, fontSize: 11, letterSpacing: 1, marginTop: 5 },
  aboutText: { color: C.muted, fontSize: 10, marginTop: 15 },
  version: { color: '#A59DAA', fontSize: 8, letterSpacing: 1.4, marginTop: 16 },
});
