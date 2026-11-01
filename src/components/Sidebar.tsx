import React from 'react';
import {
  LayoutDashboard,
  Target,
  Users,
  Briefcase,
  CheckSquare,
  MessageSquare,
  Wallet,
  Tag,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Sparkles,
  LogOut,
  LogIn,
  MapPin,
} from 'lucide-react';
import { useData } from '../context/DataContext';

export type ActiveTab =
  | 'dashboard'
  | 'finder'
  | 'research'
  | 'leads'
  | 'clients'
  | 'projects'
  | 'tasks'
  | 'activities'
  | 'finances'
  | 'services'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onQuickAddLead: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  onQuickAddLead,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) => {
  const { user, isDemoMode, loginGoogle, logout, leads } = useData();

  // Count leads in research database vs active pipeline follow-ups
  const researchLeadsCount = leads.filter(
    (l) => l.status === 'Novi potencijalni klijent' || l.status === 'Istražen'
  ).length;

  const followUpLeadsCount = leads.filter(
    (l) => l.status === 'Potrebno ponovno javljanje' || l.status === 'Ponuda poslana'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Kontrolna ploča', icon: LayoutDashboard },
    { id: 'finder', label: 'Finder klijenata (Maps)', icon: MapPin },
    { id: 'research', label: 'Istraživanje (Novi)', icon: Sparkles, badge: researchLeadsCount },
    { id: 'leads', label: 'Potencijalni klijenti', icon: Target, badge: followUpLeadsCount },
    { id: 'clients', label: 'Klijenti', icon: Users },
    { id: 'projects', label: 'Projekti i web stranice', icon: Briefcase },
    { id: 'tasks', label: 'Zadaci i podsjetnici', icon: CheckSquare },
    { id: 'activities', label: 'Historija komunikacije', icon: MessageSquare },
    { id: 'finances', label: 'Finansije i naplate', icon: Wallet },
    { id: 'services', label: 'Usluge i cjenovnik', icon: Tag },
    { id: 'analytics', label: 'Analitika i izvještaji', icon: BarChart3 },
    { id: 'settings', label: 'Postavke', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
      {/* Brand Header with Official ZanatFlow Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/assets/aistudio/Sjajni_plavo-cijan_Z_logo_s_strelicom_a7ffc97a.png"
              alt="ZanatFlow"
              className="w-8 h-8 object-contain shrink-0"
            />
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-tight leading-tight flex items-center gap-1">
                Zanat<span className="text-cyan-400">Flow</span>
              </h1>
              <p className="text-[10px] text-slate-400 truncate">Personalni CRM</p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-9 h-9 mx-auto flex items-center justify-center">
            <img
              src="/assets/aistudio/Sjajni_plavo-cijan_Z_logo_s_strelicom_a7ffc97a.png"
              alt="ZanatFlow"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Proširi meni' : 'Skupi meni'}
          aria-label={isCollapsed ? 'Proširi meni' : 'Skupi meni'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={onQuickAddLead}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs transition-all shadow-md shadow-cyan-950/40 ${
            isCollapsed ? 'px-2' : ''
          }`}
          title="Dodaj potencijalnog klijenta"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Novi klijent</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

              {item.badge && item.badge > 0 ? (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isCollapsed ? 'absolute top-1 right-1' : ''
                  } bg-cyan-500/20 text-cyan-300 border border-cyan-500/30`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Creator Credit: Kreirao Ajdin Beganović */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-2">
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="text-[10px] font-semibold text-slate-400">
                Prijavljeni nalog
              </span>
              {user ? (
                <button
                  onClick={logout}
                  className="hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px]"
                  title="Odjavi se"
                >
                  <LogOut className="w-3 h-3" /> Odjava
                </button>
              ) : (
                <button
                  onClick={loginGoogle}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-[10px] font-semibold text-cyan-400"
                  title="Prijavi se sa Google računom"
                >
                  <LogIn className="w-3 h-3" /> Prijava
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user?.displayName ? user.displayName.charAt(0) : 'A'}
              </div>
              <div className="truncate text-left flex-1">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {user?.displayName || 'Ajdin Beganović'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'aydinachi@gmail.com'}
                </p>
              </div>
            </div>

            {/* CREATOR CREDIT FOOTER */}
            <div className="text-[10px] text-slate-400 text-center font-medium pt-1.5 border-t border-slate-800/80">
              Kreirao: <span className="text-cyan-400 font-bold">Ajdin Beganović</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              title={isDemoMode ? 'Demo Režim' : 'Produkcija (Uživo)'}
            />
          </div>
        )}
      </div>
    </aside>
  </>
);
};
