import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onClose }) => {
  const { importLeadsCSV } = useData();
  const [csvText, setCsvText] = useState('');
  const [resultMsg, setResultMsg] = useState<{ imported: number; errors: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const sampleCSV = `Naziv firme, Kontakt osoba, Email, Telefon, Grad, Djelatnost, Izvor, Vrijednost, Status
Restoran Sarajevo, Mirza Smajić, info@restoran.ba, +38761111222, Sarajevo, Ugostiteljstvo, Google Maps, 2500, Novi potencijalni klijent
Advokat Mostar, Amra Memić, amra@advokat.ba, +38736555666, Mostar, Pravne usluge, LinkedIn, 3000, Kontaktiran`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setCsvText(evt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvText.trim()) return;
    setIsImporting(true);
    const res = await importLeadsCSV(csvText);
    setResultMsg(res);
    setIsImporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Uvoz potencijalnih klijenata iz CSV-a
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {resultMsg ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Uvoz uspješno završen!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Uvezeno: <strong>{resultMsg.imported}</strong> novih klijenata. Greške:{' '}
                <strong>{resultMsg.errors}</strong> redova.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg"
              >
                Zatvori
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Odaberite `.csv` datoteku sa vašeg računara ili zalijepite tekstualni CSV sadržaj ispod.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Učitaj CSV datoteku:
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Sadržaj CSV datoteke:
                  </label>
                  <button
                    type="button"
                    onClick={() => setCsvText(sampleCSV)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Učitaj primjer CSV-a
                  </button>
                </div>
                <textarea
                  rows={6}
                  placeholder="Zalijepite CSV podatke sa zaglavljima..."
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Odustani
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={isImporting || !csvText.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isImporting ? 'Uvoženje...' : 'Pokreni uvoz'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
