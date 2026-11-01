import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Globe,
  Github,
  Server,
  Key,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  FileText,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Project, ProjectStatus } from '../../types';
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
  getProjectStatusBadgeClass,
} from '../../utils/formatters';

interface ProjectsViewProps {
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenNewProject, onEditProject }) => {
  const { projects, deleteProject } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.websiteUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Da li ste sigurni da želite obrisati projekat "${title}"?`)) {
      await deleteProject(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Projekti i Evidencija Web Stranica ({projects.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tehničke informacije, hosting i domene, repozitoriji i finansijski status izrade.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Kreiraj projekat
        </button>
      </div>

      {/* Expiration Warnings Ribbon */}
      {projects.some((p) => {
        const domainDays = getDaysUntil(p.domainExpirationDate);
        const hostingDays = getDaysUntil(p.hostingExpirationDate);
        return (domainDays > 0 && domainDays <= 30) || (hostingDays > 0 && hostingDays <= 30);
      }) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold">Upozorenje o isteku domene ili hostinga!</h4>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Neki vaši klijentski projekti imaju domene ili hosting pakete koji ističu u narednih 30 dana. Provjerite kartice projekata u nastavku.
            </p>
          </div>
        </div>
      )}

      {/* Search & Status Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži projekte po nazivu, klijentu ili URL-u..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">Svi statusi</option>
          <option value="Planiranje">Planiranje</option>
          <option value="U izradi">U izradi</option>
          <option value="Čeka se klijent">Čeka se klijent</option>
          <option value="Testiranje">Testiranje</option>
          <option value="Završeno">Završeno</option>
          <option value="Održavanje">Održavanje</option>
          <option value="Arhivirano">Arhivirano</option>
        </select>
      </div>

      {/* Projects Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const domainDaysLeft = getDaysUntil(project.domainExpirationDate);
          const hostingDaysLeft = getDaysUntil(project.hostingExpirationDate);

          const domainExpiringSoon = domainDaysLeft > 0 && domainDaysLeft <= 30;
          const hostingExpiringSoon = hostingDaysLeft > 0 && hostingDaysLeft <= 30;

          return (
            <div
              key={project.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {project.projectType}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Klijent: {project.clientName}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${getProjectStatusBadgeClass(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Technologies Badges */}
              {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* Technical Links & Hosting Info */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                {/* Web & Deployment Links */}
                <div className="flex flex-wrap items-center gap-3">
                  {project.websiteUrl && (
                    <a
                      href={project.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" /> Web Stranica <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {project.githubRepo && (
                    <a
                      href={project.githubRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                    >
                      <Github className="w-3.5 h-3.5" /> GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {project.adminPanelUrl && (
                    <a
                      href={project.adminPanelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                    >
                      <Key className="w-3.5 h-3.5" /> Admin Panel
                    </a>
                  )}
                </div>

                {/* Domain & Hosting Alerts */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Domena ({project.domainRegistrar || 'Registrar'}):</span>
                    <p
                      className={`font-semibold ${
                        domainExpiringSoon
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {formatDate(project.domainExpirationDate)}
                      {domainExpiringSoon && ` (Isteče za ${domainDaysLeft}d!)`}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500">Hosting ({project.hostingProvider || 'Provider'}):</span>
                    <p
                      className={`font-semibold ${
                        hostingExpiringSoon
                          ? 'text-rose-600 dark:text-rose-400 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {formatDate(project.hostingExpirationDate)}
                      {hostingExpiringSoon && ` (Isteče za ${hostingDaysLeft}d!)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Status Footer & Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Finansije projekta</span>
                  <p className="font-bold font-mono text-slate-900 dark:text-slate-100">
                    Ugovoreno: {formatCurrency(project.agreedPrice, project.currency)}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Uplaćeno: {formatCurrency(project.paidAmount, project.currency)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditProject(project)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Uredi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Obriši"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
