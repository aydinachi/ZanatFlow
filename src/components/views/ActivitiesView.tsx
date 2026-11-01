import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Mail,
  Phone,
  Send,
  Calendar,
  UserCheck,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Activity, ActivityType } from '../../types';
import { formatDate } from '../../utils/formatters';

export const ActivitiesView: React.FC = () => {
  const { activities, addActivity, deleteActivity, leads, clients, projects } = useData();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form for new activity log
  const [entityType, setEntityType] = useState<'lead' | 'client' | 'project'>('lead');
  const [entityId, setEntityId] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('E-mail');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [nextStep, setNextStep] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredActivities = activities.filter((act) => {
    const matchesType = typeFilter === 'all' || act.type === typeFilter;
    const matchesSearch =
      act.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    let name = 'Nepoznat subjekat';
    if (entityType === 'lead') {
      const l = leads.find((item) => item.id === entityId);
      if (l) name = l.companyName;
    } else if (entityType === 'client') {
      const c = clients.find((item) => item.id === entityId);
      if (c) name = c.companyName;
    } else if (entityType === 'project') {
      const p = projects.find((item) => item.id === entityId);
      if (p) name = p.title;
    }

    setIsSubmitting(true);
    await addActivity({
      entityType,
      entityId: entityId || 'gen-1',
      entityName: name,
      type: activityType,
      date,
      description,
      nextStep,
    });

    setDescription('');
    setNextStep('');
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovu aktivnost?')) {
      await deleteActivity(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Historija Komunikacije i Aktivnosti
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kompletan hronološki pregled svih poziva, e-mailova, sastanaka i poslanih ponuda.
        </p>
      </div>

      {/* Add New Activity Form Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Evidentiraj novu komunikaciju ili sastanak
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tip subjekta
              </label>
              <select
                value={entityType}
                onChange={(e) => {
                  setEntityType(e.target.value as any);
                  setEntityId('');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="lead">Potencijalni klijent (Lead)</option>
                <option value="client">Stalni klijent</option>
                <option value="project">Projekat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Naziv subjekta
              </label>
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="">Odaberite iz liste...</option>
                {entityType === 'lead' &&
                  leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.companyName}
                    </option>
                  ))}
                {entityType === 'client' &&
                  clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                {entityType === 'project' &&
                  projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vrsta komunikacije
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
              >
                <option value="E-mail">E-mail</option>
                <option value="Telefonski poziv">Telefonski poziv</option>
                <option value="WhatsApp poruka">WhatsApp poruka</option>
                <option value="LinkedIn poruka">LinkedIn poruka</option>
                <option value="Sastanak">Sastanak</option>
                <option value="Poslana ponuda">Poslana ponuda</option>
                <option value="Ostalo">Ostalo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sljedeći dogovoreni korak
              </label>
              <input
                type="text"
                placeholder="npr. Poslati ponudu do petka..."
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Opis razgovora ili bilješka *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Unesite detalje razgovora, pitanja klijenta i usaglašene stavke..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Sačuvaj zapise
            </button>
          </div>
        </form>
      </div>

      {/* Timeline Stream */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Hronološki zapis komunikacije
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pretraži bilješke..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Sve vrste</option>
              <option value="E-mail">E-mail</option>
              <option value="Telefonski poziv">Telefonski poziv</option>
              <option value="WhatsApp poruka">WhatsApp poruka</option>
              <option value="LinkedIn poruka">LinkedIn poruka</option>
              <option value="Sastanak">Sastanak</option>
              <option value="Poslana ponuda">Poslana ponuda</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative pl-9 space-y-1">
              <div className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {act.entityName}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {act.type}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(act.date)}</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {act.description}
                  </p>

                  {act.nextStep && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                      Sljedeći korak: {act.nextStep}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(act.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Obriši zapis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredActivities.length === 0 && (
            <p className="text-xs text-slate-500 py-8 text-center italic">
              Nema zapisa komunikacije prema unesenom filteru.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
