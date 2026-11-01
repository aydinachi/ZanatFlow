import React, { useState, useEffect } from 'react';
import { X, Save, Wallet, AlertCircle } from 'lucide-react';
import { Finance, FinanceType, FinanceCategory, FinanceStatus, Currency } from '../../types';
import { useData } from '../../context/DataContext';

interface FinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  financeToEdit?: Finance | null;
}

export const FinanceModal: React.FC<FinanceModalProps> = ({ isOpen, onClose, financeToEdit }) => {
  const { clients, projects, addFinance, updateFinance } = useData();

  const [type, setType] = useState<FinanceType>('prihod');
  const [category, setCategory] = useState<FinanceCategory>('Uplata klijenta');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [currency, setCurrency] = useState<Currency>('BAM');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<FinanceStatus>('Plaćeno');
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (financeToEdit) {
      setType(financeToEdit.type || 'prihod');
      setCategory(financeToEdit.category || 'Uplata klijenta');
      setDescription(financeToEdit.description || '');
      setAmount(financeToEdit.amount || 0);
      setCurrency(financeToEdit.currency || 'BAM');
      setDate(financeToEdit.date || '');
      setDueDate(financeToEdit.dueDate || '');
      setStatus(financeToEdit.status || 'Plaćeno');
      setClientId(financeToEdit.clientId || '');
      setProjectId(financeToEdit.projectId || '');
      setInvoiceNumber(financeToEdit.invoiceNumber || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setType('prihod');
      setCategory('Uplata klijenta');
      setDescription('');
      setAmount(1000);
      setCurrency('BAM');
      setDate(today);
      setDueDate(today);
      setStatus('Plaćeno');
      setClientId('');
      setProjectId('');
      setInvoiceNumber(`FAK-2026-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [financeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Opis transakcije ili računa je obavezan.');
      return;
    }

    const selClient = clients.find((c) => c.id === clientId);
    const selProject = projects.find((p) => p.id === projectId);

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (financeToEdit) {
        await updateFinance(financeToEdit.id, {
          type,
          category,
          description,
          amount: Number(amount),
          currency,
          date,
          dueDate,
          status,
          clientId,
          clientName: selClient ? selClient.companyName : '',
          projectId,
          projectName: selProject ? selProject.title : '',
          invoiceNumber,
        });
      } else {
        await addFinance({
          type,
          category,
          description,
          amount: Number(amount),
          currency,
          date,
          dueDate,
          status,
          clientId,
          clientName: selClient ? selClient.companyName : '',
          projectId,
          projectName: selProject ? selProject.title : '',
          invoiceNumber,
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch {
      setErrorMsg('Greška pri spremanju transakcije.');
      setIsSubmitting(false);
    }
  };

  const categories: FinanceCategory[] = [
    'Uplata klijenta',
    'Hosting',
    'Domena',
    'Softver/Pretplata',
    'Oprema',
    'Projektni trošak',
    'Marketing',
    'Ostalo',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {financeToEdit ? 'Uredi finansijski zapis' : 'Evidentiraj uplatu ili trošak'}
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

          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('prihod');
                setCategory('Uplata klijenta');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'prihod'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              + Prihod / Uplata
            </button>
            <button
              type="button"
              onClick={() => {
                setType('trosak');
                setCategory('Hosting');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === 'trosak'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              - Trošak / Pretplata
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Kategorija
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FinanceCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status uplate
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FinanceStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
              >
                <option value="Plaćeno">Plaćeno</option>
                <option value="Neplaćeno">Neplaćeno</option>
                <option value="Djelimično">Djelimično</option>
                <option value="Zakašnjelo">Zakašnjelo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Opis transakcije *
            </label>
            <input
              type="text"
              required
              placeholder="npr. Prva rata za izradu web stranice"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Iznos
              </label>
              <input
                type="number"
                min={0}
                step={10}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valuta
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="BAM">KM (BAM)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Datum izdanja / uplate
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Broj fakture / računa
              </label>
              <input
                type="text"
                placeholder="FAK-2026-001"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Povezani Klijent (Opcionalno)
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="">Nijedan</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Povezani Projekat (Opcionalno)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
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
              {isSubmitting ? 'Spremanje...' : 'Sačuvaj u finansije'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
