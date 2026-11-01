import React, { useState } from 'react';
import {
  Target,
  Briefcase,
  Wallet,
  CheckSquare,
  Compass,
  ArrowRight,
  ShieldCheck,
  Code2,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface LoginViewProps {
  onContinueAsGuest?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onContinueAsGuest }) => {
  const { loginGoogle, isLoading } = useData();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      await loginGoogle();
    } catch (error) {
      console.error('Greška pri prijavi:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Subtle Soft Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-100/40 blur-3xl pointer-events-none rounded-full" />

      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/Sjajni_plavo-cijan_Z_logo_s_strelicom_a7ffc97a.png"
            alt="ZanatFlow Logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Zanat<span className="text-indigo-600">Flow</span>
          </span>
        </div>

        <div className="text-xs text-slate-600 font-medium hidden sm:flex items-center gap-1.5">
          <Code2 className="w-4 h-4 text-indigo-600" />
          <span>Kreirao <strong className="text-slate-900 font-bold">Ajdin Beganović</strong></span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 py-12 max-w-5xl mx-auto w-full z-10 flex flex-col items-center text-center space-y-10">
        {/* Brand Banner */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Personalni CRM & Sistem za Upravljanje Poslovanjem</span>
          </div>

          {/* Official Full Logo sits naturally on bright background */}
          <div className="flex justify-center my-4">
            <img
              src="/assets/aistudio/Zanat_Flow_tehnolo_ki_logo_33f102d2.png"
              alt="ZanatFlow Branding"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Jedinstvena platforma za pronalaženje novih klijenata, vođenje projekata, evidenciju finansija i potpunu organizaciju vašeg freelance rada.
          </p>
        </div>

        {/* Primary Login Card */}
        <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h2 className="text-lg font-bold text-slate-900">Prijavite se na vaš nalog</h2>
            <p className="text-xs text-slate-500">
              Sigurna prijava putem Google računa za pristup vašim podacima.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn || isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? 'Prijavljivanje...' : 'Prijavi se sa Google računom'}</span>
          </button>

          {onContinueAsGuest && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={onContinueAsGuest}
                className="text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors inline-flex items-center gap-1"
              >
                <span>Pregledaj aplikaciju bez prijave</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left pt-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Potencijalni klijenti</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Pronalaženje firmi sa Google Maps i društvenih mreža te vođenje kroz prodajni lijevak.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Projekti & Web Stranice</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Praćenje statusa izrade web stranica, obnove domena, hostinga i pristupnih podataka.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Finansije & Naplate</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Evidencija prihada, rashoda, neplaćenih faktura i obračun mjesečne neto zarade.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Zadaci & Podsjetnici</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Organizacija dnevnih obaveza sa rokovima i automatskim podsjetnicima za javljanje klijentima.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-7xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-200 z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} ZanatFlow. Sva prava zadržana.</p>
        <p className="font-semibold text-slate-600">
          Autor & Developer: <span className="text-indigo-600 font-bold">Ajdin Beganović</span>
        </p>
      </footer>
    </div>
  );
};
