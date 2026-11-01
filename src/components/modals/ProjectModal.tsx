import React, { useState, useEffect } from 'react';
import { X, Save, Briefcase, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Project, ProjectStatus, Currency } from '../../types';
import { useData } from '../../context/DataContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projectToEdit }) => {
  const { clients, addProject, updateProject } = useData();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [projectType, setProjectType] = useState('Poslovna web stranica');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(['React', 'Tailwind CSS']);
  const [techInput, setTechInput] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('U izradi');
  
  const [agreedPrice, setAgreedPrice] = useState<number>(2000);
  const [paidAmount, setPaidAmount] = useState<number>(1000);
  const [currency, setCurrency] = useState<Currency>('BAM');
  
  const [hostingProvider, setHostingProvider] = useState('Hetzner Cloud');
  const [domainRegistrar, setDomainRegistrar] = useState('UTIC / Leftor (.ba)');
  const [domainExpirationDate, setDomainExpirationDate] = useState('');
  const [hostingExpirationDate, setHostingExpirationDate] = useState('');
  
  const [githubRepo, setGithubRepo] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [adminPanelUrl, setAdminPanelUrl] = useState('');
  const [credentialsNotes, setCredentialsNotes] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
      setClientName(clients[0].companyName);
    }
  }, [clients]);

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title || '');
      setClientId(projectToEdit.clientId || '');
      setClientName(projectToEdit.clientName || '');
      setWebsiteUrl(projectToEdit.websiteUrl || '');
      setProjectType(projectToEdit.projectType || 'Poslovna web stranica');
      setDescription(projectToEdit.description || '');
      setTechnologies(projectToEdit.technologies || ['React']);
      setStartDate(projectToEdit.startDate || '');
      setDeadlineDate(projectToEdit.deadlineDate || '');
      setCompletedDate(projectToEdit.completedDate || '');
      setStatus(projectToEdit.status || 'U izradi');
      setAgreedPrice(projectToEdit.agreedPrice || 0);
      setPaidAmount(projectToEdit.paidAmount || 0);
      setCurrency(projectToEdit.currency || 'BAM');
      setHostingProvider(projectToEdit.hostingProvider || '');
      setDomainRegistrar(projectToEdit.domainRegistrar || '');
      setDomainExpirationDate(projectToEdit.domainExpirationDate || '');
      setHostingExpirationDate(projectToEdit.hostingExpirationDate || '');
      setGithubRepo(projectToEdit.githubRepo || '');
      setDeploymentUrl(projectToEdit.deploymentUrl || '');
      setAdminPanelUrl(projectToEdit.adminPanelUrl || '');
      setCredentialsNotes(projectToEdit.credentialsNotes || '');
      setNotes(projectToEdit.notes || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setWebsiteUrl('');
      setProjectType('Poslovna web stranica');
      setDescription('');
      setTechnologies(['React', 'Tailwind CSS', 'Next.js']);
      setStartDate(today);
      setDeadlineDate('');
      setCompletedDate('');
      setStatus('U izradi');
      setAgreedPrice(2500);
      setPaidAmount(1250);
      setCurrency('BAM');
      setHostingProvider('Hetzner');
      setDomainRegistrar('UTIC (.ba)');
      setDomainExpirationDate('');
      setHostingExpirationDate('');
      setGithubRepo('');
      setDeploymentUrl('');
      setAdminPanelUrl('');
      setCredentialsNotes('');
      setNotes('');
    }
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (t: string) => {
    setTechnologies(technologies.filter((item) => item !== t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Naziv projekta je obavezan.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const finalClientName = selectedClient ? selectedClient.companyName : clientName || 'Samostalni projekat';

    setIsSubmitting(true);
    setErrorMsg('');

    const remaining = Math.max(0, agreedPrice - paidAmount);

    try {
      if (projectToEdit) {
        await updateProject(projectToEdit.id, {
          title,
          clientId,
          clientName: finalClientName,
          websiteUrl,
          projectType,
          description,
          technologies,
          startDate,
          deadlineDate,
          completedDate,
          status,
          agreedPrice: Number(agreedPrice),
          paidAmount: Number(paidAmount),
          remainingAmount: Number(remaining),
          currency,
          hostingProvider,
          domainRegistrar,
          domainExpirationDate,
          hostingExpirationDate,
          githubRepo,
          deploymentUrl,
          adminPanelUrl,
          credentialsNotes,
          notes,
        });
      } else {
        await addProject({
          title,
          clientId,
          clientName: finalClientName,
          websiteUrl,
          projectType,
          description,
          technologies,
          startDate,
          deadlineDate,
          completedDate,
          status,
          agreedPrice: Number(agreedPrice),
          paidAmount: Number(paidAmount),
          remainingAmount: Number(remaining),
          currency,
          hostingProvider,
          domainRegistrar,
          domainExpirationDate,
          hostingExpirationDate,
          githubRepo,
          deploymentUrl,
          adminPanelUrl,
          credentialsNotes,
          notes,
          attachments: [],
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch {
      setErrorMsg('Došlo je do greške pri spremanju projekta.');
      setIsSubmitting(false);
    }
  };

  const projectTypes = [
    'Landing stranica',
    'Poslovna web stranica',
    'Web shop (E-commerce)',
    'Redizajn & Optimizacija',
    'Web Aplikacija / CRM',
    'Tehničko Održavanje',
    'Ostalo',
  ];

  const projectStatuses: ProjectStatus[] = [
    'Planiranje',
    'U izradi',
    'Čeka se klijent',
    'Testiranje',
    'Završeno',
    'Održavanje',
    'Arhivirano',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {projectToEdit ? 'Uredi projekat' : 'Novi projekat ili web stranica'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Osnovno */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
              1. Osnovni Podaci o Projektu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Naziv projekta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Redizajn i izrada web prezentacije Hotel Central"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Povezani Klijent
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const sel = clients.find((c) => c.id === e.target.value);
                    if (sel) setClientName(sel.companyName);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="">Samostalni projekat (Nema klijenta)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vrsta projekta
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {projectTypes.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL web stranice
                </label>
                <input
                  type="text"
                  placeholder="https://hotelcentral.ba"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status projekta
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none font-semibold"
                >
                  {projectStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Opis i ciljevi projekta
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tehnologije i Finansije */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
              2. Tehnologije i Finansijski Ugovor
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Korištene tehnologije
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="npr. React, Next.js, WordPress..."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                  >
                    Dodaj
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ugovorena cijena
                </label>
                <input
                  type="number"
                  min={0}
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Uplaćeni iznos
                </label>
                <input
                  type="number"
                  min={0}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
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
                  Datum početka
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Rok završetka
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stvarni datum završetka
                </label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tehničke Informacije */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3">
              3. Hosting, Domena i Tehnički Linkovi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hosting Provider
                </label>
                <input
                  type="text"
                  placeholder="npr. Hetzner, Vercel, Leftor"
                  value={hostingProvider}
                  onChange={(e) => setHostingProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Registrar domene
                </label>
                <input
                  type="text"
                  placeholder="npr. UTIC (.ba), Namecheap"
                  value={domainRegistrar}
                  onChange={(e) => setDomainRegistrar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Datum isteka domene
                </label>
                <input
                  type="date"
                  value={domainExpirationDate}
                  onChange={(e) => setDomainExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Datum isteka hostina
                </label>
                <input
                  type="date"
                  value={hostingExpirationDate}
                  onChange={(e) => setHostingExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Repozitorij
                </label>
                <input
                  type="text"
                  placeholder="https://github.com/user/repo"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Deployment URL
                </label>
                <input
                  type="text"
                  placeholder="https://project.vercel.app"
                  value={deploymentUrl}
                  onChange={(e) => setDeploymentUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Referenca na pristupne podatke (Sigurne bilješke - bez običnih lozinki)
                </label>
                <input
                  type="text"
                  placeholder="npr. Podaci u Bitwarden trezoru (Folder: Hotel Central)"
                  value={credentialsNotes}
                  onChange={(e) => setCredentialsNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Spremanje...' : 'Sačuvaj projekat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
