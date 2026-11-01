import { Currency, Priority, LeadStatus, ProjectStatus } from '../types';

export function formatCurrency(amount: number, currency: Currency = 'BAM'): string {
  const formattedNumber = new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  switch (currency) {
    case 'EUR':
      return `${formattedNumber} €`;
    case 'USD':
      return `$${formattedNumber}`;
    case 'BAM':
    default:
      return `${formattedNumber} KM`;
  }
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('bs-BA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysAgo(dateString?: string): number {
  if (!dateString) return 0;
  const past = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - past) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDaysUntil(dateString?: string): number {
  if (!dateString) return 0;
  const target = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getPriorityBadgeClass(priority: Priority): string {
  switch (priority) {
    case 'Visok':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50';
    case 'Srednji':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
    case 'Nizak':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
}

export function getLeadStatusBadgeClass(status: LeadStatus): string {
  switch (status) {
    case 'Dobijen posao':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    case 'Ponuda poslana':
    case 'Pregovori':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
    case 'Odgovorio':
    case 'Kontaktiran':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    case 'Potrebno ponovno javljanje':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold';
    case 'Izgubljen posao':
    case 'Nezainteresovan':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800';
    case 'Novi potencijalni klijent':
    case 'Istražen':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
}

export function getProjectStatusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case 'Završeno':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
    case 'U izradi':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800';
    case 'Održavanje':
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800';
    case 'Čeka se klijent':
    case 'Testiranje':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
    case 'Planiranje':
    case 'Arhivirano':
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
}
