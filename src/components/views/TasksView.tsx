import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar as CalendarIcon,
  ListFilter,
  Check,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Target,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Task, TaskStatus, Priority } from '../../types';
import { formatDate, getPriorityBadgeClass } from '../../utils/formatters';

interface TasksViewProps {
  onOpenNewTask: () => void;
  onEditTask: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenNewTask, onEditTask }) => {
  const { tasks, toggleTaskCompleted, deleteTask, leads, projects } = useData();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'calendar'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((task) => {
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    if (activeTabFilter === 'today') {
      return task.dueDate === todayStr && task.status !== 'Završeno';
    }
    if (activeTabFilter === 'upcoming') {
      return task.dueDate > todayStr && task.status !== 'Završeno';
    }
    if (activeTabFilter === 'overdue') {
      return task.dueDate < todayStr && task.status !== 'Završeno';
    }
    if (activeTabFilter === 'completed') {
      return task.status === 'Završeno';
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Da li ste sigurni da želite obrisati ovaj zadatak?')) {
      await deleteTask(id);
    }
  };

  // Simple Interactive Month Calendar View Generator
  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

    return (
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Kalendar obaveza za {new Intl.DateTimeFormat('bs-BA', { month: 'long', year: 'numeric' }).format(now)}
          </h3>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-50/50 dark:bg-slate-800/20" />
          ))}

          {daysArray.map((day) => {
            const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter((t) => t.dueDate === formattedDayStr);
            const isToday = formattedDayStr === todayStr;

            return (
              <div
                key={day}
                className={`h-24 p-2 rounded-xl border text-left flex flex-col justify-between overflow-hidden ${
                  isToday
                    ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <span
                  className={`text-xs font-bold inline-block w-5 h-5 text-center leading-5 rounded-full ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {day}
                </span>

                <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 mt-1">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onEditTask(t)}
                      className={`px-1.5 py-0.5 text-[9px] font-semibold rounded truncate cursor-pointer ${
                        t.status === 'Završeno'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                      }`}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Zadaci i Podsjetnici ({tasks.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organizacija obaveza, rokova razvoja i podsjetnika za ponovno kontaktiranje klijenata.
          </p>
        </div>

        <button
          onClick={onOpenNewTask}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Novi zadatak
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'Svi zadaci' },
            { id: 'today', label: 'Današnji' },
            { id: 'upcoming', label: 'Nadolazeći' },
            { id: 'overdue', label: 'Zakašnjeli' },
            { id: 'completed', label: 'Završeni' },
            { id: 'calendar', label: 'Kalendar prikaz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeTabFilter === tab.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTabFilter !== 'calendar' && (
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Svi prioriteti</option>
            <option value="Visok">Visok prioritet</option>
            <option value="Srednji">Srednji prioritet</option>
            <option value="Nizak">Nizak prioritet</option>
          </select>
        )}
      </div>

      {/* Main Content Area */}
      {activeTabFilter === 'calendar' ? (
        renderCalendar()
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Završeno';
            const isOverdue = task.dueDate < todayStr && !isCompleted;
            const relatedLead = leads.find((l) => l.id === task.relatedLeadId);
            const relatedProject = projects.find((p) => p.id === task.relatedProjectId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-center justify-between gap-4 shadow-sm ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>

                      <span className="px-2 py-0.5 text-[9px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {task.type}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                        Rok: {formatDate(task.dueDate)} {isOverdue && '(ZAKAŠNJELO)'}
                      </span>

                      {relatedLead && (
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                          <Target className="w-3 h-3" /> {relatedLead.companyName}
                        </span>
                      )}

                      {relatedProject && (
                        <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                          <Briefcase className="w-3 h-3" /> {relatedProject.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEditTask(task)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Uredi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Obriši"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs italic">
              Nema zadataka za prikaz.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
