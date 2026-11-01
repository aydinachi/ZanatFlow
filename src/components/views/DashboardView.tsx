import React from 'react';
import {
  DollarSign,
  Briefcase,
  Target,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  Users,
  Calendar,
  Sparkles,
  PhoneCall,
  Activity as ActivityIcon,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatDate, getDaysAgo, getPriorityBadgeClass, getLeadStatusBadgeClass } from '../../utils/formatters';
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
} from 'recharts';
import { ActiveTab } from '../Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewLead: () => void;
  onOpenNewClient: () => void;
  onOpenNewProject: () => void;
  onOpenNewTask: () => void;
  onOpenNewFinance: () => void;
  onSelectLead: (leadId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenNewLead,
  onOpenNewClient,
  onOpenNewProject,
  onOpenNewTask,
  onOpenNewFinance,
  onSelectLead,
}) => {
  const { leads, clients, projects, tasks, activities, finances } = useData();

  // Financial calculations
  const totalEarnedMonth = finances
    .filter((f) => f.type === 'prihod' && f.status === 'Plaćeno')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalUnpaid = finances
    .filter((f) => f.type === 'prihod' && f.status === 'Neplaćeno')
    .reduce((sum, f) => sum + f.amount, 0);

  const activeProjectsCount = projects.filter(
    (p) => p.status === 'U izradi' || p.status === 'Testiranje' || p.status === 'Planiranje'
  ).length;

  const completedProjectsCount = projects.filter((p) => p.status === 'Završeno').length;

  const totalLeadsCount = leads.length;
  const newLeadsThisMonth = leads.filter((l) => {
    const createdDate = new Date(l.createdAt);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  const wonLeads = leads.filter((l) => l.status === 'Dobijen posao').length;
  const winRate = totalLeadsCount > 0 ? Math.round((wonLeads / totalLeadsCount) * 100) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'Završeno');
  const overdueTasks = tasks.filter((t) => t.dueDate < todayStr && t.status !== 'Završeno');

  // Leads requiring follow up (last contact > 5 days or status is follow up)
  const leadsNeedingFollowUp = leads.filter((l) => {
    const daysAgo = getDaysAgo(l.lastContactDate);
    return (
      l.status === 'Potrebno ponovno javljanje' ||
      l.status === 'Ponuda poslana' ||
      (daysAgo >= 5 && l.status !== 'Dobijen posao' && l.status !== 'Izgubljen posao')
    );
  });

  // Recharts Monthly Revenue Data
  const monthlyData = [
    { month: 'Maj', prihod: 5000, trosak: 450 },
    { month: 'Jun', prihod: 3200, trosak: 200 },
    { month: 'Jul', prihod: 4800, trosak: 310 },
    { month: 'Avg', prihod: 6100, trosak: 400 },
    { month: 'Sep', prihod: 4100, trosak: 250 },
    { month: 'Okt', prihod: totalEarnedMonth || 5450, trosak: 445 },
  ];

  // Recharts Lead Source Breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  const pieColors = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const sourceChartData = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1.5">
            <img
              src="/assets/aistudio/Zanat_Flow_tehnolo_ki_logo_33f102d2.png"
              alt="ZanatFlow Logo"
              className="h-9 w-auto object-contain"
            />

          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Pregled vašeg poslovanja u realnom vremenu: imate <strong className="text-slate-900 dark:text-white">{leadsNeedingFollowUp.length} klijenta</strong> kojima se trebate javiti i <strong className="text-slate-900 dark:text-white">{activeProjectsCount} aktivna projekta</strong>.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenNewLead}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Novi klijent
          </button>
          <button
            onClick={onOpenNewProject}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" /> Novi projekat
          </button>
          <button
            onClick={onOpenNewTask}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" /> Novi zadatak
          </button>
          <button
            onClick={onOpenNewFinance}
            className="px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4" /> Evidentiraj uplatu
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Zarada ovog mjeseca */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Zarada ovog mjeseca</p>
            <h3 className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(totalEarnedMonth, 'BAM')}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Uplaćeno i proknjiženo
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Neplaćeni iznosi */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Neplaćeni fakturisani iznosi</p>
            <h3 className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(totalUnpaid, 'BAM')}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Potraživanja od klijenata
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Aktivni & Završeni Projekti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Projekti u izradi</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {activeProjectsCount} <span className="text-xs font-normal text-slate-500">aktivnih</span>
            </h3>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
              {completedProjectsCount} završenih web stranica
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Ukupno Potencijalnih & Win Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Prodajni pipeline</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {totalLeadsCount} <span className="text-xs font-normal text-slate-500">potencijalnih</span>
            </h3>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
              {winRate}% stopa konverzije
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Urgent Attention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Klijenti kojima se trebam javiti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-500" /> Klijenti kojima se trebam javiti ({leadsNeedingFollowUp.length})
            </h3>
            <button
              onClick={() => setActiveTab('leads')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Otvori CRM <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {leadsNeedingFollowUp.length > 0 ? (
              leadsNeedingFollowUp.slice(0, 4).map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    setActiveTab('leads');
                    onSelectLead(lead.id);
                  }}
                  className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {lead.companyName}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                      Kontakt: {lead.contactName} ({lead.phone || lead.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                      {lead.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Zadnji kontakt: {getDaysAgo(lead.lastContactDate)}d ranije
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                Svi potencijalni klijenti su blagovremeno kontaktirani.
              </p>
            )}
          </div>
        </div>

        {/* Današnji i zakašnjeli zadaci */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-500" /> Obaveze i Podsjetnici
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Svi zadaci <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {overdueTasks.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Imate {overdueTasks.length} zakašnjela zadatka koja zahtijevaju reakciju!</span>
              </div>
            )}

            {[...overdueTasks, ...todayTasks].slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rok: {formatDate(task.dueDate)}</p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${getPriorityBadgeClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))}

            {overdueTasks.length === 0 && todayTasks.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center italic">
                Nemate hitnih zadataka za danas.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mjesečni prihodi chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Pregled prihoda po mjesecima (KM)
            </h3>
            <span className="text-xs text-slate-500">2026. godina</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val || 0} KM`, 'Zarada']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="prihod" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Izvori potencijalnih klijenata Donut Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Izvori potencijalnih klijenata
          </h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {sourceChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: pieColors[idx % pieColors.length] }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
