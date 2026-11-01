import React, { useState, useEffect } from 'react';
import { X, Save, Tag, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { ServiceItem, Currency } from '../../types';
import { useData } from '../../context/DataContext';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: ServiceItem | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, serviceToEdit }) => {
  const { addService, updateService } = useData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(1500);
  const [currency, setCurrency] = useState<Currency>('BAM');
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState<number>(10);
  const [includedFeatures, setIncludedFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [optionalAddons, setOptionalAddons] = useState<string[]>([]);
  const [addonInput, setAddonInput] = useState('');
  const [isPopular, setIsPopular] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name || '');
      setDescription(serviceToEdit.description || '');
      setBasePrice(serviceToEdit.basePrice || 0);
      setCurrency(serviceToEdit.currency || 'BAM');
      setEstimatedDeliveryDays(serviceToEdit.estimatedDeliveryDays || 7);
      setIncludedFeatures(serviceToEdit.includedFeatures || []);
      setOptionalAddons(serviceToEdit.optionalAddons || []);
      setIsPopular(serviceToEdit.isPopular || false);
    } else {
      setName('');
      setDescription('');
      setBasePrice(1500);
      setCurrency('BAM');
      setEstimatedDeliveryDays(10);
      setIncludedFeatures(['Responzivan dizajn', 'Brzina 90+', 'SEO Optimizacija']);
      setOptionalAddons(['Dvojezičnost (+300 KM)']);
      setIsPopular(false);
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (featureInput.trim() && !includedFeatures.includes(featureInput.trim())) {
      setIncludedFeatures([...includedFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleAddAddon = () => {
    if (addonInput.trim() && !optionalAddons.includes(addonInput.trim())) {
      setOptionalAddons([...optionalAddons, addonInput.trim()]);
      setAddonInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Naziv usluge je obavezan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (serviceToEdit) {
        await updateService(serviceToEdit.id, {
          name,
          description,
          basePrice: Number(basePrice),
          currency,
          estimatedDeliveryDays: Number(estimatedDeliveryDays),
          includedFeatures,
          optionalAddons,
          isPopular,
        });
      } else {
        await addService({
          name,
          description,
          basePrice: Number(basePrice),
          currency,
          estimatedDeliveryDays: Number(estimatedDeliveryDays),
          includedFeatures,
          optionalAddons,
          isPopular,
        });
      }

      setIsSubmitting(false);
      onClose();
    } catch {
      setErrorMsg('Greška pri spremanju usluge.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {serviceToEdit ? 'Uredi uslugu' : 'Nova usluga u cjenovniku'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Naziv usluge *
            </label>
            <input
              type="text"
              required
              placeholder="npr. Izrada Poslovne Web Stranice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Početna cijena
              </label>
              <input
                type="number"
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
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
                <option value="BAM">KM</option>
                <option value="EUR">€</option>
                <option value="USD">$</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Rok (dana)
              </label>
              <input
                type="number"
                min={1}
                value={estimatedDeliveryDays}
                onChange={(e) => setEstimatedDeliveryDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Detaljan opis usluge
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Included Features */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Uključene stavke / funkcionalnosti
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="npr. CMS panel za samostalno uređivanje"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              >
                Dodaj
              </button>
            </div>

            <ul className="space-y-1">
              {includedFeatures.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-slate-700 dark:text-slate-300">✓ {f}</span>
                  <button
                    type="button"
                    onClick={() => setIncludedFeatures(includedFeatures.filter((_, index) => index !== i))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
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
              {isSubmitting ? 'Spremanje...' : 'Sačuvaj u cjenovnik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
