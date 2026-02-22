import { Plus, Check, Clock, Star, Filter, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import type { Quest, Difficulty } from '../store';
import { difficultyConfig as defaultDiffConfig } from '../store';

interface QuestBoardProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onAdd: (quest: Omit<Quest, 'id' | 'status'>) => void;
}

export function QuestBoard({ quests, onComplete, onAdd }: QuestBoardProps) {
  const { isDark, isHinglish, lang } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('easy');
  const [newCategory, setNewCategory] = useState('Karma');
  const [completedAnimation, setCompletedAnimation] = useState<string | null>(null);

  const diffLabels: Record<Difficulty, string> = {
    easy: t('diffSahaj', lang), medium: t('diffMadhyam', lang),
    hard: t('diffKathin', lang), legendary: t('diffDivya', lang),
  };

  const card = isHinglish
    ? 'bg-white/70 backdrop-blur-xl border border-rose-200/20 shadow-sm'
    : isDark
      ? 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-sm'
      : 'bg-white/80 backdrop-blur-xl border border-slate-200/40 shadow-sm';
  const tp = isHinglish ? 'text-slate-800' : isDark ? 'text-slate-200' : 'text-slate-800';
  const ts = isHinglish ? 'text-slate-500' : isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isHinglish
    ? 'bg-white/60 border-rose-200/30 text-slate-800 placeholder:text-slate-400 focus:ring-rose-300/30'
    : isDark
      ? 'bg-white/[0.03] border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:ring-indigo-500/20'
      : 'bg-slate-50/80 border-slate-200/50 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-300/30';

  const activeQuests = quests.filter(q => q.status === 'active');
  const completedQuests = quests.filter(q => q.status === 'completed');
  const filteredQuests = filter === 'all' ? quests : filter === 'active' ? activeQuests : completedQuests;

  const handleComplete = (id: string) => {
    setCompletedAnimation(id);
    setTimeout(() => { onComplete(id); setCompletedAnimation(null); }, 500);
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd({ title: newTitle, difficulty: newDifficulty, xpReward: defaultDiffConfig[newDifficulty].xp, dueDate: 'Today', category: newCategory });
    setNewTitle(''); setShowForm(false);
  };

  const btnGradient = isHinglish
    ? 'bg-gradient-to-r from-rose-500 to-violet-500'
    : 'bg-gradient-to-r from-indigo-500 to-violet-500';

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-xl font-bold ${tp} flex items-center gap-2.5`}>
            <span className="text-2xl">{isHinglish ? '💪' : '🏹'}</span> {t('questBoardTitle', lang)}
          </h2>
          <p className={`text-[13px] mt-0.5 ${ts}`}>{t('questBoardSub', lang)}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-0.5 p-0.5 rounded-lg border ${
            isDark ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-slate-50 border-slate-200/40'
          }`}>
            <Filter size={13} className={`ml-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            {(['all', 'active', 'completed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  filter === f
                    ? isDark ? 'bg-white/[0.06] text-slate-200 shadow-sm' : 'bg-white text-slate-800 shadow-sm'
                    : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f === 'all' ? t('all', lang) : f === 'active' ? t('active', lang) : t('completed', lang)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-medium text-[13px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${btnGradient}`}
          >
            <Plus size={16} /> {t('newQuest', lang)}
          </button>
        </div>
      </div>

      {/* Add Quest Form */}
      {showForm && (
        <div className={`${card} rounded-2xl p-5 animate-slide-up border ${
          isHinglish ? 'border-rose-300/30' : isDark ? 'border-indigo-500/15' : 'border-indigo-200/40'
        }`}>
          <h3 className={`text-sm font-semibold ${tp} mb-3 flex items-center gap-2`}>
            <Sparkles size={15} className={isHinglish ? 'text-rose-400' : 'text-indigo-400'} /> {t('createNewQuest', lang)}
          </h3>
          <div className="space-y-3">
            <input
              type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
              placeholder={t('questTitlePlaceholder', lang)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-[13px] focus:outline-none focus:ring-2 ${inputCls}`}
              autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex gap-3 flex-wrap">
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('difficulty', lang)}</label>
                <div className="flex gap-1">
                  {(Object.keys(defaultDiffConfig) as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setNewDifficulty(d)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        newDifficulty === d
                          ? `${isDark ? defaultDiffConfig[d].darkBg : defaultDiffConfig[d].bg} ${defaultDiffConfig[d].color} ring-1 ring-current/20`
                          : isDark ? 'bg-white/[0.03] text-slate-500 hover:bg-white/[0.06]' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {diffLabels[d]} (+{defaultDiffConfig[d].xp})
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('category', lang)}</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] border focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  {['Karma', 'Vidya', 'Yoga', 'Sadhana', 'Creative', 'Griha'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className={`px-3.5 py-2 text-[13px] rounded-lg transition-all ${isDark ? 'text-slate-400 hover:bg-white/[0.03]' : 'text-slate-500 hover:bg-slate-50'}`}>{t('cancel', lang)}</button>
              <button onClick={handleAdd} className={`px-5 py-2 text-white text-[13px] font-medium rounded-lg shadow-md transition-all ${btnGradient}`}>{t('createQuest', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${card} rounded-2xl p-3.5 text-center`}>
          <p className={`text-lg font-bold ${tp}`}>{activeQuests.length}</p>
          <p className={`text-[11px] ${ts}`}>{t('activeQuests', lang)}</p>
        </div>
        <div className={`${card} rounded-2xl p-3.5 text-center`}>
          <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{completedQuests.length}</p>
          <p className={`text-[11px] ${ts}`}>{t('completed', lang)}</p>
        </div>
        <div className={`${card} rounded-2xl p-3.5 text-center`}>
          <p className={`text-lg font-bold ${isHinglish ? 'text-rose-400' : isDark ? 'text-violet-400' : 'text-violet-500'}`}>{completedQuests.reduce((a, q) => a + q.xpReward, 0)}</p>
          <p className={`text-[11px] ${ts}`}>{t('punyaEarned', lang)}</p>
        </div>
      </div>

      {/* Quest Cards */}
      <div className="space-y-2.5">
        {filteredQuests.map((quest, index) => {
          const config = defaultDiffConfig[quest.difficulty];
          const isCompleting = completedAnimation === quest.id;
          return (
            <div key={quest.id}
              className={`${card} rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md quest-card-${quest.difficulty} ${
                quest.status === 'completed' ? 'opacity-50' : ''
              } ${isCompleting ? 'animate-shake scale-[0.98]' : ''}`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => quest.status === 'active' && handleComplete(quest.id)}
                  disabled={quest.status === 'completed'}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    quest.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : isDark
                        ? 'bg-white/[0.04] border border-white/[0.08] hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:scale-105'
                        : 'bg-slate-50 border border-slate-200/60 hover:border-indigo-300 hover:bg-indigo-50 hover:scale-105'
                  }`}
                >
                  {quest.status === 'completed' ? <Check size={16} /> : <span className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>✓</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-medium text-[13px] ${quest.status === 'completed' ? 'line-through text-slate-400' : tp}`}>{quest.title}</h4>
                    {quest.difficulty === 'legendary' && <span className="text-xs">👑</span>}
                  </div>
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isDark ? config.darkBg : config.bg} ${config.color}`}>
                      {diffLabels[quest.difficulty]}
                    </span>
                    <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      <Clock size={10} /> {quest.dueDate}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-white/[0.03] text-slate-500' : 'bg-slate-50 text-slate-500'}`}>{quest.category}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg shrink-0 ${
                  isDark ? 'bg-white/[0.03]' : 'bg-slate-50'
                }`}>
                  <Star size={13} className={isHinglish ? 'text-rose-400 fill-rose-300' : isDark ? 'text-indigo-400 fill-indigo-400' : 'text-indigo-500 fill-indigo-400'} />
                  <span className={`text-[13px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>+{quest.xpReward}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredQuests.length === 0 && (
          <div className="text-center py-14">
            <span className="text-5xl opacity-60">{isHinglish ? '😴' : '🏰'}</span>
            <p className={`font-medium mt-3 ${tp}`}>{t('noQuests', lang)}</p>
            <p className={`text-[13px] mt-1 ${ts}`}>{t('noQuestsSub', lang)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
