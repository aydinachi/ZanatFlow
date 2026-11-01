import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Target,
  CheckSquare,
  Sparkles,
  Database,
  Calendar,
  Menu,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  sidebarCollapsed: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLead: () => void;
  onOpenNewTask: () => void;
  onSelectLead: (leadId: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  activeTab,
  setActiveTab,
  onOpenNewLead,
  onOpenNewTask,
  onSelectLead,
  onToggleMobileMenu,
}) => {
  const { theme, toggleTheme, isDemoMode, leads, tasks } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Filter follow-up reminders
  const urgentFollowUps = leads.filter(
    (l) => l.status === 'Potrebno ponovno javljanje' || l.status === 'Ponuda poslana'
  );

  const pendingTasks = tasks.filter((t) => t.status !== 'Završeno');

  // Search Results
  const matchingLeads = searchQuery.trim()
    ? leads.filter(
        (l) =>
          l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.city.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const tabTitles: Record<ActiveTab, string> = {
    dashboard: 'Kontrolna ploča',
    research: 'Istraživanje i Baza novih firmi',
    leads: 'Potencijalni klijenti (Prodajni lijevak)',
    clients: 'Klijenti',
    projects: 'Projekti i web stranice',
    tasks: 'Zadaci i podsjetnici',
    activities: 'Historija komunikacije',
    finances: 'Finansije i naplate',
    services: 'Usluge i cjenovnik',
    analytics: 'Analitika i izvještaji',
    settings: 'Postavke poslovanja',
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-3 sm:px-6 left-0 ${
        sidebarCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      {/* Mobile Burger & Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-1 max-w-2xl">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors shrink-0"
            title="Otvori navigacijski meni"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 hidden sm:flex shrink-0">
          <img
            src="/assets/aistudio/Sjajni_plavo-cijan_Z_logo_s_strelicom_a7ffc97a.png"
            alt="ZanatFlow"
            className="w-6 h-6 object-contain"
          />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            {tabTitles[activeTab]}
          </h2>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži potencijalne klijente, firme, gradove..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50">
              <p className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase">
                Rezultati pretrage ({matchingLeads.length})
              </p>
              {matchingLeads.length > 0 ? (
                <div className="space-y-1">
                  {matchingLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        setActiveTab('leads');
                        onSelectLead(lead.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {lead.companyName}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.contactName} · {lead.city}
                        </p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {lead.status}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2">
                  Nema pronalazaka za "{searchQuery}".
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Podsjetnici i obavještenja"
          >
            <Bell className="w-4 h-4" />
            {urgentFollowUps.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-indigo-500" /> Podsjetnici za javljanje
                </h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                  {urgentFollowUps.length} hitnih
                </span>
              </div>

              {urgentFollowUps.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {urgentFollowUps.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setActiveTab('leads');
                        onSelectLead(lead.id);
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 hover:border-amber-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {lead.companyName}
                        </p>
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Kontakt: {lead.contactName} ({lead.phone || lead.email})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                  Nemate hitnih podsjetnika za javljanje.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'light' ? 'Preklopi na tamnu temu' : 'Preklopi na svijetlu temu'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Quick Action Dropdown */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dodaj klijenta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
