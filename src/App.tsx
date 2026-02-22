import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './components/Dashboard';
import { QuestBoard } from './components/QuestBoard';
import { NotesVault } from './components/NotesVault';
import { Achievements } from './components/Achievements';
import { Challenges } from './components/Challenges';
import { t } from './i18n';
import type { Page, Quest, Note, UserStats } from './store';
import { defaultQuests, defaultNotes, defaultAchievements } from './store';

function Particles() {
  const { isDark, isHinglish } = useTheme();
  const colors = isHinglish
    ? ['#F43F5E', '#A855F7', '#6366F1', '#8B5CF6']
    : isDark
      ? ['#6366F1', '#818CF8', '#A78BFA', '#4F46E5']
      : ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: colors[Math.floor(Math.random() * colors.length)],
            animationDuration: `${Math.random() * 20 + 15}s`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: isDark ? 0.15 : 0.1,
          }}
        />
      ))}
    </div>
  );
}

function SubtlePattern() {
  const { isDark, isHinglish } = useTheme();
  const stroke = isHinglish ? '#A855F7' : isDark ? '#6366F1' : '#6366F1';
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 animate-mandala" style={{ opacity: isDark ? 0.015 : 0.02 }}>
      <svg width="800" height="800" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke={stroke} strokeWidth="0.1" />
        <circle cx="50" cy="50" r="35" fill="none" stroke={stroke} strokeWidth="0.1" />
        <circle cx="50" cy="50" r="22" fill="none" stroke={stroke} strokeWidth="0.1" />
        {[...Array(12)].map((_, i) => (
          <line key={i} x1="50" y1="2" x2="50" y2="98" stroke={stroke} strokeWidth="0.05" transform={`rotate(${i * 30} 50 50)`} />
        ))}
      </svg>
    </div>
  );
}

function XPPopup({ xp, onDone }: { xp: number; onDone: () => void }) {
  const { isDark, isHinglish, lang } = useTheme();
  useEffect(() => {
    const timer = setTimeout(onDone, 2000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed top-20 right-8 z-50 animate-slide-up">
      <div className={`px-5 py-2.5 rounded-xl flex items-center gap-2.5 shadow-xl ${
        isHinglish
          ? 'bg-gradient-to-r from-rose-500 to-violet-500 text-white'
          : isDark
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
            : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'
      }`}>
        <span className="text-xl animate-coin-bounce inline-block">{isHinglish ? '🎉' : '🪔'}</span>
        <div>
          <p className="font-bold text-sm">+{xp} {t('xpGained', lang)}</p>
          <p className="text-[10px] text-white/50">{t('karmaQuestComplete', lang)}</p>
        </div>
        <span className="text-lg">{isHinglish ? '🤩' : '🙏'}</span>
      </div>
    </div>
  );
}

function AppContent() {
  const { isDark, isHinglish } = useTheme();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quests, setQuests] = useState<Quest[]>(defaultQuests);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [achievements] = useState(defaultAchievements);
  const [xpPopup, setXpPopup] = useState<number | null>(null);

  const [stats, setStats] = useState<UserStats>({
    level: 5, xp: 320, xpToNext: 500, coins: 1250, streak: 12,
    questsCompleted: 47, totalQuests: 63, avatarEmoji: '🧘', username: 'Yoddha',
  });

  const handleCompleteQuest = useCallback((id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status === 'completed') return;
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: 'completed' as const } : q));
    setStats(prev => {
      let newXp = prev.xp + quest.xpReward;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNext;
      if (newXp >= newXpToNext) {
        newXp = newXp - newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.2);
      }
      return { ...prev, xp: newXp, level: newLevel, xpToNext: newXpToNext, coins: prev.coins + quest.xpReward * 2, questsCompleted: prev.questsCompleted + 1 };
    });
    setXpPopup(quest.xpReward);
  }, [quests]);

  const handleAddQuest = useCallback((quest: Omit<Quest, 'id' | 'status'>) => {
    setQuests(prev => [{ ...quest, id: Date.now().toString(), status: 'active' }, ...prev]);
  }, []);

  const handleAddNote = useCallback((note: Omit<Note, 'id' | 'createdAt'>) => {
    setNotes(prev => [{ ...note, id: Date.now().toString(), createdAt: 'Just now' }, ...prev]);
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard stats={stats} quests={quests} notes={notes} achievements={achievements} onNavigate={setCurrentPage} />;
      case 'quests': return <QuestBoard quests={quests} onComplete={handleCompleteQuest} onAdd={handleAddQuest} />;
      case 'notes': return <NotesVault notes={notes} onAdd={handleAddNote} onDelete={handleDeleteNote} />;
      case 'achievements': return <Achievements achievements={achievements} stats={stats} />;
      case 'challenges': return <Challenges stats={stats} />;
      default: return <Dashboard stats={stats} quests={quests} notes={notes} achievements={achievements} onNavigate={setCurrentPage} />;
    }
  };

  const bgGradient = isHinglish
    ? 'bg-gradient-to-br from-[#FDF2F8] via-[#FAF5FF] to-[#F0F4FF]'
    : isDark
      ? 'bg-gradient-to-br from-[#0D0D1A] via-[#111122] to-[#0D0D1A]'
      : 'bg-gradient-to-br from-[#F7F8FC] via-[#F0F2F8] to-[#F5F3FF]';

  return (
    <div className={`min-h-screen relative transition-colors duration-700 ${bgGradient}`}>
      <SubtlePattern />
      <Particles />
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <TopNav stats={stats} sidebarCollapsed={sidebarCollapsed} />
      <main className={`relative z-10 transition-all duration-300 pt-20 pb-8 px-6 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {renderPage()}
      </main>
      {xpPopup !== null && <XPPopup xp={xpPopup} onDone={() => setXpPopup(null)} />}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
