import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { courses } from './src/content';
import HomeScreen from './src/screens/HomeScreen';
import LessonScreen from './src/screens/LessonScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { review, isDue } from './src/srs';
import { dayKey, emptyProgress, loadLanguage, loadProgress, saveLanguage, saveProgress, touchStreak } from './src/store';
import { Item, LangCode, Progress } from './src/types';

type Session = { title: string; items: Item[]; lessonId?: string } | null;
type Tab = 'home' | 'journey' | 'profile';
const C = { midnight: '#1B1536', gold: '#D4AF7C', ivory: '#F8F6F1', muted: '#827B8D', line: '#EAE5EE', white: '#FFFFFF' };

export default function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [code, setCode] = useState<LangCode>('fr');
  const [session, setSession] = useState<Session>(null);
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    let active = true;
    Promise.all([loadProgress(), loadLanguage()]).then(([savedProgress, savedLanguage]) => {
      if (!active) return;
      setProgress(savedProgress);
      setCode(savedLanguage);
    });
    return () => { active = false; };
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

  const finish = useCallback(
    (res: { correctIds: string[]; wrongIds: string[] }) => {
      setProgress((prev) => {
        let p = touchStreak(prev ?? emptyProgress());
        const cards = { ...p.cards };
        const finalCorrectIds = res.correctIds.filter((id) => !res.wrongIds.includes(id));
        const finalWrongIds = res.wrongIds.filter((id) => !res.correctIds.includes(id));
        const wrong = new Set(finalWrongIds);
        for (const id of new Set([...finalCorrectIds, ...finalWrongIds])) {
          cards[id] = review(cards[id], !wrong.has(id));
        }
        const earnedXp = finalCorrectIds.length * 5;
        const today = dayKey(new Date());
        p = { ...p, cards, xp: p.xp + earnedXp, dailyXp: (p.dailyXpDay === today ? p.dailyXp : 0) + earnedXp, dailyXpDay: today };
        if (session?.lessonId) p = { ...p, completed: { ...p.completed, [session.lessonId]: true } };
        void saveProgress(p);
        return p;
      });
      setSession(null);
      setTab('home');
    },
    [session],
  );

  if (!progress) {
    return <SafeAreaView style={s.loading}><StatusBar style="dark" /><ActivityIndicator color={C.midnight} size="large" /><Text style={s.loadingText}>Preparing your ORRALI world…</Text></SafeAreaView>;
  }

  const startLesson = (id: string) => {
    const lesson = course.lessons.find((item) => item.id === id);
    if (!lesson) return;
    setSession({ title: lesson.title, items: lesson.items, lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      {session ? (
        <LessonScreen course={course} title={session.title} items={session.items} onFinish={finish} onExit={() => setSession(null)} />
      ) : (
        <>
          <View style={s.content}>
            {tab === 'home' && <HomeScreen courses={courses} course={course} progress={progress} onPickCourse={pickCourse} onStartLesson={startLesson} onSetDailyGoal={(goal) => updateProgress({ ...progress, dailyGoal: goal })} onStartReview={() => {
              const due = course.lessons.flatMap((lesson) => lesson.items).filter((item) => isDue(progress.cards[item.id])).slice(0, 8);
              if (due.length) setSession({ title: 'Practice', items: due });
            }} />}
            {tab === 'journey' && <ProgressScreen courses={courses} progress={progress} />}
            {tab === 'profile' && <ProfileScreen courses={courses} code={code} progress={progress} onPickCourse={pickCourse} onSetDailyGoal={(goal) => updateProgress({ ...progress, dailyGoal: goal })} />}
          </View>
          <View style={s.tabBar}>
            <TabButton label="Home" symbol="⌂" active={tab === 'home'} onPress={() => setTab('home')} />
            <TabButton label="Journey" symbol="✧" active={tab === 'journey'} onPress={() => setTab('journey')} />
            <TabButton label="You" symbol="◉" active={tab === 'profile'} onPress={() => setTab('profile')} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function TabButton({ label, symbol, active, onPress }: { label: string; symbol: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={s.tabButton}>
    <Text style={[s.tabSymbol, active && s.tabActive]}>{symbol}</Text>
    <Text style={[s.tabLabel, active && s.tabActive]}>{label}</Text>
    {active && <View style={s.tabIndicator} />}
  </Pressable>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { flex: 1 },
  loading: { flex: 1, backgroundColor: C.ivory, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.muted, fontSize: 12, marginTop: 14 },
  tabBar: { height: 66, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 16 },
  tabButton: { flex: 1, height: 60, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabSymbol: { color: '#A49CAA', fontSize: 21, lineHeight: 25 },
  tabLabel: { color: '#A49CAA', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  tabActive: { color: C.midnight },
  tabIndicator: { position: 'absolute', bottom: 0, width: 18, height: 3, borderRadius: 3, backgroundColor: C.gold },
});
