import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Finance } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface FinancesViewProps {
  onOpenNewFinance: () => void;
  onEditFinance: (finance: Finance) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({ onOpenNewFinance, onEditFinance }) => {
  const { finances, deleteFinance, updateFinance } = useData();

  const [typeFilter, setTypeFilter] = useState<'all' | 'prihod' | 'trosak'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFinances = finances.filter((f) => {
    const matchesType = typeFilter === 'all' || f.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // Financial Metrics
  const totalIncomePaid = finances
    .filter((f) => f.type === 'prihod' && f.status === 'Plaćeno')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalIncomeUnpaid = finances
    .filter((f) => f.type === 'prihod' && f.status === 'Neplaćeno')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpenses = finances
    .filter((f) => f.type === 'trosak')
    .reduce((sum, f) => sum + f.amount, 0);

  const netProfit = totalIncomePaid - totalExpenses;

  const handleMarkAsPaid = async (id: string) => {
    await updateFinance(id, { status: 'Plaćeno' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovaj finansijski zapis?')) {
      await deleteFinance(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Finansije i Evidencija Naplata
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Praćenje uplaćenih faktura, neplaćenih potraživanja i operativnih troškova.
          </p>
        </div>

        <button
          onClick={onOpenNewFinance}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Evidentiraj novu uplatu / trošak
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Ukupno naplaćeni prihodi</p>
          <h3 className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalIncomePaid, 'BAM')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Prikupljen novac na računu
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Neplaćena potraživanja</p>
          <h3 className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalIncomeUnpaid, 'BAM')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Izdate fakture na čekanju
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Ukupni poslovni troškovi</p>
          <h3 className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalExpenses, 'BAM')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Hosting, domene, softver
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Neto dobit (Profit)</p>
          <h3 className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(netProfit, 'BAM')}
          </h3>
          <p className="text-[11px] text-indigo-500 mt-1 font-semibold">
            Razlika uplaćenih prihoda i troškova
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sve transakcije
          </button>
          <button
            onClick={() => setTypeFilter('prihod')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              typeFilter === 'prihod'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Prihodi
          </button>
          <button
            onClick={() => setTypeFilter('trosak')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              typeFilter === 'trosak'
                ? 'bg-rose-600 text-white font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            - Troškovi
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">Svi statusi</option>
          <option value="Plaćeno">Plaćeno</option>
          <option value="Neplaćeno">Neplaćeno</option>
          <option value="Djelimično">Djelimično</option>
          <option value="Zakašnjelo">Zakašnjelo</option>
        </select>
      </div>

      {/* Transactions Container: Mobile Cards + Desktop Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile View: Vertical Cards (block md:hidden) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredFinances.map((fin) => {
            const isIncome = fin.type === 'prihod';
            return (
              <div key={fin.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded mb-1 ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+ Prihod' : '- Trošak'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{fin.description}</h4>
                    <p className="text-[11px] text-slate-500">{fin.category} · {formatDate(fin.date)}</p>
                  </div>

                  <span className={`text-sm font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(fin.amount, fin.currency)}
                  </span>
                </div>

                {fin.clientName && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Klijent: <strong>{fin.clientName}</strong> {fin.invoiceNumber ? `(${fin.invoiceNumber})` : ''}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      fin.status === 'Plaćeno'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}
                  >
                    {fin.status}
                  </span>

                  <div className="flex items-center gap-3">
                    {fin.status === 'Neplaćeno' && (
                      <button
                        onClick={() => handleMarkAsPaid(fin.id)}
                        className="text-emerald-600 font-bold hover:underline text-[11px]"
                      >
                        Označi plaćenim
                      </button>
                    )}
                    <button
                      onClick={() => onEditFinance(fin)}
                      className="text-slate-500 hover:text-indigo-600 p-1"
                      title="Uredi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(fin.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Obriši"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredFinances.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs italic">
              Nema evidentiranih transakcija.
            </div>
          )}
        </div>

        {/* Desktop View: Full Data Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Tip</th>
                <th className="py-3 px-4">Opis & Kategorija</th>
                <th className="py-3 px-4">Klijent / Projekat</th>
                <th className="py-3 px-4">Broj fakture</th>
                <th className="py-3 px-4">Datum</th>
                <th className="py-3 px-4">Iznos</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFinances.map((fin) => {
                const isIncome = fin.type === 'prihod';

                return (
                  <tr key={fin.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+ Prihod' : '- Trošak'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{fin.description}</p>
                      <p className="text-[11px] text-slate-500">{fin.category}</p>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <p className="font-medium">{fin.clientName || '-'}</p>
                      <p className="text-[11px] text-slate-500">{fin.projectName || ''}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {fin.invoiceNumber || '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{formatDate(fin.date)}</td>

                    <td className={`py-3 px-4 font-bold font-mono ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(fin.amount, fin.currency)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          fin.status === 'Plaćeno'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}
                      >
                        {fin.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      {fin.status === 'Neplaćeno' && (
                        <button
                          onClick={() => handleMarkAsPaid(fin.id)}
                          className="text-emerald-600 hover:underline font-semibold"
                        >
                          Označi plaćenim
                        </button>
                      )}
                      <button
                        onClick={() => onEditFinance(fin)}
                        className="text-slate-500 hover:text-indigo-600 p-1"
                        title="Uredi"
                      >
                        <Edit2 className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(fin.id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Obriši"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
