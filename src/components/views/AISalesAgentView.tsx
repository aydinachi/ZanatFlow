import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  XCircle,
  FileEdit,
  RotateCcw,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  Star,
  Layers,
  Filter,
  Search,
  Check,
  Plus,
  TrendingUp,
  User,
  Settings,
  Info,
  Copy,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckSquare,
  History,
  Lock,
  PieChart as PieChartIcon,
  ThumbsDown,
  ThumbsUp,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useData } from '../../context/DataContext';
import {
  Lead,
  LeadAnalysis,
  SalesMessage,
  SalesMessageStatus,
  SalesChannel,
  SalesAgentSettings,
  FollowUpStatus,
} from '../../types';
import {
  runAiLeadAnalysis,
  runAiSalesWriter,
  sendEmailMessage,
  sendWhatsAppMessage,
} from '../../services/salesAgentService';

export type AgentSubTab =
  | 'dashboard'
  | 'analysis'
  | 'writer'
  | 'approval'
  | 'followup'
  | 'history'
  | 'settings';

export const AISalesAgentView: React.FC = () => {
  const {
    leads,
    services,
    salesSettings,
    leadAnalyses,
    salesMessages,
    salesActivities,
    salesFollowUps,
    salesIntegrations,
    updateSalesSettings,
    saveLeadAnalysis,
    saveSalesMessage,
    updateSalesMessageStatus,
    deleteSalesMessage,
    saveSalesActivity,
    saveSalesFollowUp,
    updateSalesIntegration,
    loginGoogle,
    user,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<AgentSubTab>('dashboard');

  // Lead selection state
  const [selectedLeadIdsForAnalysis, setSelectedLeadIdsForAnalysis] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });

  // Writer form state
  const [selectedLeadForWriter, setSelectedLeadForWriter] = useState<Lead | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<SalesChannel>('email');
  const [selectedLanguage, setSelectedLanguage] = useState<
    'Bosanski' | 'Hrvatski' | 'Srpski' | 'Engleski' | 'Njemački'
  >(salesSettings.defaultLanguage || 'Bosanski');
  const [selectedOfferType, setSelectedOfferType] = useState<
    'Nova web stranica' | 'Rekonstrukcija web stranice' | 'Dodatne funkcionalnosti i automatizacija'
  >('Nova web stranica');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);

  // Generated message draft in writer
  const [writerDraft, setWriterDraft] = useState<{
    subject: string;
    bodyText: string;
    reasonForContact: string;
    proposedService: string;
  } | null>(null);

  // Approval Center Modal State
  const [messageToApproveAndSend, setMessageToApproveAndSend] = useState<SalesMessage | null>(null);
  const [messageToEdit, setMessageToEdit] = useState<SalesMessage | null>(null);
  const [messageToReject, setMessageToReject] = useState<SalesMessage | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isSendingInProgress, setIsSendingInProgress] = useState(false);

  // Approval Center Filter
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('ALL');

  // Toast notification
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showNotification = (
    msg: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper Stats Calculation
  const totalAnalyzedLeads = leadAnalyses.length;
  const pendingAnalysisLeadsCount = leads.filter(
    (l) => !leadAnalyses.some((a) => a.leadId === l.id)
  ).length;
  const highPotentialLeadsCount = leadAnalyses.filter((a) => a.leadScore >= 80).length;

  const totalGeneratedMessages = salesMessages.length;
  const pendingApprovalMessagesCount = salesMessages.filter(
    (m) => m.status === 'Pending Approval'
  ).length;
  const approvedMessagesCount = salesMessages.filter((m) => m.status === 'Approved').length;
  const sentMessagesCount = salesMessages.filter((m) => m.status === 'Sent').length;
  const rejectedMessagesCount = salesMessages.filter((m) => m.status === 'Rejected').length;

  const repliedCount = salesFollowUps.filter((f) => f.status === 'Odgovorio').length;
  const interestedCount = salesFollowUps.filter((f) => f.status === 'Zainteresovan').length;

  // Gmail connection status
  const gmailIntegration = salesIntegrations.find((i) => i.channel === 'gmail');
  const isGmailConnected = gmailIntegration?.isConnected || !!user;

  // WhatsApp connection status
  const whatsAppIntegration = salesIntegrations.find((i) => i.channel === 'whatsapp');

  // Chart data for status distribution
  const chartData = [
    { name: 'Nacrt', value: salesMessages.filter((m) => m.status === 'Draft').length, color: '#94a3b8' },
    { name: 'Čeka odobrenje', value: pendingApprovalMessagesCount, color: '#f59e0b' },
    { name: 'Odobreno', value: approvedMessagesCount, color: '#3b82f6' },
    { name: 'Poslano', value: sentMessagesCount, color: '#10b981' },
    { name: 'Odbijeno', value: rejectedMessagesCount, color: '#ef4444' },
  ];

  // --------------------------------------------------------------------------
  // ACTIONS
  // --------------------------------------------------------------------------

  // Run Batch AI Lead Analysis
  const handleBatchAnalyze = async () => {
    if (selectedLeadIdsForAnalysis.length === 0) {
      showNotification('Molimo odaberite bar jednog leada za analizu.', 'info');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: selectedLeadIdsForAnalysis.length });

    let completed = 0;
    for (let i = 0; i < selectedLeadIdsForAnalysis.length; i++) {
      const leadId = selectedLeadIdsForAnalysis[i];
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        try {
          const analysis = await runAiLeadAnalysis(lead, salesSettings, services);
          await saveLeadAnalysis(analysis);
          await saveSalesActivity({
            leadId: lead.id,
            companyName: lead.companyName,
            type: 'Analiza pokrenuta',
            description: `Završena AI analiza kompanije ${lead.companyName}. Lead Score: ${analysis.leadScore}/100.`,
          });
        } catch (e) {
          console.error(`Greška pri analizi za lead ${leadId}:`, e);
        }
      }
      completed++;
      setAnalysisProgress({ current: completed, total: selectedLeadIdsForAnalysis.length });

      // Add a brief delay between requests if processing multiple items to keep under free tier rate limits
      if (i < selectedLeadIdsForAnalysis.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    }

    setIsAnalyzing(false);
    setSelectedLeadIdsForAnalysis([]);
    showNotification(`Uspješno analizirano ${completed} kompanija!`);
    setActiveSubTab('analysis');
  };

  const [customWriterPrompt, setCustomWriterPrompt] = useState<string>(salesSettings.customProposalTemplate || '');

  // Generate Message in Writer
  const handleGenerateWriterMessage = async () => {
    if (!selectedLeadForWriter) {
      showNotification('Molimo odaberite kompaniju za koju pišemo poruku.', 'info');
      return;
    }

    // Check if lead requested stop contact
    const followUpObj = salesFollowUps.find((f) => f.leadId === selectedLeadForWriter.id);
    if (followUpObj && (followUpObj.status === 'Ne kontaktirati ponovo' || followUpObj.status === 'Odbio ponudu')) {
      showNotification('Sistem je blokirao generisanje jer je klijent označio da ne želi ponude ili je odbio saradnju.', 'error');
      return;
    }

    // Find analysis or create on the fly
    let analysis = leadAnalyses.find((a) => a.leadId === selectedLeadForWriter.id);
    if (!analysis) {
      analysis = await runAiLeadAnalysis(selectedLeadForWriter, salesSettings, services);
      await saveLeadAnalysis(analysis);
    }

    setIsGeneratingMessage(true);
    try {
      const messageObj = await runAiSalesWriter(
        selectedLeadForWriter,
        analysis,
        selectedChannel,
        selectedLanguage,
        selectedOfferType,
        salesSettings,
        customWriterPrompt || salesSettings.customProposalTemplate
      );

      setWriterDraft({
        subject: messageObj.subject || '',
        bodyText: messageObj.bodyText,
        reasonForContact: messageObj.reasonForContact,
        proposedService: messageObj.proposedService,
      });

      showNotification('AI Agent je pripremio novu personalizovanu poruku na osnovu vašeg predloška!');
    } catch (e) {
      console.error(e);
      showNotification('Greška pri generisanju poruke.', 'error');
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Save Message Draft to Approval Center
  const handleSaveToApprovalCenter = async (status: 'Draft' | 'Pending Approval') => {
    if (!selectedLeadForWriter || !writerDraft) return;

    let analysis = leadAnalyses.find((a) => a.leadId === selectedLeadForWriter.id);
    if (!analysis) {
      analysis = await runAiLeadAnalysis(selectedLeadForWriter, salesSettings, services);
    }

    const newMessage: SalesMessage = {
      id: `msg-${selectedLeadForWriter.id}-${Date.now()}`,
      leadId: selectedLeadForWriter.id,
      companyName: selectedLeadForWriter.companyName,
      contactName: selectedLeadForWriter.contactName || `${selectedLeadForWriter.companyName} Tim`,
      recipientEmail: selectedLeadForWriter.email || '',
      recipientPhone: selectedLeadForWriter.phone || '',
      channel: selectedChannel,
      offerType: selectedOfferType,
      proposedService: writerDraft.proposedService,
      leadScore: analysis.leadScore,
      reasonForContact: writerDraft.reasonForContact,
      subject: selectedChannel === 'email' ? writerDraft.subject : undefined,
      bodyText: writerDraft.bodyText,
      status: status,
      language: selectedLanguage,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      userId: selectedLeadForWriter.userId || 'demo-user',
    };

    await saveSalesMessage(newMessage);
    setWriterDraft(null);
    showNotification(
      status === 'Pending Approval'
        ? 'Poruka je poslana u Approval Center na vaš pregled i odobrenje!'
        : 'Poruka je sačuvana kao nacrt.'
    );
    if (status === 'Pending Approval') {
      setActiveSubTab('approval');
    }
  };

  // Perform Final Execution of Sending Approved Message
  const handleExecuteSend = async () => {
    if (!messageToApproveAndSend) return;

    setIsSendingInProgress(true);
    try {
      // First ensure status is marked Approved
      await updateSalesMessageStatus(messageToApproveAndSend.id, 'Approved');
      const approvedMessage = { ...messageToApproveAndSend, status: 'Approved' as SalesMessageStatus };

      let result: { success: boolean; messageId?: string; error?: string } = { success: false };

      if (approvedMessage.channel === 'email') {
        result = await sendEmailMessage(approvedMessage);
      } else {
        const cleanPhone = (approvedMessage.recipientPhone || '').replace(/[^0-9]/g, '');
        if (cleanPhone) {
          const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(approvedMessage.bodyText)}`;
          window.open(waUrl, '_blank');
          result = { success: true, messageId: `wa-${Date.now()}` };
        } else {
          result = await sendWhatsAppMessage(approvedMessage);
        }
      }

      if (result.success) {
        await updateSalesMessageStatus(approvedMessage.id, 'Sent');
        await saveSalesActivity({
          leadId: approvedMessage.leadId,
          companyName: approvedMessage.companyName,
          type: 'Poruka poslana',
          channel: approvedMessage.channel,
          description: `Poruka poslana za ${approvedMessage.companyName} putem ${approvedMessage.channel.toUpperCase()}.`,
        });
        showNotification(`Poruka za ${approvedMessage.companyName} je uspješno poslana! 🎉`);
      } else {
        // If API fails or is not connected, keep as Approved and allow manual send options
        showNotification(
          `Slanje putem API-ja nije izvršeno (${result.error || 'Nije povezano'}). Poruka je ostala u statusu Odobreno za ručno slanje.`,
          'info'
        );
      }
    } catch (e: any) {
      console.error(e);
      showNotification(`Greška pri slanju: ${e.message}`, 'error');
    } finally {
      setIsSendingInProgress(false);
      setMessageToApproveAndSend(null);
    }
  };

  // Reject Message Action
  const handleExecuteReject = async () => {
    if (!messageToReject) return;
    await updateSalesMessageStatus(messageToReject.id, 'Rejected', rejectionReasonInput.trim() || 'Odbijeno od strane korisnika');
    setMessageToReject(null);
    setRejectionReasonInput('');
    showNotification('Poruka je odbijena i neće biti poslana.');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* Toast Banner */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TOP AGENT HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-indigo-900/60 shadow-xl text-white relative overflow-hidden">
        <div className="space-y-2 max-w-3xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Sales Agent v2.5 &bull; Personalni Prodajni Asistent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
            AI Sales Agent <span className="text-cyan-400 font-extrabold text-lg sm:text-xl font-mono">(ZanatFlow)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Automatska analiza kompanija iz vašeg Lead Finder-a, pametni Lead Scoring i generisanje prilagođenih Email & WhatsApp poruka uz <strong>potpunu vašu kontrolu i odobrenje</strong>.
          </p>
        </div>

        {/* Security Rule Badge */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/30 shrink-0 space-y-1 z-10 max-w-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Sigurnosno pravilo #1</span>
          </div>
          <p className="text-[11px] text-slate-300">
            AI Agent <strong>nikada ne šalje poruke samostalno</strong>. Svaka poruka prolazi kroz vaš Approval Center.
          </p>
        </div>
      </div>

      {/* SUB NAVIGATION TAB BAR */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('analysis')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'analysis'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Analiza kompanija ({totalAnalyzedLeads})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('writer')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'writer'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>AI Sales Writer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('approval')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap relative ${
            activeSubTab === 'approval'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Approval Center</span>
          {pendingApprovalMessagesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white animate-pulse">
              {pendingApprovalMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('followup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'followup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Follow-up Asistent</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'history'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Historija</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Postavke</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: AI SALES AGENT DASHBOARD */}
      {/* ========================================================================= */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* STATS METRIC CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Analizirano leadova</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalAnalyzedLeads}</p>
              <span className="text-[10px] text-slate-500">Čeka analizu: {pendingAnalysisLeadsCount}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🔥 Visok Potencijal (80+)</span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{highPotentialLeadsCount}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Spremno za kontakt</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">⏳ Čeka Odobrenje</span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{pendingApprovalMessagesCount}</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">U Approval Centeru</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">🚀 Poslano Poruka</span>
              <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">{sentMessagesCount}</p>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Stvarno isporučeno</span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 shadow-xs space-y-1 col-span-2 lg:col-span-1">
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">💬 Odgovori & Interes</span>
              <p className="text-2xl font-black text-cyan-700 dark:text-cyan-300">{repliedCount + interestedCount}</p>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">Aktivne komunikacije</span>
            </div>
          </div>

          {/* DASHBOARD MIDDLE SECTION: MESSAGES PENDING APPROVAL & CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Pending Approval Quick Box */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                  <CheckSquare className="w-4 h-4 text-amber-500" />
                  <span>Poruke koje čekaju vaše odobrenje</span>
                </div>
                <button
                  onClick={() => setActiveSubTab('approval')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                >
                  Otvori Approval Center <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {pendingApprovalMessagesCount === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Sve poruke su pregledane!</p>
                  <p className="text-xs text-slate-500">Trenutno nema poruka na čekanju. Generišite nove u AI Sales Writeru.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {salesMessages
                    .filter((m) => m.status === 'Pending Approval')
                    .slice(0, 3)
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{msg.companyName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase ${
                                msg.channel === 'email' ? 'bg-blue-600' : 'bg-emerald-600'
                              }`}
                            >
                              {msg.channel}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Score: {msg.leadScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{msg.subject || msg.bodyText}</p>
                        </div>

                        <button
                          onClick={() => {
                            setMessageToApproveAndSend(msg);
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" /> Pregledaj & Odobri
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Right Col: Performance Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-500" /> Statusi Poruka
                </h3>
              </div>

              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {chartData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span>{c.name}: <strong>{c.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DASHBOARD BOTTOM SECTION: RECENT ACTIVITIES */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <History className="w-4 h-4 text-indigo-500" /> Posljednje aktivnosti AI Sales Agenta
            </h3>

            <div className="space-y-3">
              {salesActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-start gap-3"
                >
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{act.companyName}</span>
                      <span className="text-[10px] text-slate-400">{act.createdAt}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: AI LEAD ANALYSIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'analysis' && (
        <div className="space-y-6">
          {/* ANALYSIS CONTROLS & BATCH TRIGGER */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Analiza Kompanija i Web Prisustva
                </h2>
                <p className="text-xs text-slate-500">
                  Odaberite postojeće leadove iz vašeg Lead Findera i pokrenite dubinsku AI analizu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedLeadIdsForAnalysis.length === leads.length) setSelectedLeadIdsForAnalysis([]);
                    else setSelectedLeadIdsForAnalysis(leads.map((l) => l.id));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  {selectedLeadIdsForAnalysis.length === leads.length ? 'Odznači sve' : 'Označi sve leadove'}
                </button>

                <button
                  onClick={handleBatchAnalyze}
                  disabled={isAnalyzing || selectedLeadIdsForAnalysis.length === 0}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isAnalyzing
                      ? `Analiza u toku (${analysisProgress.current}/${analysisProgress.total})...`
                      : `Pokreni AI analizu (${selectedLeadIdsForAnalysis.length})`}
                  </span>
                </button>
              </div>
            </div>

            {/* LEADS LIST SELECTOR GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
              {leads.map((lead) => {
                const isChecked = selectedLeadIdsForAnalysis.includes(lead.id);
                const hasAnalysis = leadAnalyses.some((a) => a.leadId === lead.id);

                return (
                  <div
                    key={lead.id}
                    onClick={() => {
                      if (isChecked) setSelectedLeadIdsForAnalysis(selectedLeadIdsForAnalysis.filter((id) => id !== lead.id));
                      else setSelectedLeadIdsForAnalysis([...selectedLeadIdsForAnalysis, lead.id]);
                    }}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="font-bold truncate">{lead.companyName}</p>
                      <p className="text-[10px] text-slate-500">{lead.city} &bull; {lead.industry}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasAnalysis && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                          Analiziran
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COMPLETED ANALYSES CARDS */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Izvještaji AI analize ({leadAnalyses.length})
            </h3>

            {leadAnalyses.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto" />
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Još niste analizirali nijednu kompaniju.</p>
                <p className="text-xs text-slate-500">Označite leadove u vrhu i kliknite "Pokreni AI analizu".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {leadAnalyses.map((analysis) => {
                  const leadObj = leads.find((l) => l.id === analysis.leadId);

                  return (
                    <div
                      key={analysis.id}
                      className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold">
                              {analysis.offerType}
                            </span>
                            <h4 className="font-black text-base text-slate-900 dark:text-white mt-1">{analysis.companyName}</h4>
                          </div>

                          <div className="text-right">
                            <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                              {analysis.leadScore} / 100
                            </span>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">{analysis.scoreCategory}</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {analysis.summary}
                        </p>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Uočeni problemi & prilike:</span>
                          <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                            {analysis.identifiedProblems.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                          Usluga: {analysis.proposedService}
                        </span>

                        <button
                          onClick={() => {
                            if (leadObj) setSelectedLeadForWriter(leadObj);
                            setSelectedOfferType(analysis.offerType);
                            setActiveSubTab('writer');
                          }}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                        >
                          <FileEdit className="w-3.5 h-3.5" /> Generiši poruku
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: AI SALES WRITER */}
      {/* ========================================================================= */}
      {activeSubTab === 'writer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 5 COLS: FORM CONTROLS */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-indigo-600" /> Generator Prodajnih Poruka
              </h2>
              <p className="text-xs text-slate-500">Konfigurišite vrstu ponude i jezik za izabranog leada.</p>
            </div>

            {/* Select Lead */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Odaberite Kompaniju</label>
              <select
                value={selectedLeadForWriter?.id || ''}
                onChange={(e) => {
                  const lead = leads.find((l) => l.id === e.target.value);
                  setSelectedLeadForWriter(lead || null);
                  setWriterDraft(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Odaberite leada --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.companyName} ({l.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Kanal Komunikacije</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel('email')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedChannel === 'email'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedChannel('whatsapp')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>

            {/* Offer Type */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Vrsta Ponude</label>
              <select
                value={selectedOfferType}
                onChange={(e: any) => setSelectedOfferType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                <option value="Nova web stranica">A. Nova web stranica (za firme bez sajta)</option>
                <option value="Rekonstrukcija web stranice">B. Rekonstrukcija / Redizajn sajta</option>
                <option value="Dodatne funkcionalnosti i automatizacija">C. Dodatne funkcionalnosti & automatizacija</option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Jezik Poruke</label>
              <select
                value={selectedLanguage}
                onChange={(e: any) => setSelectedLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
              >
                <option value="Bosanski">Bosanski</option>
                <option value="Hrvatski">Hrvatski</option>
                <option value="Srpski">Srpski</option>
                <option value="Engleski">Engleski</option>
                <option value="Njemački">Njemački</option>
              </select>
            </div>

            {/* Custom Sales Pitch / Prompt Directive */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Prijedlog / Upute za AI (Predložak)</span>
                <span className="text-[10px] text-indigo-500 font-semibold">Vaš predložak</span>
              </label>
              <textarea
                rows={3}
                placeholder="Npr. Ponudi izradu brze stranice u roku od 7 dana sa garancijom kvaliteta, besplatnim SEO podešavanjem i pozivom na 10-minutni razgovor..."
                value={customWriterPrompt}
                onChange={(e) => setCustomWriterPrompt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white font-sans focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleGenerateWriterMessage}
              disabled={isGeneratingMessage || !selectedLeadForWriter}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingMessage ? 'AI Agent piše poruku...' : 'Generiši personalizovanu poruku'}</span>
            </button>
          </div>

          {/* RIGHT 7 COLS: GENERATED MESSAGE PREVIEW & EDIT */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-500" /> Pregled i uređivanje sadržaja
                </span>

                {writerDraft && (
                  <button
                    onClick={handleGenerateWriterMessage}
                    disabled={isGeneratingMessage}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regeneriši novu verziju
                  </button>
                )}
              </div>

              {!writerDraft ? (
                <div className="p-12 text-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Nema pripremljene poruke</p>
                  <p className="text-xs text-slate-400">Odaberite kompaniju s lijeve strane i kliknite "Generiši personalizovanu poruku".</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedChannel === 'email' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Naslov Emaila (Subject)</label>
                      <input
                        type="text"
                        value={writerDraft.subject}
                        onChange={(e) => setWriterDraft({ ...writerDraft, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Tekst poruke ({selectedChannel.toUpperCase()})</label>
                    <textarea
                      rows={12}
                      value={writerDraft.bodyText}
                      onChange={(e) => setWriterDraft({ ...writerDraft, bodyText: e.target.value })}
                      className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-sans leading-relaxed text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {writerDraft && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSaveToApprovalCenter('Draft')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold"
                >
                  Sačuvaj kao nacrt (Draft)
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveToApprovalCenter('Pending Approval')}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Pošalji u Approval Center
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: APPROVAL CENTER */}
      {/* ========================================================================= */}
      {activeSubTab === 'approval' && (
        <div className="space-y-6">
          {/* TOOLBAR & FILTER */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" /> Approval Center (Odobravanje Poruka)
                </h2>
                <p className="text-xs text-slate-500">
                  Pregledajte svaku pripremljenu poruku, uredite je ili ponovo generišite. Slanje se vrši tek nakon vaše izričite potvrde.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'Pending Approval', 'Approved', 'Sent', 'Rejected', 'Draft'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setApprovalStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      approvalStatusFilter === st
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st === 'ALL' ? 'Sve poruke' : st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MESSAGES CARDS / TABLE LIST */}
          <div className="space-y-4">
            {salesMessages
              .filter((m) => approvalStatusFilter === 'ALL' || m.status === approvalStatusFilter)
              .length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="font-bold text-sm text-slate-800 dark:text-slate-200">Nema poruka sa odabranim statusom.</p>
              </div>
            ) : (
              salesMessages
                .filter((m) => approvalStatusFilter === 'ALL' || m.status === approvalStatusFilter)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-base text-slate-900 dark:text-white">{msg.companyName}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase text-white ${
                              msg.channel === 'email' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}
                          >
                            {msg.channel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            Score: {msg.leadScore}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Kontakt: <strong>{msg.contactName}</strong> &bull; {msg.recipientEmail || msg.recipientPhone}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {msg.status === 'Pending Approval' && (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Čeka odobrenje
                          </span>
                        )}
                        {msg.status === 'Approved' && (
                          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs border border-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Odobreno
                          </span>
                        )}
                        {msg.status === 'Sent' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs border border-emerald-300 flex items-center gap-1">
                            <Send className="w-3.5 h-3.5" /> Uspješno poslano
                          </span>
                        )}
                        {msg.status === 'Rejected' && (
                          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Odbijeno
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Body Content Box */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      {msg.subject && (
                        <p className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">
                          Naslov: {msg.subject}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{msg.bodyText}</p>
                    </div>

                    {/* ACTION BUTTONS ON MESSAGE */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.bodyText);
                            showNotification('Sadržaj poruke je kopiran u međuspremnik (clipboard)!');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Kopiraj poruku
                        </button>

                        <button
                          onClick={() => deleteSalesMessage(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 hover:bg-rose-100 text-xs font-bold"
                        >
                          Izbriši
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.status !== 'Sent' && (
                          <button
                            onClick={() => {
                              setMessageToReject(msg);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-200"
                          >
                            Odbij poruku
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setMessageToApproveAndSend(msg);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                        >
                          <Send className="w-4 h-4" /> {msg.status === 'Approved' ? 'Pošalji poruku' : 'Odobri & Pošalji'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 5: FOLLOW-UP ASSISTANT */}
      {/* ========================================================================= */}
      {activeSubTab === 'followup' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Follow-up Asistent i Praćenje Kontakata
            </h2>
            <p className="text-xs text-slate-500">
              Pratite datume kontaktiranja, pripremajte podsjetnike i automatski generišite follow-up poruke koje idu u Approval Center.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="p-4">Firma</th>
                    <th className="p-4">Kanal</th>
                    <th className="p-4">Zadnji kontakt</th>
                    <th className="p-4">Naredno praćenje</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Akcija</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {salesFollowUps.map((fol) => (
                    <tr key={fol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{fol.companyName}</td>
                      <td className="p-4 uppercase font-bold text-[10px]">{fol.channel}</td>
                      <td className="p-4 text-slate-500">{fol.lastContactDate || 'Nije poslana'}</td>
                      <td className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">{fol.nextFollowUpDate || 'Uskoro'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                          {fol.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {fol.status === 'Ne kontaktirati ponovo' || fol.status === 'Odbio ponudu' ? (
                          <span className="text-[11px] font-bold text-rose-500 flex items-center justify-end gap-1">
                            <Lock className="w-3.5 h-3.5" /> Kontakt blokiran
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              const lead = leads.find((l) => l.id === fol.leadId);
                              if (lead) {
                                setSelectedLeadForWriter(lead);
                                setActiveSubTab('writer');
                                showNotification(`Možete generisati novu follow-up poruku u AI Sales Writeru za ${lead.companyName}.`);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                          >
                            Pripremi Follow-up
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 6: COMMUNICATION HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" /> Historija Komunikacije i Aktivnosti
            </h2>
            <p className="text-xs text-slate-500">Kompletan hronološki zapis svih akcija, odobrenja i poslanih poruka.</p>
          </div>

          <div className="space-y-3">
            {salesActivities.map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3"
              >
                <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{act.companyName}</span>
                    <span className="text-[10px] text-slate-400">{act.createdAt}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 7: AI SALES SETTINGS */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" /> Postavke AI Sales Agenta
              </h2>
              <p className="text-xs text-slate-500">Prilagodite vaš brend, ton pisanja, integracije i cjenovnik.</p>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Naziv Brenda / Studija</label>
                <input
                  type="text"
                  value={salesSettings.brandName}
                  onChange={(e) => updateSalesSettings({ brandName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ime i Prezime</label>
                <input
                  type="text"
                  value={salesSettings.fullName}
                  onChange={(e) => updateSalesSettings({ fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-mail za slanje (Pošiljalac)</label>
                <input
                  type="email"
                  value={salesSettings.defaultSenderEmail || 'ajdin.beganovic.dev@gmail.com'}
                  onChange={(e) => updateSalesSettings({ defaultSenderEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kontakt Email (za prikaz)</label>
                <input
                  type="email"
                  value={salesSettings.contactEmail}
                  onChange={(e) => updateSalesSettings({ contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Zadani Prijedlog / Prodajni Predložak (Sales Pitch Prompt Directive)</label>
                <textarea
                  rows={3}
                  value={salesSettings.customProposalTemplate || ''}
                  onChange={(e) => updateSalesSettings({ customProposalTemplate: e.target.value })}
                  placeholder="Unesite vaš osnovni prijedlog/predložak na osnovu kojeg će AI prilagođavati poruke za svaku firmu..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kontakt Telefon</label>
                <input
                  type="text"
                  value={salesSettings.contactPhone}
                  onChange={(e) => updateSalesSettings({ contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Portfolio Link</label>
                <input
                  type="text"
                  value={salesSettings.portfolioUrl}
                  onChange={(e) => updateSalesSettings({ portfolioUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Prikaz cijene u porukama</label>
                <select
                  value={salesSettings.priceInMessageOption}
                  onChange={(e: any) => updateSalesSettings({ priceInMessageOption: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Uključi u poruku">Uključi cijenu u poruku</option>
                  <option value="Izostavi iz poruke">Izostavi cijenu iz poruke</option>
                  <option value="Samo za internu procjenu">Samo za internu procjenu</option>
                </select>
              </div>
            </div>

            {/* CHANNEL INTEGRATION CARDS */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Integracije Kanala Komunikacije</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gmail Integration */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Gmail API Integracija</span>
                    </div>
                    {isGmailConnected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Povezano</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">Nije povezano</span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Povezuje vaš Google nalog putem zvaničnog Gmail API-ja za slanje odobrenih e-mailova.
                  </p>

                  {!isGmailConnected && (
                    <button
                      onClick={loginGoogle}
                      className="w-full py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500"
                    >
                      Poveži Gmail račun
                    </button>
                  )}
                </div>

                {/* WhatsApp Integration */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Business Platform API</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">Povezano preko WA linka</span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Priprema slanje WhatsApp poruka putem zvaničnog Meta API-ja ili direktnog `wa.me` otvaranja na telefonu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANDATORY CONFIRMATION MODAL BEFORE SENDING MESSAGE */}
      {/* ========================================================================= */}
      {messageToApproveAndSend && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setMessageToApproveAndSend(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Konačna potvrda slanja poruke</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Potvrdite slanje prodajne poruke</h3>
              <p className="text-xs text-slate-500">
                Molimo pregledajte tačan naziv kompanije, primaoca i kompletan tekst poruke prije nego što date konačnu potvrdu.
              </p>
            </div>

            {/* Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <p><strong>Kompanija:</strong> {messageToApproveAndSend.companyName}</p>
              <p><strong>Kanal slanja:</strong> <span className="uppercase font-bold text-indigo-600">{messageToApproveAndSend.channel}</span></p>

              {messageToApproveAndSend.channel === 'email' ? (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-2">
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    &bull; Šalje se sa Vaše verifikovane adrese: <strong>ajdin.beganovic.dev@gmail.com</strong>
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-0.5">Email primaoca:</label>
                    <input
                      type="email"
                      value={messageToApproveAndSend.recipientEmail || ''}
                      onChange={(e) =>
                        setMessageToApproveAndSend({ ...messageToApproveAndSend, recipientEmail: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-0.5">WhatsApp broj telefona primaoca (+387...):</label>
                    <input
                      type="text"
                      value={messageToApproveAndSend.recipientPhone || ''}
                      onChange={(e) =>
                        setMessageToApproveAndSend({ ...messageToApproveAndSend, recipientPhone: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold text-slate-900 dark:text-white"
                      placeholder="+38761000000"
                    />
                  </div>
                </div>
              )}

              {messageToApproveAndSend.subject && <p><strong>Naslov:</strong> {messageToApproveAndSend.subject}</p>}
            </div>

            {/* Message Body Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1 max-h-48 overflow-y-auto font-sans leading-relaxed">
              <p className="font-bold text-[10px] text-slate-400 uppercase">Sadržaj poruke za slanje:</p>
              <p className="whitespace-pre-wrap">{messageToApproveAndSend.bodyText}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMessageToApproveAndSend(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={handleExecuteSend}
                disabled={isSendingInProgress}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingInProgress ? 'Slanje u toku...' : 'Potvrđujem & Pošalji poruku'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL DIALOG */}
      {messageToReject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Odbijanje poruke</h3>
            <p className="text-xs text-slate-500">Unesite razlog odbijanja poruke za kompaniju {messageToReject.companyName}:</p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="npr. Nije odgovarajući ton ili klijent je neaktivan..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setMessageToReject(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                Prekini
              </button>
              <button
                onClick={handleExecuteReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Potvrdi odbijanje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MESSAGE MODAL DIALOG */}
      {messageToEdit && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setMessageToEdit(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-indigo-600" /> Uredi poruku za {messageToEdit.companyName}
              </h3>
              <p className="text-xs text-slate-500">Uredite sadržaj poruke, naslov ili kontakt podatke klijenta.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primalac Email</label>
                  <input
                    type="email"
                    value={messageToEdit.recipientEmail || ''}
                    onChange={(e) => setMessageToEdit({ ...messageToEdit, recipientEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Primalac WhatsApp Telefon</label>
                  <input
                    type="text"
                    value={messageToEdit.recipientPhone || ''}
                    onChange={(e) => setMessageToEdit({ ...messageToEdit, recipientPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {messageToEdit.channel === 'email' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Naslov Emaila (Subject)</label>
                  <input
                    type="text"
                    value={messageToEdit.subject || ''}
                    onChange={(e) => setMessageToEdit({ ...messageToEdit, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sadržaj Poruke ({messageToEdit.channel.toUpperCase()})</label>
                <textarea
                  rows={10}
                  value={messageToEdit.bodyText}
                  onChange={(e) => setMessageToEdit({ ...messageToEdit, bodyText: e.target.value })}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans leading-relaxed text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMessageToEdit(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200"
              >
                Odustani
              </button>

              <button
                type="button"
                onClick={async () => {
                  await saveSalesMessage(messageToEdit);
                  setMessageToEdit(null);
                  showNotification('Sve izmjene u poruci su uspješno sačuvane!');
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Sačuvaj izmjene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
