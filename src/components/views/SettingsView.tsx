import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
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
  Key,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  Send,
  Lock,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SettingsViewProps {
  onOpenImportCSV: () => void;
}

type SettingsTab = 'general' | 'integrations' | 'backup';

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenImportCSV }) => {
  const {
    theme,
    toggleTheme,
    user,
    loginGoogle,
    logout,
    exportDataToCSV,
    userSettings,
    salesIntegrations,
    updateSalesIntegration,
  } = useData();

  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');

  // Find existing integrations
  const gmailIntegration = salesIntegrations.find((i) => i.channel === 'gmail');
  const whatsAppIntegration = salesIntegrations.find((i) => i.channel === 'whatsapp');

  // Email Integration State
  const [emailAddress, setEmailAddress] = useState<string>(
    gmailIntegration?.accountEmail || user?.email || 'ajdin.beganovic.dev@gmail.com'
  );
  const [senderName, setSenderName] = useState<string>(
    gmailIntegration?.senderName || userSettings?.fullName || 'Ajdin Beganović'
  );

  // WhatsApp Integration State
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>(
    whatsAppIntegration?.phoneNumber || '+387 61 000 000'
  );
  const [whatsAppPhoneNumberId, setWhatsAppPhoneNumberId] = useState<string>(
    whatsAppIntegration?.phoneNumberId || ''
  );
  const [whatsAppAccessToken, setWhatsAppAccessToken] = useState<string>(
    whatsAppIntegration?.accessToken || ''
  );

  const [showAccessToken, setShowAccessToken] = useState<boolean>(false);

  // Action Loading & Toast State
  const [isTestingEmail, setIsTestingEmail] = useState<boolean>(false);
  const [isTestingWhatsApp, setIsTestingWhatsApp] = useState<boolean>(false);
  const [isSavingEmail, setIsSavingEmail] = useState<boolean>(false);
  const [isSavingWhatsApp, setIsSavingWhatsApp] = useState<boolean>(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --------------------------------------------------------------------------
  // ACTIONS: EMAIL INTEGRATION
  // --------------------------------------------------------------------------
  const handleSaveEmailIntegration = async () => {
    setIsSavingEmail(true);
    try {
      // 1. Save to server API
      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'gmail',
          accountEmail: emailAddress,
          senderName: senderName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Greška pri čuvanju email integracije');
      }

      // 2. Update Context state & Firestore
      await updateSalesIntegration('gmail', true, {
        accountEmail: emailAddress,
        senderName: senderName,
      });

      showToast('Email postavke su uspješno sačuvane na serveru i u Firestore bazi!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Greška pri čuvanju: ${err.message}`, 'error');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestEmailIntegration = async () => {
    setIsTestingEmail(true);
    try {
      const res = await fetch('/api/integrations/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountEmail: emailAddress }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Greška pri verifikaciji emaila');

      showToast(data.message, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Greška pri testiranju: ${err.message}`, 'error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  // --------------------------------------------------------------------------
  // ACTIONS: WHATSAPP INTEGRATION
  // --------------------------------------------------------------------------
  const handleSaveWhatsAppIntegration = async () => {
    setIsSavingWhatsApp(true);
    try {
      const isConnected = !!(whatsAppPhoneNumberId.trim() && whatsAppAccessToken.trim());

      // 1. Save to server API
      const res = await fetch('/api/integrations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          phoneNumber: whatsAppPhone,
          phoneNumberId: whatsAppPhoneNumberId,
          accessToken: whatsAppAccessToken,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Greška pri čuvanju WhatsApp integracije');
      }

      // 2. Update Context state & Firestore
      await updateSalesIntegration('whatsapp', isConnected, {
        phoneNumber: whatsAppPhone,
        phoneNumberId: whatsAppPhoneNumberId,
        accessToken: whatsAppAccessToken,
      });

      showToast('WhatsApp Business API kredencijali su sačuvani na serveru!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Greška pri čuvanju: ${err.message}`, 'error');
    } finally {
      setIsSavingWhatsApp(false);
    }
  };

  const handleTestWhatsAppIntegration = async () => {
    setIsTestingWhatsApp(true);
    try {
      const res = await fetch('/api/integrations/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: whatsAppPhoneNumberId,
          accessToken: whatsAppAccessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Greška pri verifikaciji WhatsApp veze');

      await updateSalesIntegration('whatsapp', true, {
        phoneNumber: whatsAppPhone,
        phoneNumberId: whatsAppPhoneNumberId,
        accessToken: whatsAppAccessToken,
        lastTestedAt: new Date().toISOString().split('T')[0],
      });

      showToast(data.message, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Verifikacija neuspješna: ${err.message}`, 'error');
    } finally {
      setIsTestingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-5xl font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Brand & Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <img
              src="/assets/aistudio/Zanat_Flow_tehnolo_ki_logo_33f102d2.png"
              alt="ZanatFlow Logo"
              className="h-9 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight">Postavke Sistema & Integracije</h1>
          <p className="text-xs text-slate-300 max-w-md">
            Konfigurišite profil poslovanja, vanjske komunikacijske kanale (Email & WhatsApp API) i sigurnosne kopije.
          </p>
        </div>

        <div className="shrink-0 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-1 backdrop-blur-md">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Aktivni Nalog</p>
          <p className="text-xs font-bold text-white">
            {user ? user.displayName || user.email : 'Gost korisnik'}
          </p>
          <p className="text-[10px] text-emerald-400 font-semibold">
            {user ? 'Prijavljen (Firebase Auth)' : 'Lokalni način rada'}
          </p>
        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'integrations'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-cyan-300" />
          <span>Integracije (Email & WhatsApp)</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'general'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil & Tema</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Uvoz & Izvoz Podataka</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTEGRATIONS (EMAIL & WHATSAPP API) */}
      {/* ========================================================================= */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          {/* SECURITY & SERVER STORAGE NOTICE BANNER */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-200">Sigurna Serverska Pohrana Kredencijala</p>
              <p className="text-[11px] leading-relaxed text-emerald-300/80">
                Vaši e-mail podaci i WhatsApp API pristupni ključevi pohranjuju se na siguran način na serverskoj strani i u vašoj privatnoj Firestore bazi. Pristup je omogućen isključivo vama i za slanje <strong>odobrenih prodajnih poruka</strong>.
              </p>
            </div>
          </div>

          {/* 1. EMAIL / GMAIL INTEGRATION CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    Email / Gmail API Integracija
                  </h2>
                  <p className="text-xs text-slate-500">
                    Primarni e-mail kanal za slanje odobrenih ponuda klijentima.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Povezano & Aktivno</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  E-mail Adresa Pošiljaoca
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="npr. ajdin.beganovic.dev@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ime Pošiljaoca (Prikaz u potpisu)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="npr. Ajdin Beganović"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Google OAuth Quick Connect Status */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white">Google OAuth Autentifikacija</p>
                <p className="text-slate-500 text-[11px]">
                  {user ? `Povezan sa Google nalogom: ${user.email}` : 'Google nalog nije povezan.'}
                </p>
              </div>

              {!user && (
                <button
                  onClick={loginGoogle}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" /> Poveži Google Račun
                </button>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleTestEmailIntegration}
                disabled={isTestingEmail}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingEmail ? 'animate-spin' : ''}`} />
                <span>Testiraj Email Vezu</span>
              </button>

              <button
                onClick={handleSaveEmailIntegration}
                disabled={isSavingEmail}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingEmail ? 'Spremanje...' : 'Sačuvaj Email Postavke'}</span>
              </button>
            </div>
          </div>

          {/* 2. WHATSAPP BUSINESS API INTEGRATION CARD */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    WhatsApp Business API Integracija
                  </h2>
                  <p className="text-xs text-slate-500">
                    Slanje direktnih WhatsApp poruka preko Meta Graph Cloud API-ja.
                  </p>
                </div>
              </div>

              {/* Connection Status Badge */}
              <div className="shrink-0">
                {whatsAppIntegration?.isConnected ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Povezano & Verifikovano</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nije povezano (Opcionalno)</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    WhatsApp Broj Telefona
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={whatsAppPhone}
                      onChange={(e) => setWhatsAppPhone(e.target.value)}
                      placeholder="+387 61 000 000"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Meta Phone Number ID
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={whatsAppPhoneNumberId}
                      onChange={(e) => setWhatsAppPhoneNumberId(e.target.value)}
                      placeholder="npr. 109283746519283"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Meta Permanent Access Token (API Ključ)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showAccessToken ? 'text' : 'password'}
                    value={whatsAppAccessToken}
                    onChange={(e) => setWhatsAppAccessToken(e.target.value)}
                    placeholder="EAAG..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 pt-0.5">
                  Niste još podesili Meta Graph API? Poruke možete slati i direktnim otvaranjem WhatsApp razgovora sa klijentom na mobitelu.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleTestWhatsAppIntegration}
                disabled={isTestingWhatsApp || !whatsAppPhoneNumberId || !whatsAppAccessToken}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingWhatsApp ? 'animate-spin' : ''}`} />
                <span>Testiraj WhatsApp Vezu</span>
              </button>

              <button
                onClick={handleSaveWhatsAppIntegration}
                disabled={isSavingWhatsApp}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingWhatsApp ? 'Spremanje...' : 'Sačuvaj WhatsApp Kredencijale'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GENERAL SETTINGS & PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Profile Info Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>Profil Vlasnika Naloga</span>
              <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                Autor: Ajdin Beganović
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Ime i prezime</label>
                <input
                  type="text"
                  readOnly
                  value={user?.displayName || 'Ajdin Beganović'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Naziv sistema / brenda</label>
                <input
                  type="text"
                  readOnly
                  value="ZanatFlow Web Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">E-mail adresa korisnika</label>
                <input
                  type="text"
                  readOnly
                  value={user?.email || emailAddress}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-semibold">Valuta poslovanja</label>
                <input
                  type="text"
                  readOnly
                  value="KM (BAM - Konvertibilna marka)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Theme Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Tema i Izgled Web Aplikacije
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
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <span>Preklopi temu</span>
              </button>
            </div>
          </div>

          {/* Account Settings Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" /> Autentifikacija i Nalog
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Status prijave:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold ${
                    user
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {user ? `Prijavljen korisnik` : 'Lokalni način rada'}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BACKUP & DATA EXPORT */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
            Izvoz i Uvoz Podataka
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => exportDataToCSV('leads')}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition-all group shadow-xs"
            >
              <Download className="w-5 h-5 text-cyan-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600">
                Izvezi potencijalne klijente (.csv)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Preuzmite kompletnu listu u Excel CSV formatu.
              </p>
            </button>

            <button
              onClick={onOpenImportCSV}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 text-left transition-all group shadow-xs"
            >
              <Upload className="w-5 h-5 text-cyan-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600">
                Uvezi klijente iz CSV-a
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Masovno dodavanje kontakata sa računara.</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
