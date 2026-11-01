import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  PhoneCall,
  Globe,
  MapPin,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Edit,
  Eye,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Lead, LeadStatus, LeadSource } from '../../types';
import {
  formatCurrency,
  getPriorityBadgeClass,
} from '../../utils/formatters';

interface ResearchViewProps {
  onOpenNewLead: () => void;
  onEditLead: (lead: Lead) => void;
  onSelectLead: (leadId: string) => void;
  onNavigateToLeads: () => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  onOpenNewLead,
  onEditLead,
  onSelectLead,
  onNavigateToLeads,
}) => {
  const { leads, updateLeadStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusSubFilter, setStatusSubFilter] = useState<'all' | 'Novi potencijalni klijent' | 'Istražen'>('all');
  const [lastMovedCompany, setLastMovedCompany] = useState<string | null>(null);

  // Filter only Research / New Leads (status 'Novi potencijalni klijent' or 'Istražen')
  const researchLeads = leads.filter(
    (l) => l.status === 'Novi potencijalni klijent' || l.status === 'Istražen'
  );

  const filteredLeads = researchLeads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    const matchesStatus =
      statusSubFilter === 'all' || lead.status === statusSubFilter;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const newCount = researchLeads.filter((l) => l.status === 'Novi potencijalni klijent').length;
  const researchedCount = researchLeads.filter((l) => l.status === 'Istražen').length;
  const totalPotentialValue = filteredLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const handleMarkAsContacted = (lead: Lead) => {
    updateLeadStatus(lead.id, 'Kontaktiran');
    setLastMovedCompany(lead.companyName);
  };

  const uniqueSources = Array.from(new Set(researchLeads.map((l) => l.source))).filter(Boolean);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Istraživanje i Novi potencijalni klijenti
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mjestobaza za dodavanje novih firmi s Google Maps, Instagrama ili preporuka prije prve komunikacije.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLeads}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>Idi u Prodajni lijevak</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
          </button>
          <button
            onClick={onOpenNewLead}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Dodaj novu firmu</span>
          </button>
        </div>
      </div>

      {/* Moved Notification Toast / Banner */}
      {lastMovedCompany && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Firma <strong className="font-bold">{lastMovedCompany}</strong> je uspješno prebačena u status{' '}
              <strong className="underline">Kontaktiran</strong> i sada se nalazi u vašem glavnom prodajnom procesu!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToLeads}
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Otvori Lijevak</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setLastMovedCompany(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Novi potencijalni
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {newCount} <span className="text-xs font-normal text-slate-400">firmi</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Compass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Istražene i analizirane
            </p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {researchedCount} <span className="text-xs font-normal text-slate-400">firmi</span>
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Procijenjena vrijednost novih prilika
            </p>
            <h3 className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrency(totalPotentialValue, 'BAM')}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži istražene firme, kontakt, grad, uočene probleme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <button
                onClick={() => setStatusSubFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusSubFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sve ({researchLeads.length})
              </button>
              <button
                onClick={() => setStatusSubFilter('Novi potencijalni klijent')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusSubFilter === 'Novi potencijalni klijent'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Novi ({newCount})
              </button>
              <button
                onClick={() => setStatusSubFilter('Istražen')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  statusSubFilter === 'Istražen'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Istraženi ({researchedCount})
              </button>
            </div>

            {/* Source Filter Dropdown */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Svi izvori</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            onClick={() => onSelectLead(lead.id)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative space-y-4"
          >
            {/* Top Row: Title, Status, Priority */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md mb-1.5 ${
                      lead.status === 'Istražen'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lead.status === 'Istražen' ? '🔍 Istražen' : '🆕 Novi unosi'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {lead.companyName}
                  </h3>
                </div>

                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${getPriorityBadgeClass(
                    lead.priority
                  )}`}
                >
                  {lead.priority}
                </span>
              </div>

              {/* Location, Industry, Contact */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {lead.city}
                </span>
                <span>·</span>
                <span>{lead.industry}</span>
                <span>·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">{lead.source}</span>
              </div>
            </div>

            {/* Identified Problems & Pitch Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Kvalitet trenutne web stranice:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {lead.currentWebsiteQuality}
                </span>
              </div>

              {lead.identifiedProblems && (
                <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 italic">
                  "{lead.identifiedProblems}"
                </p>
              )}
            </div>

            {/* Value & Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Procijenjena vrijednost</span>
                  <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(lead.estimatedValue, lead.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onEditLead(lead)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Uredi podatke"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS: Connected directly to Kontaktirani stage */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {lead.status === 'Novi potencijalni klijent' && (
                  <button
                    onClick={() => updateLeadStatus(lead.id, 'Istražen')}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl transition-colors border border-amber-200 dark:border-amber-800/60 text-center flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Označi Istražen</span>
                  </button>
                )}

                <button
                  onClick={() => handleMarkAsContacted(lead)}
                  className="flex-1 py-1.5 px-3 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Stavi u Kontaktirani</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredLeads.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Nema novih ili istraženi firmi u bazi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Sve vaše firme iz baze su trenutno u fazi komunikacije ili ste dodali sve u prodajni lijevak.
            </p>
            <button
              onClick={onOpenNewLead}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj novu firmu s Google Maps</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
