import React, { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Download,
  Upload,
  PhoneCall,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  MoreVertical,
  ArrowUpDown,
  Sparkles,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Lead, LeadStatus, LeadSource, Priority } from '../../types';
import {
  formatCurrency,
  formatDate,
  getDaysAgo,
  getPriorityBadgeClass,
  getLeadStatusBadgeClass,
} from '../../utils/formatters';

interface LeadsViewProps {
  onOpenNewLead: () => void;
  onEditLead: (lead: Lead) => void;
  onSelectLead: (leadId: string) => void;
  onOpenImportCSV: () => void;
  onNavigateToResearch?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  onOpenNewLead,
  onEditLead,
  onSelectLead,
  onOpenImportCSV,
  onNavigateToResearch,
}) => {
  const { leads, updateLeadStatus, convertLeadToClient, exportDataToCSV } = useData();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value' | 'date' | 'priority'>('date');

  // Active Pipeline Leads (exclude 'Novi potencijalni klijent' & 'Istražen' from main active pipeline if in kanban)
  const activePipelineLeads = leads.filter(
    (l) => l.status !== 'Novi potencijalni klijent' && l.status !== 'Istražen'
  );

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = industryFilter === 'all' || lead.industry === industryFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;

    return matchesSearch && matchesIndustry && matchesSource && matchesStatus && matchesPriority;
  });

  // Sort logic
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (sortBy === 'value') return b.estimatedValue - a.estimatedValue;
    if (sortBy === 'priority') {
      const pOrder: Record<Priority, number> = { Visok: 3, Srednji: 2, Nizak: 1 };
      return pOrder[b.priority] - pOrder[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Active Pipeline Leads filtered
  const sortedActiveLeads = sortedLeads.filter(
    (l) => l.status !== 'Novi potencijalni klijent' && l.status !== 'Istražen'
  );

  // Calculate Pipeline Metrics
  const totalPipelineValue = sortedActiveLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const leadsNeedingFollowUpCount = sortedActiveLeads.filter(
    (l) =>
      l.status === 'Potrebno ponovno javljanje' ||
      l.status === 'Ponuda poslana' ||
      getDaysAgo(l.lastContactDate) >= 7
  ).length;

  // Streamlined 5 Active Sales Columns
  const kanbanColumns: { id: string; title: string; statuses: LeadStatus[]; color: string }[] = [
    {
      id: 'col-contacted',
      title: '1. Kontaktirani',
      statuses: ['Kontaktiran', 'Poruka poslana'],
      color: 'border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20',
    },
    {
      id: 'col-followup',
      title: '2. Odgovor & Javljanje',
      statuses: ['Potrebno ponovno javljanje', 'Odgovorio'],
      color: 'border-amber-400 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
    },
    {
      id: 'col-negotiations',
      title: '3. Pregovori & Ponuda',
      statuses: ['Pregovori', 'Ponuda poslana'],
      color: 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20',
    },
    {
      id: 'col-won',
      title: '4. Dobijen posao 🎉',
      statuses: ['Dobijen posao'],
      color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20',
    },
    {
      id: 'col-lost',
      title: '5. Neaktivno',
      statuses: ['Izgubljen posao', 'Nezainteresovan'],
      color: 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20',
    },
  ];

  // Unique Filter Options
  const uniqueIndustries = Array.from(new Set(leads.map((l) => l.industry))).filter(Boolean);
  const uniqueSources = Array.from(new Set(leads.map((l) => l.source))).filter(Boolean);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Potencijalni klijenti (Prodajni lijevak)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aktivni prodajni proces od prve poruke do zaključenja ponude i konverzije.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportCSV}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Uvezi CSV</span>
          </button>
          <button
            onClick={() => exportDataToCSV('leads')}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Izvezi CSV</span>
          </button>
          <button
            onClick={onOpenNewLead}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj klijenta</span>
          </button>
        </div>
      </div>

      {/* Connection Banner to Research Database */}
      {onNavigateToResearch && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Tražite novootkrivene i istražene firme koje još niste kontaktirali?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nove firme s Google Maps ili Instagrama vodite u zasebnoj bazi istraživanja i dodajte u ovaj lijevak jednim klikom!
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToResearch}
            className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span>Otvori Istraživanje (Novi)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Summary KPI Ribbon */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ukupna vrijednost aktivnog lijevka
          </p>
          <h3 className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
            {formatCurrency(totalPipelineValue, 'BAM')}
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Aktivnih pregovora i kontaktiranih
          </p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {sortedActiveLeads.length} <span className="text-xs font-normal text-slate-500">klijenata</span>
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Potrebno javljanje / podsjetnik
          </p>
          <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            {leadsNeedingFollowUpCount} klijenata
          </h3>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži po nazivu firme, kontaktu, gradu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban lijevak
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Tabelarni prikaz
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Sve djelatnosti</option>
              {uniqueIndustries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Svi izvori</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Svi prioriteti</option>
              <option value="Visok">Visok prioritet</option>
              <option value="Srednji">Srednji prioritet</option>
              <option value="Nizak">Nizak prioritet</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="date">Sortiraj: Najnoviji</option>
              <option value="value">Sortiraj: Vrijednost (KM)</option>
              <option value="priority">Sortiraj: Prioritet</option>
            </select>
          </div>

          {(searchQuery ||
            industryFilter !== 'all' ||
            sourceFilter !== 'all' ||
            priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIndustryFilter('all');
                setSourceFilter('all');
                setPriorityFilter('all');
              }}
              className="px-2.5 py-1.5 text-xs text-rose-600 hover:underline text-left col-span-2 sm:col-span-1"
            >
              Poništi filtere
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <div className="space-y-4">
          {/* Quick Stage Filter Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              Sve faze lijevka ({sortedActiveLeads.length})
            </button>
            {kanbanColumns.map((col) => {
              const colCount = sortedActiveLeads.filter((l) => col.statuses.includes(l.status)).length;
              const isSelected = col.statuses.includes(statusFilter as LeadStatus);
              return (
                <button
                  key={col.id}
                  onClick={() => setStatusFilter(isSelected ? 'all' : col.statuses[0])}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{col.title}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isSelected
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {colCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* STREAMLINED 5-COLUMN KANBAN BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-start w-full">
            {kanbanColumns.map((col) => {
              const columnLeads = sortedActiveLeads.filter((l) => col.statuses.includes(l.status));
              const columnTotalValue = columnLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

              if (statusFilter !== 'all' && !col.statuses.includes(statusFilter as LeadStatus)) {
                return null;
              }

              return (
                <div
                  key={col.id}
                  className={`rounded-2xl border ${col.color} p-3 flex flex-col max-h-[80vh] w-full min-w-0 shadow-xs`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80 dark:border-slate-700/80 shrink-0">
                    <div className="min-w-0">
                      <h3 className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                        {col.title}
                      </h3>
                      <p className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {formatCurrency(columnTotalValue, 'BAM')}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 shrink-0">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    {columnLeads.map((lead) => {
                      const daysAgo = getDaysAgo(lead.lastContactDate);
                      const isUrgent = daysAgo >= 5 && lead.status !== 'Dobijen posao';

                      return (
                        <div
                          key={lead.id}
                          onClick={() => onSelectLead(lead.id)}
                          className={`p-3 rounded-xl bg-white dark:bg-slate-900 border shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group relative ${
                            isUrgent
                              ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-400/30'
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                              {lead.companyName}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 text-[9px] font-bold rounded shrink-0 ${getPriorityBadgeClass(
                                lead.priority
                              )}`}
                            >
                              {lead.priority}
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {lead.contactName || lead.city} · {lead.city}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(lead.estimatedValue, lead.currency)}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                              {lead.source}
                            </span>
                          </div>

                          {/* Quick Stage Selector */}
                          <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            <select
                              onClick={(e) => e.stopPropagation()}
                              value={lead.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateLeadStatus(lead.id, e.target.value as LeadStatus);
                              }}
                              className="text-[9px] py-0.5 px-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none font-medium truncate w-full"
                            >
                              <option value="Kontaktiran">1. Kontaktiran</option>
                              <option value="Poruka poslana">1. Poruka poslana</option>
                              <option value="Potrebno ponovno javljanje">2. Potrebno javljanje</option>
                              <option value="Odgovorio">2. Odgovorio</option>
                              <option value="Pregovori">3. Pregovori</option>
                              <option value="Ponuda poslana">3. Ponuda poslana</option>
                              <option value="Dobijen posao">4. Dobijen posao 🎉</option>
                              <option value="Izgubljen posao">5. Izgubljen posao</option>
                              <option value="Nezainteresovan">5. Nezainteresovan</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}

                    {columnLeads.length === 0 && (
                      <div className="p-4 text-center border border-dashed border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 text-[11px] italic">
                        Nema firmi u ovoj fazi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Firma / Klijent</th>
                  <th className="py-3 px-4">Kontakt & Grad</th>
                  <th className="py-3 px-4">Djelatnost & Izvor</th>
                  <th className="py-3 px-4">Vrijednost</th>
                  <th className="py-3 px-4">Prioritet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Zadnji kontakt</th>
                  <th className="py-3 px-4 text-right">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedLeads.map((lead) => {
                  const daysAgo = getDaysAgo(lead.lastContactDate);
                  const isUrgent = daysAgo >= 5 && lead.status !== 'Dobijen posao';

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead.id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {lead.companyName}
                        </p>
                        <p className="text-[11px] text-slate-500">{lead.serviceType}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <p className="font-medium">{lead.contactName}</p>
                        <p className="text-[11px] text-slate-500">
                          {lead.city} · {lead.phone || lead.email}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <p>{lead.industry}</p>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          {lead.source}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(lead.estimatedValue, lead.currency)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${getPriorityBadgeClass(
                            lead.priority
                          )}`}
                        >
                          {lead.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${getLeadStatusBadgeClass(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        <span className={isUrgent ? 'text-amber-600 font-bold' : ''}>
                          {daysAgo} dana
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditLead(lead)}
                          className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                          title="Uredi"
                        >
                          Uredi
                        </button>
                        <button
                          onClick={() => convertLeadToClient(lead.id)}
                          className="p-1 text-emerald-600 font-semibold hover:underline"
                        >
                          Pretvori
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
