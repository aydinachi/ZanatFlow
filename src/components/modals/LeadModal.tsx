import React, { useState, useEffect } from 'react';
import { X, Save, Target, AlertCircle } from 'lucide-react';
import { Lead, LeadStatus, Priority, LeadSource, Currency } from '../../types';
import { useData } from '../../context/DataContext';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadToEdit?: Lead | null;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, leadToEdit }) => {
  const { addLead, updateLead } = useData();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('');
  const [industry, setIndustry] = useState('');
  const [source, setSource] = useState<LeadSource>('Google Maps');
  const [serviceType, setServiceType] = useState('Izrada web stranice');
  const [currentWebsiteQuality, setCurrentWebsiteQuality] = useState<'Nema web' | 'Zastarjela' | 'Nekvalitetna' | 'Prosječna' | 'Dobra'>('Zastarjela');
  const [identifiedProblems, setIdentifiedProblems] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(1500);
  const [currency, setCurrency] = useState<Currency>('BAM');
  const [priority, setPriority] = useState<Priority>('Srednji');
  const [probability, setProbability] = useState<number>(60);
  const [status, setStatus] = useState<LeadStatus>('Novi potencijalni klijent');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setCompanyName(leadToEdit.companyName || '');
      setContactName(leadToEdit.contactName || '');
      setEmail(leadToEdit.email || '');
      setPhone(leadToEdit.phone || '');
      setWebsite(leadToEdit.website || '');
      setCity(leadToEdit.city || '');
      setIndustry(leadToEdit.industry || '');
      setSource(leadToEdit.source || 'Google Maps');
      setServiceType(leadToEdit.serviceType || 'Izrada web stranice');
      setCurrentWebsiteQuality(leadToEdit.currentWebsiteQuality || 'Zastarjela');
      setIdentifiedProblems(leadToEdit.identifiedProblems || '');
      setProposedSolution(leadToEdit.proposedSolution || '');
      setEstimatedValue(leadToEdit.estimatedValue || 0);
      setCurrency(leadToEdit.currency || 'BAM');
      setPriority(leadToEdit.priority || 'Srednji');
      setProbability(leadToEdit.probability || 50);
      setStatus(leadToEdit.status || 'Novi potencijalni klijent');
      setNotes(leadToEdit.notes || '');
      setNextFollowUpDate(leadToEdit.nextFollowUpDate || '');
    } else {
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setWebsite('');
      setCity('Sarajevo');
      setIndustry('Ugostiteljstvo & Turizam');
      setSource('Google Maps');
      setServiceType('Redizajn i izrada web stranice');
      setCurrentWebsiteQuality('Zastarjela');
      setIdentifiedProblems('');
      setProposedSolution('');
      setEstimatedValue(2000);
      setCurrency('BAM');
      setPriority('Srednji');
      setProbability(60);
      setStatus('Novi potencijalni klijent');
      setNotes('');
      setNextFollowUpDate('');
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorMsg('Naziv firme je obavezno polje.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (leadToEdit) {
        await updateLead(leadToEdit.id, {
          companyName,
          contactName,
          email,
          phone,
          website,
          city,
          industry,
          source,
          serviceType,
          currentWebsiteQuality,
          identifiedProblems,
          proposedSolution,
          estimatedValue: Number(estimatedValue),
          currency,
          priority,
          probability: Number(probability),
          status,
          notes,
          nextFollowUpDate,
        });
      } else {
        await addLead({
          companyName,
          contactName,
          email,
          phone,
          website,
          city,
          industry,
          source,
          serviceType,
          currentWebsiteQuality,
          identifiedProblems,
          proposedSolution,
          estimatedValue: Number(estimatedValue),
          currency,
          priority,
          probability: Number(probability),
          status,
          notes,
          nextFollowUpDate,
          lastContactDate: new Date().toISOString().split('T')[0],
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Došlo je do greške pri spremanju podataka.');
      setIsSubmitting(false);
    }
  };

  const leadSources: LeadSource[] = [
    'Google Maps',
    'Google pretraga',
    'LinkedIn',
    'Facebook',
    'Instagram',
    'Preporuka',
    'Freelance platforma',
    'Direktni kontakt',
    'Ostalo',
  ];

  const leadStatuses: LeadStatus[] = [
    'Novi potencijalni klijent',
    'Istražen',
    'Kontaktiran',
    'Poruka poslana',
    'Potrebno ponovno javljanje',
    'Odgovorio',
    'Pregovori',
    'Ponuda poslana',
    'Dobijen posao',
    'Izgubljen posao',
    'Nezainteresovan',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {leadToEdit ? 'Uredi potencijalnog klijenta' : 'Novi potencijalni klijent'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Osnovni Podaci */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              1. Osnovni Podaci i Kontakt
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Naziv firme *
                </label>
                <input
                  type="text"
                  required
                  placeholder="npr. Restoran Bašča d.o.o."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kontakt osoba
                </label>
                <input
                  type="text"
                  placeholder="npr. Mirza Smajić (Vlasnik)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail adresa
                </label>
                <input
                  type="email"
                  placeholder="info@firma.ba"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Broj telefona
                </label>
                <input
                  type="text"
                  placeholder="+387 61 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Trenutna web stranica
                </label>
                <input
                  type="text"
                  placeholder="https://firma.ba"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Grad i Država
                </label>
                <input
                  type="text"
                  placeholder="Sarajevo, BiH"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Djelatnost
                </label>
                <input
                  type="text"
                  placeholder="npr. Ugostiteljstvo, Zdravstvo, IT..."
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Izvor pronalaska
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {leadSources.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Poslovna Prilika */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              2. Poslovna Prilika i Analiza Stranice
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Potrebna usluga
                </label>
                <input
                  type="text"
                  placeholder="npr. Redizajn + QR Meni + Online Rezervacija"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kvalitet trenutnog saajta
                </label>
                <select
                  value={currentWebsiteQuality}
                  onChange={(e) => setCurrentWebsiteQuality(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Nema web">Nema web stranicu</option>
                  <option value="Zastarjela">Zastarjela stranica</option>
                  <option value="Nekvalitetna">Nekvalitetna / Nebrza</option>
                  <option value="Prosječna">Prosječna stranica</option>
                  <option value="Dobra">Dobra stranica (traže nadogradnju)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Uočeni problemi na sajtu / u poslovanju
                </label>
                <textarea
                  rows={2}
                  placeholder="Opši šta nedostaje na njihovoj stranici ili u online prezentaciji..."
                  value={identifiedProblems}
                  onChange={(e) => setIdentifiedProblems(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prijedlog mog rješenja
                </label>
                <textarea
                  rows={2}
                  placeholder="Šta planiram predložiti ili ponuditi klijentu..."
                  value={proposedSolution}
                  onChange={(e) => setProposedSolution(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Finansije i Status */}
          <div>
            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
              3. Vrijednost, Prioritet i Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Procijenjena vrijednost
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-20 px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="BAM">KM</option>
                    <option value="EUR">€</option>
                    <option value="USD">$</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prioritet prilike
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Nizak">Nizak</option>
                  <option value="Srednji">Srednji</option>
                  <option value="Visok">Visok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vjerovatnoća posla ({probability}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status prodajnog procesa
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                >
                  {leadStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sljedeći datum javljanja
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Interna napomena
                </label>
                <textarea
                  rows={2}
                  placeholder="Zabilješke o klijentu, preferencijama, budžetu..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Spremanje...' : 'Sačuvaj podatke'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
