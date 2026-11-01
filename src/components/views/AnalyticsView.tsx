import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  PieChart as PieIcon,
  Calendar,
  Users,
  Award,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { leads, projects, finances } = useData();
  const [timeRange, setTimeRange] = useState<'30' | '90' | '365' | 'all'>('all');

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'Dobijen posao').length;
  const lostLeads = leads.filter(
    (l) => l.status === 'Izgubljen posao' || l.status === 'Nezainteresovan'
  ).length;

  const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const totalValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
  const avgDealSize = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;

  // Monthly Revenue Trend
  const monthlyRevenueData = [
    { month: 'Maj', prihod: 5000 },
    { month: 'Jun', prihod: 3200 },
    { month: 'Jul', prihod: 4800 },
    { month: 'Avg', prihod: 6100 },
    { month: 'Sep', prihod: 4100 },
    { month: 'Okt', prihod: 5450 },
  ];

  // Industry Breakdown
  const industryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    industryCounts[l.industry || 'Ostalo'] = (industryCounts[l.industry || 'Ostalo'] || 0) + 1;
  });

  const industryData = Object.entries(industryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const pieColors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Analitika i Izvještaji Poslovanja
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analiza stope konverzije, uspješnosti prodajnih izvora i rasta prihoda.
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none self-start sm:self-auto"
        >
          <option value="30">Zadnjih 30 dana</option>
          <option value="90">Ovaj kvartal (90 dana)</option>
          <option value="365">Ova godina (2026)</option>
          <option value="all">Sve vrijeme</option>
        </select>
      </div>

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Procenat uspješnosti (Win Rate)</p>
          <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {winRate}%
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {wonLeads} dobijena posla od {totalLeads} klijenta
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Prosječna vrijednost projekta</p>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(avgDealSize, 'BAM')}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Po jednom potencijalnom klijentu
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Dobijene ponude</p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {wonLeads} ugovora
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Realizovani web projekti
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Izgubljene prilike</p>
          <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {lostLeads} ponuda
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Nezainteresovani klijenti
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Trend rasta prihoda (KM)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="prihod" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Zastupljenost klijenata po djelatnostima
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
