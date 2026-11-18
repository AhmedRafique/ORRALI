import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getBadgesWithProgress } from '../badges';
import { createCloudBackupSnapshot } from '../cloudSync';
import { triggerHaptic } from '../sensory';
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
  themeMode?: 'light' | 'dark';
  onPickCourse: (code: LangCode) => void;
  onSetDailyGoal: (goal: number) => void;
  onToggleTheme?: () => void;
};

export default function ProfileScreen({
  courses,
  code,
  progress,
  themeMode = 'light',
  onPickCourse,
  onSetDailyGoal,
  onToggleTheme,
}: Props) {
  const badges = getBadgesWithProgress(progress, courses);
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const shields = progress.streakShields ?? 1;
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

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

      <View style={[s.sectionTop, { marginTop: 20 }]}>
        <Text style={s.sectionTitle}>Official CEFR Diplomas</Text>
        <Text style={s.sectionCounter}>
          {Object.keys(progress.diplomas ?? {}).filter((k) => k.startsWith(code)).length} of 4 certified
        </Text>
      </View>

      <View style={s.diplomasRow}>
        {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => {
          const key = `${code}-${lvl}`;
          const earnedTimestamp = progress.diplomas?.[key];
          const isCertified = !!earnedTimestamp;

          return (
            <View key={lvl} style={[s.diplomaCard, isCertified && s.diplomaCardCertified]}>
              <Text style={s.diplomaCardIcon}>{isCertified ? '🏅' : '🔒'}</Text>
              <Text style={[s.diplomaCardLevel, isCertified && s.diplomaCardLevelCertified]}>
                CEFR {lvl}
              </Text>
              <Text style={s.diplomaCardStatus}>
                {isCertified
                  ? `Certified`
                  : '80% on Exam'}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[s.sectionTitle, { marginTop: 20 }]}>Learning preferences</Text>
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
              <Text style={s.choiceMeta}>
                {course.code === 'fr' ? 'French' : course.code === 'es' ? 'Spanish' : 'German'} · 20 Chapters (A1–B2)
              </Text>
            </View>
            <Text style={s.check}>{code === course.code ? '✓' : '○'}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.panel}>
        <Text style={s.label}>APPEARANCE & THEME</Text>
        <Pressable
          style={[s.choice, themeMode === 'dark' && s.choiceActive]}
          onPress={() => {
            void triggerHaptic('selection');
            onToggleTheme?.();
          }}
        >
          <Text style={s.flag}>{themeMode === 'dark' ? '🌙' : '☀️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.choiceName}>Midnight Dark Mode (OLED)</Text>
            <Text style={s.choiceMeta}>
              {themeMode === 'dark' ? 'Active · Velvet dark night palette' : 'Off · Warm ivory day palette'}
            </Text>
          </View>
          <View style={[s.themePill, themeMode === 'dark' && s.themePillActive]}>
            <Text style={[s.themePillText, themeMode === 'dark' && s.themePillTextActive]}>
              {themeMode === 'dark' ? 'ON' : 'OFF'}
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={s.panel}>
        <View style={s.cloudHeader}>
          <Text style={s.label}>LOCAL BACKUP & ANDROID RESTORE</Text>
          <View style={s.cloudActivePill}>
            <Text style={s.cloudActiveText}>● BACKUP READY</Text>
          </View>
        </View>

        <Text style={s.cloudDesc}>
          Your XP, streaks, SM-2 memory cards, and diplomas are saved locally in SQLite with Android Google Drive auto-backup enabled. Create an integrity-verified checkpoint anytime.
        </Text>

        <Pressable
          style={s.backupBtn}
          onPress={() => {
            void triggerHaptic('success');
            const snap = createCloudBackupSnapshot(progress);
            setBackupStatus(
              `Checkpoint verified at ${new Date(snap.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })} (${snap.checksum})`
            );
          }}
        >
          <Text style={s.backupBtnText}>✦ Create Verified Backup Checkpoint</Text>
        </Pressable>

        {backupStatus && (
          <Text style={s.backupStatusText}>✓ {backupStatus}</Text>
        )}
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
        <Text style={s.version}>ORRALI CAFÉ LIBRARY EDITION · 6.1.0</Text></View>
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
  diplomasRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  diplomaCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  diplomaCardCertified: { backgroundColor: '#FCFAF5', borderColor: C.gold },
  diplomaCardIcon: { fontSize: 20, marginBottom: 4 },
  diplomaCardLevel: { color: C.muted, fontSize: 11, fontWeight: '900' },
  diplomaCardLevelCertified: { color: '#8A5D1E' },
  diplomaCardStatus: { color: C.muted, fontSize: 8, marginTop: 2, textAlign: 'center' },
  panel: { backgroundColor: C.white, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 13 },
  cloudHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cloudActivePill: { backgroundColor: '#E4F2E8', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cloudActiveText: { color: '#3A704B', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  cloudDesc: { color: C.muted, fontSize: 11, lineHeight: 16, marginBottom: 14 },
  backupBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 6,
  },
  backupBtnText: { color: C.white, fontSize: 11, fontWeight: '800' },
  backupStatusText: { color: '#3A704B', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  label: { color: C.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: '900', marginBottom: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, borderRadius: 13, borderWidth: 1, borderColor: C.line, marginBottom: 8 },
  choiceActive: { backgroundColor: '#F0EBF7', borderColor: '#CFC0E0' },
  themePill: {
    backgroundColor: '#EAE5EE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  themePillActive: { backgroundColor: C.midnight },
  themePillText: { color: C.muted, fontSize: 10, fontWeight: '800' },
  themePillTextActive: { color: C.gold },
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
