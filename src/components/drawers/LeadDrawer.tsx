import React, { useState } from 'react';
import {
  X,
  Target,
  Globe,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  Send,
  FileText,
} from 'lucide-react';
import { Lead, ActivityType } from '../../types';
import { useData } from '../../context/DataContext';
import {
  formatCurrency,
  formatDate,
  getDaysAgo,
  getPriorityBadgeClass,
  getLeadStatusBadgeClass,
} from '../../utils/formatters';

interface LeadDrawerProps {
  leadId: string | null;
  onClose: () => void;
  onEditLead: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ leadId, onClose, onEditLead }) => {
  const { leads, activities, updateLeadStatus, convertLeadToClient, deleteLead, addActivity } =
    useData();

  const [newActivityType, setNewActivityType] = useState<ActivityType>('E-mail');
  const [newActivityDesc, setNewActivityDesc] = useState('');
  const [newActivityNextStep, setNewActivityNextStep] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const leadActivities = activities.filter(
    (a) => a.entityId === lead.id || a.entityName === lead.companyName
  );

  const daysAgoLastContact = getDaysAgo(lead.lastContactDate);
  const requiresFollowUp = daysAgoLastContact >= 5;

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateLeadStatus(lead.id, e.target.value as any);
  };

  const handleConvert = async () => {
    if (
      window.confirm(
        `Da li ste sigurni da želite pretvoriti "${lead.companyName}" u aktivnog klijenta?`
      )
    ) {
      await convertLeadToClient(lead.id);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Da li ste sigurni da želite obrisati "${lead.companyName}"?`)) {
      await deleteLead(lead.id);
      onClose();
    }
  };

  const handleAddActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityDesc.trim()) return;

    setIsAddingActivity(true);
    await addActivity({
      entityType: 'lead',
      entityId: lead.id,
      entityName: lead.companyName,
      type: newActivityType,
      date: new Date().toISOString().split('T')[0],
      description: newActivityDesc,
      nextStep: newActivityNextStep,
    });

    setNewActivityDesc('');
    setNewActivityNextStep('');
    setIsAddingActivity(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              {lead.companyName.charAt(0)}
            </div>
            <div className="truncate">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {lead.companyName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {lead.industry} · {lead.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditLead(lead)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Uredi"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Obriši"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Action Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Status:
              </span>
              <select
                value={lead.status}
                onChange={handleStatusChange}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Novi potencijalni klijent">Novi potencijalni klijent</option>
                <option value="Istražen">Istražen</option>
                <option value="Kontaktiran">Kontaktiran</option>
                <option value="Poruka poslana">Poruka poslana</option>
                <option value="Potrebno ponovno javljanje">Potrebno ponovno javljanje</option>
                <option value="Odgovorio">Odgovorio</option>
                <option value="Pregovori">Pregovori</option>
                <option value="Ponuda poslana">Ponuda poslana</option>
                <option value="Dobijen posao">Dobijen posao</option>
                <option value="Izgubljen posao">Izgubljen posao</option>
                <option value="Nezainteresovan">Nezainteresovan</option>
              </select>
            </div>

            <button
              onClick={handleConvert}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Pretvori u klijenta</span>
            </button>
          </div>

          {/* Audit Alert Badge if delayed */}
          {requiresFollowUp && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Potrebno javljanje!</strong> Prošlo je <strong>{daysAgoLastContact} dana</strong> od posljednjeg kontakta sa ovom firmom.
              </span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Vrijednost</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatCurrency(lead.estimatedValue, lead.currency)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Prioritet</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${getPriorityBadgeClass(
                  lead.priority
                )}`}
              >
                {lead.priority}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Vjerovatnoća</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {lead.probability}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Izvor</p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {lead.source}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Kontakt Informacije
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${lead.email}`} className="hover:underline text-indigo-600 dark:text-indigo-400">
                  {lead.email || 'Nema e-maila'}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone || 'Nema telefona'}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="w-4 h-4 text-slate-400" />
                {lead.website ? (
                  <a
                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                  >
                    {lead.website} <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span>Nema web stranicu</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{lead.city}</span>
              </div>
            </div>
          </div>

          {/* Business Opportunity Analysis */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Analiza Poslovne Prilike
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Potrebna usluga:</span>{' '}
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {lead.serviceType}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Kvalitet sajta:
                </span>{' '}
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {lead.currentWebsiteQuality}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Uočeni problemi:
                </span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {lead.identifiedProblems || 'Nisu navedeni posebni problemi.'}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Prijedlog rješenja:
                </span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-indigo-900 dark:text-indigo-300">
                  {lead.proposedSolution || 'Nije definisan prijedlog rješenja.'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Napomene
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Activity Log & Add Activity */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Historija komunikacije
              </h4>
              <span className="text-[11px] text-slate-500">{leadActivities.length} zapisa</span>
            </div>

            {/* Quick Add Activity Form */}
            <form
              onSubmit={handleAddActivitySubmit}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <select
                  value={newActivityType}
                  onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="E-mail">E-mail</option>
                  <option value="Telefonski poziv">Telefonski poziv</option>
                  <option value="WhatsApp poruka">WhatsApp poruka</option>
                  <option value="LinkedIn poruka">LinkedIn poruka</option>
                  <option value="Sastanak">Sastanak</option>
                  <option value="Poslana ponuda">Poslana ponuda</option>
                  <option value="Ostalo">Ostalo</option>
                </select>
                <input
                  type="text"
                  placeholder="Sljedeći korak (npr. Zvati u utorak)..."
                  value={newActivityNextStep}
                  onChange={(e) => setNewActivityNextStep(e.target.value)}
                  className="flex-1 px-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Unesite bilješku o obavljenom razgovoru ili e-mailu..."
                  value={newActivityDesc}
                  onChange={(e) => setNewActivityDesc(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingActivity || !newActivityDesc.trim()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Dodaj
                </button>
              </div>
            </form>

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              {leadActivities.length > 0 ? (
                leadActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 relative pl-4 border-l-2 border-l-indigo-500"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {act.type}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(act.date)}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {act.description}
                    </p>
                    {act.nextStep && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                        Sljedeći korak: {act.nextStep}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center italic">
                  Još nema zabilježenih aktivnosti za ovog klijenta.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
