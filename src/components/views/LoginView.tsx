import React, { useState } from 'react';
import {
  Target,
  Briefcase,
  Wallet,
  CheckSquare,
  ArrowRight,
  Code2,
  Sparkles,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  AlertTriangle,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface LoginViewProps {
  onContinueAsGuest?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onContinueAsGuest }) => {
  const { loginGoogle, loginEmail, registerEmail, isLoading } = useData();
  const [authMode, setAuthMode] = useState<'google' | 'email_login' | 'email_register'>('google');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDomainNotice, setShowDomainNotice] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowDomainNotice(false);
    try {
      setIsSubmitting(true);
      await loginGoogle();
    } catch (error: any) {
      console.error('Greška pri Google prijavi:', error);
      const code = error?.code || '';
      if (code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
        setShowDomainNotice(true);
        setErrorMessage('Vaša Vercel domena nije još dodana u autorizovane domene na Firebase-u.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('Skočni prozor (popup) za prijavu je zatvoren prije završetka.');
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('Vaš preglednik je blokirao skočni prozor. Dozvolite popup ili upotrijebite prijavu e-mailom.');
      } else {
        setErrorMessage(error?.message || 'Došlo je do greške pri prijavi sa Google računom.');
        setShowDomainNotice(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Molimo unesite email i lozinku.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setShowDomainNotice(false);

    try {
      setIsSubmitting(true);
      if (authMode === 'email_register') {
        await registerEmail(email, password);
        setSuccessMessage('Nalog je uspješno kreiran! Ulogovani ste.');
      } else {
        await loginEmail(email, password);
        setSuccessMessage('Uspješna prijava!');
      }
    } catch (error: any) {
      console.error('Email Auth error:', error);
      const code = error?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('Neispravan e-mail ili lozinka.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Korisnik sa ovim e-mailom već postoji. Izaberite "Prijava" umjesto registracije.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Lozinka je preslaba. Unesite bar 6 karaktera.');
      } else {
        setErrorMessage(error?.message || 'Greška pri autentifikaciji e-mailom.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Soft Background Gradients */}
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
      <main className="px-6 py-10 max-w-5xl mx-auto w-full z-10 flex flex-col items-center text-center space-y-8">
        {/* Brand Banner */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Personalni CRM & Sistem za Upravljanje Poslovanjem</span>
          </div>

          <div className="flex justify-center my-3">
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

        {/* Domain Warning Banner for Vercel Setup */}
        {showDomainNotice && (
          <div className="w-full max-w-md p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Globe className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Kako omogućiti Google prijavu na Vercel-u:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Firebase iz sigurnosnih razloga blokira prijavu sa nepoznatih domena. 
              Idite u <strong>Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains</strong> i dodajte vašu Vercel domenu (npr. <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">vaša-aplikacija.vercel.app</code>).
            </p>
            <p className="text-[11px] font-medium text-amber-900">
              U međuvremenu, upotrijebite opciju <strong>Email / Lozinka</strong> ispod za instant prijavu!
            </p>
          </div>
        )}

        {/* Error/Success Feedback */}
        {errorMessage && (
          <div className="w-full max-w-md p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 text-left">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="w-full max-w-md p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Login Card */}
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-left">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('google'); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                authMode === 'google' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google Prijava
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email_login'); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                authMode === 'email_login' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email Prijava
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email_register'); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                authMode === 'email_register' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Novi Nalog
            </button>
          </div>

          {/* TAB 1: GOOGLE LOGIN */}
          {authMode === 'google' && (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <h2 className="text-base font-bold text-slate-900">Prijava sa Google računom</h2>
                <p className="text-xs text-slate-500">
                  Jedan klik za brzu i sigurnu prijavu preko vašeg Google računa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting || isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-50"
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
                <span>{isSubmitting ? 'Prijavljivanje...' : 'Prijavi se sa Google računom'}</span>
              </button>
            </div>
          )}

          {/* TAB 2 & 3: EMAIL LOGIN / REGISTER */}
          {(authMode === 'email_login' || authMode === 'email_register') && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1 text-center">
                <h2 className="text-base font-bold text-slate-900">
                  {authMode === 'email_register' ? 'Kreirajte novi nalog' : 'Prijava putem e-maila'}
                </h2>
                <p className="text-xs text-slate-500">
                  {authMode === 'email_register'
                    ? 'Unesite vaš email i lozinku za registraciju.'
                    : 'Unesite pristupne podatke za ulazak u aplikaciju.'}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">E-mail adresa</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="moj.email@domain.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lozinka</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {authMode === 'email_register' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isSubmitting ? 'Registracija...' : 'Registruj se'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {onContinueAsGuest && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
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

