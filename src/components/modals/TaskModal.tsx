import React, { useState, useEffect } from 'react';
import { X, Save, CheckSquare, AlertCircle } from 'lucide-react';
import { Task, Priority, TaskStatus, TaskType } from '../../types';
import { useData } from '../../context/DataContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { leads, clients, projects, addTask, updateTask } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Srednji');
  const [status, setStatus] = useState<TaskStatus>('Za uraditi');
  const [type, setType] = useState<TaskType>('Opći zadatak');
  const [relatedClientId, setRelatedClientId] = useState('');
  const [relatedLeadId, setRelatedLeadId] = useState('');
  const [relatedProjectId, setRelatedProjectId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || '');
      setPriority(taskToEdit.priority || 'Srednji');
      setStatus(taskToEdit.status || 'Za uraditi');
      setType(taskToEdit.type || 'Opći zadatak');
      setRelatedClientId(taskToEdit.relatedClientId || '');
      setRelatedLeadId(taskToEdit.relatedLeadId || '');
      setRelatedProjectId(taskToEdit.relatedProjectId || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(today);
      setPriority('Srednji');
      setStatus('Za uraditi');
      setType('Opći zadatak');
      setRelatedClientId('');
      setRelatedLeadId('');
      setRelatedProjectId('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Naziv zadatka je obavezan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          title,
          description,
          dueDate,
          priority,
          status,
          type,
          relatedClientId,
          relatedLeadId,
          relatedProjectId,
        });
      } else {
        await addTask({
          title,
          description,
          dueDate,
          priority,
          status,
          type,
          relatedClientId,
          relatedLeadId,
          relatedProjectId,
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch {
      setErrorMsg('Greška pri spremanju zadatka.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {taskToEdit ? 'Uredi zadatak' : 'Novi zadatak ili podsjetnik'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Naziv zadatka / podsjetnika *
            </label>
            <input
              type="text"
              required
              placeholder="npr. Nazvati Harisa za korigovanu ponudu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Vrsta zadatka
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Opći zadatak">Opći zadatak</option>
                <option value="Podsjetnik za javljanje">Podsjetnik za javljanje</option>
                <option value="Projektni zadatak">Projektni zadatak</option>
                <option value="Finansijski zadatak">Finansijski zadatak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Prioritet
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Nizak">Nizak</option>
                <option value="Srednji">Srednji</option>
                <option value="Visok">Visok</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Rok (Due Date)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="Za uraditi">Za uraditi</option>
                <option value="U toku">U toku</option>
                <option value="Završeno">Završeno</option>
                <option value="Odgođeno">Odgođeno</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Povezani Potencijalni Klijent (Opcionalno)
            </label>
            <select
              value={relatedLeadId}
              onChange={(e) => setRelatedLeadId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Nijedan</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.companyName} ({l.contactName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Povezani Projekat (Opcionalno)
            </label>
            <select
              value={relatedProjectId}
              onChange={(e) => setRelatedProjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Nijedan</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detaljan opis
            </label>
            <textarea
              rows={3}
              placeholder="Unesite zabilješke ili korake za rješavanje..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Spremanje...' : 'Sačuvaj zadatak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
