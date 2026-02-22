import { Bell, Search, Sparkles, Sun, Moon, Palette, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { t } from '../i18n';
import type { UserStats } from '../store';

interface TopNavProps {
  stats: UserStats;
  sidebarCollapsed: boolean;
}

const themeOptions: { mode: ThemeMode; icon: string; labelKey: 'themeLight' | 'themeDark' | 'themeHinglish'; desc: string; color: string }[] = [
  { mode: 'light', icon: '☀️', labelKey: 'themeLight', desc: 'Clean & minimal', color: 'from-slate-200 to-slate-300' },
  { mode: 'dark', icon: '🌙', labelKey: 'themeDark', desc: 'Easy on the eyes', color: 'from-slate-700 to-slate-800' },
  { mode: 'hinglish', icon: '🎉', labelKey: 'themeHinglish', desc: 'Desi vibes + Hinglish', color: 'from-rose-400 to-violet-500' },
];

export function TopNav({ stats, sidebarCollapsed }: TopNavProps) {
  const { theme, isDark, isHinglish, lang, setTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const xpPercent = Math.round((stats.xp / stats.xpToNext) * 100);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const bg = isHinglish
    ? 'bg-white/60 backdrop-blur-xl border border-rose-200/20'
    : isDark
      ? 'bg-[#12121F]/80 backdrop-blur-xl border border-white/[0.04]'
      : 'bg-white/70 backdrop-blur-xl border border-slate-200/50';

  const inputBg = isHinglish
    ? 'bg-white/60 border border-rose-200/30 text-slate-800 placeholder:text-slate-400 focus:ring-rose-300/30 focus:border-rose-300'
    : isDark
      ? 'bg-white/[0.04] border border-white/[0.06] text-slate-200 placeholder:text-slate-600 focus:ring-indigo-500/20 focus:border-indigo-500/30'
      : 'bg-slate-50/80 border border-slate-200/60 text-slate-800 placeholder:text-slate-400 focus:ring-indigo-400/20 focus:border-indigo-300';

  const textLabel = isHinglish ? 'text-slate-700' : isDark ? 'text-slate-400' : 'text-slate-600';
  const accentColor = isHinglish ? 'text-rose-500' : isDark ? 'text-indigo-400' : 'text-indigo-500';

  return (
    <header className={`fixed top-0 right-0 z-20 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className={`m-2.5 ml-0 px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-colors duration-500 shadow-sm ${bg}`}>
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1 group">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${accentColor} opacity-50 group-focus-within:opacity-80`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder', lang)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-[13px] focus:outline-none focus:ring-2 transition-all ${inputBg}`}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className={accentColor} />
            <span className={`text-[11px] font-semibold ${textLabel}`}>{t('levelLabel', lang)} {stats.level}</span>
          </div>
          <div className="flex-1 relative">
            <div className={`h-3 rounded-full overflow-hidden ${
              isHinglish ? 'bg-rose-100/50' : isDark ? 'bg-white/[0.04]' : 'bg-slate-100'
            }`}>
              <div
                className={`h-full rounded-full animate-xp-fill transition-all duration-500 relative ${
                  isHinglish
                    ? 'bg-gradient-to-r from-rose-400 to-violet-400'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                }`}
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stats.xp}/{stats.xpToNext}</span>
          </div>
        </div>

        {/* Coins */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
          isHinglish ? 'bg-amber-50/60 border border-amber-200/30'
          : isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200/40'
        }`}>
          <span className="text-sm">🪙</span>
          <span className={`font-semibold text-[13px] ${isHinglish ? 'text-amber-700' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{stats.coins}</span>
        </div>

        {/* Streak */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${
          isHinglish ? 'bg-orange-50/60 border border-orange-200/30'
          : isDark ? 'bg-white/[0.03] border border-white/[0.05]' : 'bg-slate-50 border border-slate-200/40'
        }`}>
          <span className="text-sm">🪔</span>
          <span className={`font-semibold text-[13px] ${isHinglish ? 'text-orange-700' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>{stats.streak} {t('daysLabel', lang)}</span>
        </div>

        {/* Theme Selector */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border transition-all ${
              isHinglish
                ? 'bg-rose-50/60 border-rose-200/30 hover:bg-rose-100/60'
                : isDark
                  ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]'
                  : 'bg-slate-50 border-slate-200/40 hover:bg-slate-100'
            }`}
          >
            {theme === 'light' && <Sun size={15} className="text-slate-500" />}
            {theme === 'dark' && <Moon size={15} className="text-slate-400" />}
            {theme === 'hinglish' && <Palette size={15} className="text-rose-400" />}
            <ChevronDown size={11} className={`transition-transform ${showThemeMenu ? 'rotate-180' : ''} ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
          </button>

          {showThemeMenu && (
            <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl p-1.5 shadow-xl border animate-slide-up z-50 ${
              isHinglish
                ? 'bg-white/95 backdrop-blur-xl border-rose-200/30'
                : isDark
                  ? 'bg-[#1A1A2E] border-white/[0.06] backdrop-blur-xl'
                  : 'bg-white border-slate-200/50 backdrop-blur-xl'
            }`}>
              <p className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest ${
                isDark ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Theme
              </p>
              {themeOptions.map(opt => (
                <button
                  key={opt.mode}
                  onClick={() => { setTheme(opt.mode); setShowThemeMenu(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
                    theme === opt.mode
                      ? isDark
                        ? 'bg-white/[0.06] ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 ring-1 ring-indigo-300/30'
                      : isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${opt.color} flex items-center justify-center text-sm shadow-sm`}>
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-[13px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{t(opt.labelKey, lang)}</p>
                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{opt.desc}</p>
                  </div>
                  {theme === opt.mode && (
                    <span className={`text-xs ${isHinglish ? 'text-rose-400' : 'text-indigo-400'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className={`relative p-2 rounded-lg border transition-all ${
          isDark
            ? 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06]'
            : 'bg-slate-50 border-slate-200/40 hover:bg-slate-100'
        }`}>
          <Bell size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">3</span>
        </button>

        {/* Profile */}
        <button className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all border ${
          isDark
            ? 'border-transparent hover:border-white/[0.05] hover:bg-white/[0.03]'
            : 'border-transparent hover:border-slate-200/40 hover:bg-slate-50'
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shadow-sm ${
            isHinglish
              ? 'bg-gradient-to-br from-rose-400 to-violet-400'
              : 'bg-gradient-to-br from-indigo-500 to-violet-500'
          }`}>
            {stats.avatarEmoji}
          </div>
          <div className="text-left hidden xl:block">
            <p className={`text-[13px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{stats.username}</p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {isHinglish ? `Boss · Level ${stats.level}` : `Yoddha · Lvl ${stats.level}`}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
}
