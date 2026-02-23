import { Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { t } from '../i18n';
import type { Page } from '../store';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;           // desktop collapsed state
  onToggle: () => void;         // toggle desktop collapse
  mobileOpen: boolean;          // mobile drawer open
  onMobileClose: () => void;    // close mobile drawer
}

const navItems: {
  page: Page;
  labelKey: 'navDashboard' | 'navQuests' | 'navNotes' | 'navAchievements' | 'navChallenges';
  emoji: string;
  hinglishEmoji: string;
}[] = [
  { page: 'dashboard',    labelKey: 'navDashboard',    emoji: '🪔', hinglishEmoji: '🏠' },
  { page: 'quests',       labelKey: 'navQuests',       emoji: '🏹', hinglishEmoji: '💪' },
  { page: 'notes',        labelKey: 'navNotes',        emoji: '📜', hinglishEmoji: '🧠' },
  { page: 'achievements', labelKey: 'navAchievements', emoji: '🏆', hinglishEmoji: '🏆' },
  { page: 'challenges',   labelKey: 'navChallenges',   emoji: '🔱', hinglishEmoji: '🔥' },
];

// ── Shared sidebar panel (used in both desktop and mobile) ────────────────────
function SidebarPanel({
  currentPage, onNavigate, collapsed, onToggle,
  isMobile = false, onMobileClose,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
}) {
  const { isDark, isHinglish, lang } = useTheme();

  const sidebarBg = isHinglish
    ? 'bg-gradient-to-b from-[#2A1B3D] via-[#1F1530] to-[#1A1028]'
    : isDark
      ? 'bg-gradient-to-b from-[#0C0C1A] via-[#101022] to-[#0C0C1A]'
      : 'bg-gradient-to-b from-[#1A1A2E] via-[#22223A] to-[#1A1A2E]';

  // On mobile drawer, always show expanded (w-72). On desktop, respect collapsed.
  const showExpanded = isMobile || !collapsed;

  return (
    <div className={`flex flex-col h-full m-2.5 mr-0 rounded-2xl border border-white/[0.06] shadow-2xl overflow-hidden transition-colors duration-500 ${sidebarBg}`}>
      {/* Logo + close button (mobile) */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-white/[0.06] ${!showExpanded ? 'justify-center' : ''}`}>
        <div className="relative">
          <span className="text-2xl inline-block">{isHinglish ? '🎉' : '🪔'}</span>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-400 animate-subtle-pulse" />
        </div>
        {showExpanded && (
          <div className="animate-slide-up flex-1">
            <h1 className="text-base font-bold text-white/90 tracking-tight">{t('appName', lang)}</h1>
            <p className="text-[10px] -mt-0.5 text-white/30">{t('appTagline', lang)}</p>
          </div>
        )}
        {/* Close button — mobile drawer only */}
        {isMobile && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map(item => {
          const isActive = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
              } ${!showExpanded ? 'justify-center' : ''}`}
              title={t(item.labelKey, lang)}
            >
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full ${
                  isHinglish ? 'bg-rose-400' : 'bg-indigo-400'
                }`} />
              )}
              <span className="text-base">{isHinglish ? item.hinglishEmoji : item.emoji}</span>
              {showExpanded && (
                <span className="font-medium text-[13px]">{t(item.labelKey, lang)}</span>
              )}
              {isActive && showExpanded && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isHinglish ? 'bg-rose-400' : 'bg-indigo-400'}`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings + collapse (desktop only) */}
      <div className="px-2.5 pb-3 space-y-1 border-t border-white/[0.06] pt-3">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
          !showExpanded ? 'justify-center' : ''
        } text-white/30 hover:bg-white/[0.04] hover:text-white/50`}>
          <Settings size={18} />
          {showExpanded && <span className="font-medium text-[13px]">{t('navSettings', lang)}</span>}
        </button>
        {/* Collapse toggle — only on desktop */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center py-2 rounded-lg transition-all text-white/20 hover:bg-white/[0.04] hover:text-white/40"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Bottom navigation bar — mobile only ───────────────────────────────────────
function BottomNav({
  currentPage, onNavigate,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  const { isHinglish, isDark } = useTheme();

  const bg = isHinglish
    ? 'bg-white/80 backdrop-blur-xl border-t border-rose-200/30'
    : isDark
      ? 'bg-[#0C0C1A]/90 backdrop-blur-xl border-t border-white/[0.06]'
      : 'bg-white/90 backdrop-blur-xl border-t border-slate-200/50';

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-30 flex md:hidden ${bg}`}>
      {navItems.map(item => {
        const isActive = currentPage === item.page;
        return (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all ${
              isActive
                ? isHinglish ? 'text-rose-500' : isDark ? 'text-indigo-400' : 'text-indigo-600'
                : isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={`text-lg transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
              {isHinglish ? item.hinglishEmoji : item.emoji}
            </span>
            {/* Active indicator dot */}
            <div className={`w-1 h-1 rounded-full transition-all ${
              isActive
                ? isHinglish ? 'bg-rose-500' : isDark ? 'bg-indigo-400' : 'bg-indigo-600'
                : 'bg-transparent'
            }`} />
          </button>
        );
      })}
    </nav>
  );
}

// ── Main Sidebar export ───────────────────────────────────────────────────────
export function Sidebar({ currentPage, onNavigate, collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar — hidden on mobile, always visible on md+ ────── */}
      <aside className={`
        hidden md:flex fixed left-0 top-0 h-full z-30
        flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'lg:w-64 md:w-20'}
      `}>
        <SidebarPanel
          currentPage={currentPage}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggle={onToggle}
          isMobile={false}
        />
      </aside>

      {/* ── Mobile drawer — slide in from left ──────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 z-50 transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <SidebarPanel
          currentPage={currentPage}
          onNavigate={onNavigate}
          collapsed={false}
          onToggle={onToggle}
          isMobile={true}
          onMobileClose={onMobileClose}
        />
      </aside>

      {/* ── Bottom navigation bar — mobile only ─────────────────────────── */}
      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </>
  );
}
