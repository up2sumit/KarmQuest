import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import type { Page } from '../store';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const navItems: { page: Page; labelKey: 'navDashboard' | 'navQuests' | 'navNotes' | 'navAchievements' | 'navChallenges'; emoji: string; hinglishEmoji: string }[] = [
  { page: 'dashboard', labelKey: 'navDashboard', emoji: '🪔', hinglishEmoji: '🏠' },
  { page: 'quests', labelKey: 'navQuests', emoji: '🏹', hinglishEmoji: '💪' },
  { page: 'notes', labelKey: 'navNotes', emoji: '📜', hinglishEmoji: '🧠' },
  { page: 'achievements', labelKey: 'navAchievements', emoji: '🏆', hinglishEmoji: '🏆' },
  { page: 'challenges', labelKey: 'navChallenges', emoji: '🔱', hinglishEmoji: '🔥' },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { isDark, isHinglish, lang } = useTheme();

  const sidebarBg = isHinglish
    ? 'bg-gradient-to-b from-[#2A1B3D] via-[#1F1530] to-[#1A1028]'
    : isDark
      ? 'bg-gradient-to-b from-[#0C0C1A] via-[#101022] to-[#0C0C1A]'
      : 'bg-gradient-to-b from-[#1A1A2E] via-[#22223A] to-[#1A1A2E]';

  return (
    <aside className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ease-in-out flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex flex-col h-full m-2.5 mr-0 rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden transition-colors duration-500 ${sidebarBg}`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/[0.06] ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
            <span className="text-2xl inline-block">{isHinglish ? '🎉' : '🪔'}</span>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-400 animate-subtle-pulse" />
          </div>
          {!collapsed && (
            <div className="animate-slide-up">
              <h1 className="text-base font-bold text-white/90 tracking-tight">
                {t('appName', lang)}
              </h1>
              <p className="text-[10px] -mt-0.5 text-white/30">{t('appTagline', lang)}</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? isHinglish
                      ? 'bg-white/[0.08] text-white shadow-sm'
                      : 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                } ${collapsed ? 'justify-center' : ''}`}
                title={t(item.labelKey, lang)}
              >
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${
                    isHinglish ? 'bg-rose-400' : 'bg-indigo-400'
                  }`} />
                )}
                <span className="text-base">{isHinglish ? item.hinglishEmoji : item.emoji}</span>
                {!collapsed && (
                  <span className="font-medium text-[13px]">{t(item.labelKey, lang)}</span>
                )}
                {isActive && !collapsed && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${
                    isHinglish ? 'bg-rose-400' : 'bg-indigo-400'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings + Collapse */}
        <div className="px-2.5 pb-3 space-y-1 border-t border-white/[0.06] pt-3">
          <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${collapsed ? 'justify-center' : ''} text-white/30 hover:bg-white/[0.04] hover:text-white/50`}>
            <Settings size={18} />
            {!collapsed && <span className="font-medium text-[13px]">{t('navSettings', lang)}</span>}
          </button>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center py-2 rounded-lg transition-all text-white/20 hover:bg-white/[0.04] hover:text-white/40"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
