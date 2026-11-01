import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  LogIn,
  LogOut,
  User,
  Building,
  Mail,
  Phone,
  DollarSign,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SettingsViewProps {
  onOpenImportCSV: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenImportCSV }) => {
  const {
    theme,
    toggleTheme,
    user,
    loginGoogle,
    logout,
    exportDataToCSV,
    userSettings,
  } = useData();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl">
      {/* Brand Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img
              src="/assets/aistudio/Zanat_Flow_tehnolo_ki_logo_33f102d2.png"
              alt="ZanatFlow Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
            Personalni CRM i celokupan sistem za upravljanje freelance poslovanjem, projektima i klijentima.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 justify-center md:justify-start">
            <span className="flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-3.5 h-3.5" /> Kreirao: Ajdin Beganović
            </span>
            <span>·</span>
            <span>Verzija 1.0.0</span>
          </div>
        </div>

        <div className="shrink-0 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Prijavljeni Nalog</p>
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {user ? user.displayName || user.email : 'Gost korisnik'}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {user ? user.email : 'Nije autentificiran'}
          </p>
        </div>
      </div>

      {/* Profile Info Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
          <span>1. Profil Vlasnika Naloga</span>
          <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Autor: Ajdin Beganović
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Ime i prezime</label>
            <input
              type="text"
              readOnly
              value={user?.displayName || 'Ajdin Beganović'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Naziv sistema / brenda</label>
            <input
              type="text"
              readOnly
              value="ZanatFlow Web Studio"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">E-mail adresa korisnika</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'aydinachi@gmail.com'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Valuta poslovanja</label>
            <input
              type="text"
              readOnly
              value="KM (BAM - Konvertibilna marka)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Theme Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          2. Tema i Izgled Web Aplikacije
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Trenutna tema: {theme === 'light' ? 'Svijetla tema' : 'Tamna tema'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Prilagodite izgled aplikacije za dnevni ili noćni rad.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>Preklopi temu</span>
          </button>
        </div>
      </div>

      {/* Account Settings Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-500" /> 3. Autentifikacija i Nalog
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Status prijave:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold ${
                user
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {user ? `Prijavljen korisnik` : 'Nije prijavljen'}
            </span>
          </div>

          <div className="pt-2 flex items-center gap-3">
            {user ? (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Odjavi se sa naloga
              </button>
            ) : (
              <button
                onClick={loginGoogle}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Prijavi se sa Google računom
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSV Data Backup Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
          4. Izvoz i Uvoz Podataka
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => exportDataToCSV('leads')}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-left transition-all group"
          >
            <Download className="w-5 h-5 text-cyan-500 mb-1" />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600">
              Izvezi potencijalne klijente (.csv)
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Preuzmite kompletnu listu u Excel CSV formatu.
            </p>
          </button>

          <button
            onClick={onOpenImportCSV}
            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-cyan-500 text-left transition-all group"
          >
            <Upload className="w-5 h-5 text-cyan-500 mb-1" />
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600">
              Uvezi klijente iz CSV-a
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Masovno dodavanje kontakata sa računara.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
