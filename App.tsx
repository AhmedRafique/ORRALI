import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { courses } from './src/content';
import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { review, isDue } from './src/srs';
import { recordAttemptToDb } from './src/db';
import { evaluateBadges } from './src/badges';
import { getThemeColors, toggleTheme, ThemeMode } from './src/theme';
import {
  dayKey,
  emptyProgress,
  loadLanguage,
  loadProgress,
  saveLanguage,
  saveProgress,
  touchStreak,
} from './src/store';
import { Exercise, Item, LangCode, LessonCheckpoint, Progress } from './src/types';

type Session = {
  title: string;
  items: Item[];
  lessonId?: string;
  initialIndex?: number;
  initialCorrectIds?: string[];
  initialWrongIds?: string[];
} | null;

type Tab = 'home' | 'journey' | 'profile';

const C = {
  midnight: '#1B1536',
  gold: '#D4AF7C',
  ivory: '#F8F6F1',
  muted: '#827B8D',
  line: '#EAE5EE',
  white: '#FFFFFF',
};

export default function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [code, setCode] = useState<LangCode>('fr');
  const [session, setSession] = useState<Session>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const theme = getThemeColors(themeMode);

  const toggleActiveTheme = useCallback(() => {
    setThemeMode((m) => toggleTheme(m));
  }, []);

  const [resumeTarget, setResumeTarget] = useState<{
    lesson: { id: string; title: string; items: Item[] };
    checkpoint: LessonCheckpoint;
  } | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([loadProgress(), loadLanguage()]).then(([savedProgress, savedLanguage]) => {
      if (!active) return;
      setProgress(savedProgress);
      setCode(savedLanguage);
    });
    return () => {
      active = false;
    };
  }, []);

  const course = courses.find((c) => c.code === code) ?? courses[0];

  const pickCourse = useCallback((next: LangCode) => {
    setCode(next);
    void saveLanguage(next);
  }, []);

  const updateProgress = useCallback((next: Progress) => {
    setProgress(next);
    void saveProgress(next);
  }, []);

  const saveCheckpoint = useCallback((cp: LessonCheckpoint) => {
    setProgress((prev) => {
      if (!prev) return prev;
      const next = {
        ...prev,
        checkpoints: {
          ...(prev.checkpoints ?? {}),
          [cp.lessonId]: cp,
        },
      };
      void saveProgress(next);
      return next;
    });
  }, []);

  const finish = useCallback(
    (res: { correctIds: string[]; wrongIds: string[] }) => {
      const current = progress ?? emptyProgress();
      let p = touchStreak(current);
      const cards = { ...p.cards };
      const finalCorrectIds = res.correctIds.filter((id) => !res.wrongIds.includes(id));
      const finalWrongIds = res.wrongIds.filter((id) => !res.correctIds.includes(id));
      const wrong = new Set(finalWrongIds);

      for (const id of new Set([...finalCorrectIds, ...finalWrongIds])) {
        const isCorrect = !wrong.has(id);
        cards[id] = review(cards[id], isCorrect);
        void recordAttemptToDb(id, course.code, 'lesson', isCorrect);
      }

      const earnedXp = finalCorrectIds.length * 5;
      const today = dayKey(new Date());
      const currentCourseXp = p.courseXp?.[course.code] ?? 0;

      // Clear checkpoint upon lesson completion
      const checkpoints = { ...(p.checkpoints ?? {}) };
      if (session?.lessonId) {
        delete checkpoints[session.lessonId];
      }

      p = {
        ...p,
        cards,
        checkpoints,
        xp: p.xp + earnedXp,
        courseXp: {
          ...(p.courseXp ?? {}),
          [course.code]: currentCourseXp + earnedXp,
        },
        dailyXp: (p.dailyXpDay === today ? p.dailyXp : 0) + earnedXp,
        dailyXpDay: today,
        completed: session?.lessonId ? { ...p.completed, [session.lessonId]: true } : p.completed,
      };

      const { updatedProgress } = evaluateBadges(p, courses);
      p = updatedProgress;

      setProgress(p);
      void saveProgress(p);
      setSession(null);
      setTab('home');
    },
    [course.code, progress, session],
  );

  const completeStory = useCallback(
    (storyId: string, earnedXp: number) => {
      const current = progress ?? emptyProgress();
      let p = touchStreak(current);
      const today = dayKey(new Date());
      const currentCourseXp = p.courseXp?.[course.code] ?? 0;
      p = {
        ...p,
        xp: p.xp + earnedXp,
        courseXp: {
          ...(p.courseXp ?? {}),
          [course.code]: currentCourseXp + earnedXp,
        },
        dailyXp: (p.dailyXpDay === today ? p.dailyXp : 0) + earnedXp,
        dailyXpDay: today,
        completedStories: {
          ...(p.completedStories ?? {}),
          [storyId]: true,
        },
      };
      const { updatedProgress } = evaluateBadges(p, courses);
      updateProgress(updatedProgress);
    },
    [course.code, progress, updateProgress],
  );

  const startRemedialWorkout = useCallback((exercises: Exercise[]) => {
    const items = exercises.map((e) => e.item);
    const unique = Array.from(new Map(items.map((i) => [i.id, i])).values());
    setSession({
      title: 'Mistake Clinic Workout',
      items: unique,
    });
  }, []);

  const completeRoleplay = useCallback(
    (earnedXp: number) => {
      const current = progress ?? emptyProgress();
      let p = touchStreak(current);
      const today = dayKey(new Date());
      const currentCourseXp = p.courseXp?.[course.code] ?? 0;
      p = {
        ...p,
        xp: p.xp + earnedXp,
        courseXp: {
          ...(p.courseXp ?? {}),
          [course.code]: currentCourseXp + earnedXp,
        },
        dailyXp: (p.dailyXpDay === today ? p.dailyXp : 0) + earnedXp,
        dailyXpDay: today,
      };
      const { updatedProgress } = evaluateBadges(p, courses);
      updateProgress(updatedProgress);
    },
    [course.code, progress, updateProgress],
  );

  const completeSpeedRecall = useCallback(
    (earnedXp: number) => {
      const current = progress ?? emptyProgress();
      let p = touchStreak(current);
      const today = dayKey(new Date());
      const currentCourseXp = p.courseXp?.[course.code] ?? 0;
      p = {
        ...p,
        xp: p.xp + earnedXp,
        courseXp: {
          ...(p.courseXp ?? {}),
          [course.code]: currentCourseXp + earnedXp,
        },
        dailyXp: (p.dailyXpDay === today ? p.dailyXp : 0) + earnedXp,
        dailyXpDay: today,
      };
      const { updatedProgress } = evaluateBadges(p, courses);
      updateProgress(updatedProgress);
    },
    [course.code, progress, updateProgress],
  );

  if (!progress) {
    return (
      <SafeAreaView style={s.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator color={C.midnight} size="large" />
        <Text style={s.loadingText}>Preparing your ORRALI world…</Text>
      </SafeAreaView>
    );
  }

  const startLesson = (id: string) => {
    const lesson = course.lessons.find((item) => item.id === id);
    if (!lesson) return;

    // Check if there is an in-progress checkpoint for this lesson
    const cp = progress?.checkpoints?.[id];
    if (cp && cp.exerciseIndex > 0 && cp.exerciseIndex < cp.totalExercises) {
      setResumeTarget({ lesson, checkpoint: cp });
      return;
    }

    setSession({ title: lesson.title, items: lesson.items, lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.ivory }]}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      {session ? (
        <LessonScreen
          course={course}
          title={session.title}
          items={session.items}
          lessonId={session.lessonId}
          isReview={!session.lessonId}
          initialIndex={session.initialIndex}
          initialCorrectIds={session.initialCorrectIds}
          initialWrongIds={session.initialWrongIds}
          onFinish={finish}
          onSaveCheckpoint={saveCheckpoint}
          onExit={() => setSession(null)}
        />
      ) : (
        <>
          <View style={s.content}>
            {tab === 'home' && (
              <HomeScreen
                courses={courses}
                course={course}
                progress={progress}
                onPickCourse={pickCourse}
                onStartLesson={startLesson}
                onSetDailyGoal={(goal) => updateProgress({ ...progress, dailyGoal: goal })}
                onCompleteStory={completeStory}
                onStartRemedialWorkout={startRemedialWorkout}
                onCompleteRoleplay={completeRoleplay}
                onCompleteSpeedRecall={completeSpeedRecall}
                onStartReview={() => {
                  const due = course.lessons
                    .flatMap((lesson) => lesson.items)
                    .filter((item) => isDue(progress.cards[item.id]))
                    .slice(0, 8);
                  if (due.length) setSession({ title: 'Practice', items: due });
                }}
              />
            )}
            {tab === 'journey' && <ProgressScreen courses={courses} progress={progress} />}
            {tab === 'profile' && (
              <ProfileScreen
                courses={courses}
                code={code}
                progress={progress}
                themeMode={themeMode}
                onPickCourse={pickCourse}
                onSetDailyGoal={(goal) => updateProgress({ ...progress, dailyGoal: goal })}
                onToggleTheme={toggleActiveTheme}
              />
            )}
          </View>
          <View style={s.tabBar}>
            <TabButton label="Home" symbol="⌂" active={tab === 'home'} onPress={() => setTab('home')} />
            <TabButton label="Journey" symbol="✧" active={tab === 'journey'} onPress={() => setTab('journey')} />
            <TabButton label="You" symbol="◉" active={tab === 'profile'} onPress={() => setTab('profile')} />
          </View>
        </>
      )}

      {resumeTarget && (
        <Modal
          transparent
          animationType="fade"
          visible={!!resumeTarget}
          onRequestClose={() => setResumeTarget(null)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalBadge}>
                <Text style={s.modalBadgeText}>SAVED PROGRESS</Text>
              </View>
              <Text style={s.modalTitle}>Continue {resumeTarget.lesson.title}?</Text>
              <Text style={s.modalDesc}>
                You stopped at step {resumeTarget.checkpoint.exerciseIndex + 1} of{' '}
                {resumeTarget.checkpoint.totalExercises}. Would you like to resume or start fresh?
              </Text>
              <View style={s.modalActions}>
                <Pressable
                  style={s.modalResumeBtn}
                  onPress={() => {
                    const { lesson, checkpoint } = resumeTarget;
                    setResumeTarget(null);
                    setSession({
                      title: lesson.title,
                      items: lesson.items,
                      lessonId: lesson.id,
                      initialIndex: checkpoint.exerciseIndex,
                      initialCorrectIds: checkpoint.correctIds,
                      initialWrongIds: checkpoint.wrongIds,
                    });
                  }}
                >
                  <Text style={s.modalResumeText}>
                    Continue from Step {resumeTarget.checkpoint.exerciseIndex + 1}
                  </Text>
                </Pressable>
                <Pressable
                  style={s.modalRestartBtn}
                  onPress={() => {
                    const { lesson } = resumeTarget;
                    if (progress) {
                      const cps = { ...(progress.checkpoints ?? {}) };
                      delete cps[lesson.id];
                      updateProgress({ ...progress, checkpoints: cps });
                    }
                    setResumeTarget(null);
                    setSession({
                      title: lesson.title,
                      items: lesson.items,
                      lessonId: lesson.id,
                      initialIndex: 0,
                      initialCorrectIds: [],
                      initialWrongIds: [],
                    });
                  }}
                >
                  <Text style={s.modalRestartText}>Start from Beginning</Text>
                </Pressable>
                <Pressable style={s.modalCancelBtn} onPress={() => setResumeTarget(null)}>
                  <Text style={s.modalCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  symbol,
  active,
  onPress,
}: {
  label: string;
  symbol: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={s.tabButton}
    >
      <Text style={[s.tabSymbol, active && s.tabActive]}>{symbol}</Text>
      <Text style={[s.tabLabel, active && s.tabActive]}>{label}</Text>
      {active && <View style={s.tabIndicator} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { flex: 1 },
  loading: { flex: 1, backgroundColor: C.ivory, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.muted, fontSize: 12, marginTop: 14 },
  tabBar: {
    height: 66,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabButton: { flex: 1, height: 60, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabSymbol: { color: '#A49CAA', fontSize: 21, lineHeight: 25 },
  tabLabel: { color: '#A49CAA', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  tabActive: { color: C.midnight },
  tabIndicator: { position: 'absolute', bottom: 0, width: 18, height: 3, borderRadius: 3, backgroundColor: C.gold },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 21, 54, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: C.midnight,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  modalBadge: {
    backgroundColor: '#EEE9F6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 14,
  },
  modalBadgeText: {
    color: C.midnight,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  modalTitle: {
    color: C.midnight,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: { width: '100%', gap: 10 },
  modalResumeBtn: {
    backgroundColor: C.midnight,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalResumeText: { color: C.white, fontWeight: '800', fontSize: 14 },
  modalRestartBtn: {
    backgroundColor: '#F3EFF7',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalRestartText: { color: C.midnight, fontWeight: '700', fontSize: 13 },
  modalCancelBtn: { paddingVertical: 10, alignItems: 'center' },
  modalCancelText: { color: C.muted, fontSize: 12, fontWeight: '600' },
});
