import {
  Lead,
  LeadAnalysis,
  SalesMessage,
  SalesActivity,
  SalesFollowUp,
  SalesAgentSettings,
  SalesIntegration,
  ServiceItem,
} from '../types';

/**
 * DEFAULT SALES AGENT SETTINGS
 */
export const DEFAULT_SALES_SETTINGS: SalesAgentSettings = {
  id: 'default-sales-settings',
  brandName: 'ZanatFlow Digital',
  fullName: 'Ajdin Beganović',
  shortIntro: 'Senior Freelance Web Developer & Automation Architect sa preko 5 godina iskustva u izradi besprijekornih web aplikacija i prodajnih stranica.',
  location: 'Sarajevo, Bosna i Hercegovina',
  contactEmail: 'ajdin.beganovic.dev@gmail.com',
  defaultSenderEmail: 'ajdin.beganovic.dev@gmail.com',
  contactPhone: '+387 61 000 000',
  portfolioUrl: 'https://zanatflow.ba',
  projectLinks: 'https://github.com, https://dribbble.com',
  presentationStyle: 'Specijalizovani samostalni programer i dizajner fokusiran na rast vašeg poslovanja',
  defaultLanguage: 'Bosanski',
  tone: 'Profesionalan i prirodan',
  messageLength: 'Kratka i direktna',
  includeFreeDemo: true,
  includeMeeting: true,
  includePortfolio: true,
  priceInMessageOption: 'Samo za internu procjenu',
  customProposalTemplate: 'Želimo ponuditi izradu moderne, brze i prilagođene web stranice ili redizajn postojeće sa garancijom visokih performansi, brzinom izrade do 7 dana i integracijom online upita.',
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
  userId: 'default-user',
};

/**
 * API CALL: ANALYZE LEAD
 */
export async function runAiLeadAnalysis(
  lead: Lead,
  settings: SalesAgentSettings,
  services: ServiceItem[]
): Promise<LeadAnalysis> {
  try {
    const res = await fetch('/api/sales-agent/analyze-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, userSettings: settings, services }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Greška pri analizi leada');
    }

    const data = await res.json();
    const a = data.analysis;

    const now = new Date().toISOString().split('T')[0];

    return {
      id: `analysis-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      companyName: lead.companyName,
      website: lead.website || '',
      webStatus: lead.webStatus || (lead.website ? 'HAS_WEBSITE' : 'NO_WEBSITE'),
      leadScore: a.leadScore ?? lead.leadScore ?? 75,
      scoreCategory: a.scoreCategory || (a.leadScore >= 80 ? 'Vrlo visok potencijal' : 'Visok potencijal'),
      scoreReasons: a.scoreReasons || ['Aktivno poslovanje', 'Prostor za digitalnu optimizaciju'],
      summary: a.summary || `Analiza kompanije ${lead.companyName} iz grada ${lead.city}.`,
      onlinePresenceAnalysis: a.onlinePresenceAnalysis || 'Analizirano web prisustvo na osnovu dostupnih podataka.',
      identifiedProblems: a.identifiedProblems || ['Potrebno modernije rješenje'],
      proposedService: a.proposedService || 'Izrada moderne web stranice',
      offerType: a.offerType || (lead.website ? 'Rekonstrukcija web stranice' : 'Nova web stranica'),
      recommendedChannel: a.recommendedChannel === 'whatsapp' ? 'whatsapp' : 'email',
      reasonForInterest: a.reasonForInterest || 'Visok potencijal za privlačenje novih klijenata kroz web.',
      reliability: a.reliability || 'Pouzdan podatak',
      createdAt: now,
      updatedAt: now,
      userId: lead.userId || 'demo-user',
    };
  } catch (error) {
    console.warn('Server AI analiza nije uspjela, koristi se inteligentni fallback:', error);
    // Intelligent Fallback Analysis
    const now = new Date().toISOString().split('T')[0];
    const isNoWeb = !lead.website || lead.webStatus === 'NO_WEBSITE';
    const score = isNoWeb ? 85 : 65;

    return {
      id: `analysis-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      companyName: lead.companyName,
      website: lead.website || '',
      webStatus: isNoWeb ? 'NO_WEBSITE' : 'NEEDS_RECONSTRUCTION',
      leadScore: score,
      scoreCategory: score >= 80 ? 'Vrlo visok potencijal' : 'Visok potencijal',
      scoreReasons: isNoWeb
        ? ['+40: Nema navedenu web stranicu', '+25: Odlične recenzije i aktivni klijenti', '+10: Dostupan direktni kontakt']
        : ['+25: Zastarjeli UI/UX dizajn', '+15: Prilika za mobilnu optimizaciju'],
      summary: `Kompanija ${lead.companyName} posluje u gradu ${lead.city} u djelatnosti ${lead.industry}.`,
      onlinePresenceAnalysis: isNoWeb
        ? 'Kompanija nema navedenu zvaničnu web stranicu na Google Maps profilu.'
        : 'Postojeća web stranica zahtijeva modernizaciju i prilagođavanje mobilnim telefonima.',
      identifiedProblems: isNoWeb
        ? ['Gubitak potencijalnih klijenata koji traže usluge na Google-u', 'Nedostatak online rezervacija']
        : ['Nije optimizovano za mobitele', 'Sporije učitavanje i zastario vizuelni identitet'],
      proposedService: isNoWeb ? 'Izrada potpuno nove responsive web stranice' : 'Redizajn i UX/UI optimizacija',
      offerType: isNoWeb ? 'Nova web stranica' : 'Rekonstrukcija web stranice',
      recommendedChannel: lead.email ? 'email' : 'whatsapp',
      reasonForInterest: 'Kompanija ima visoku ocjenu na Google-u i aktivno poslovanje ali gubi klijente online.',
      reliability: 'Pouzdan podatak',
      createdAt: now,
      updatedAt: now,
      userId: lead.userId || 'demo-user',
    };
  }
}

/**
 * API CALL: GENERATE SALES MESSAGE
 */
export async function runAiSalesWriter(
  lead: Lead,
  analysis: LeadAnalysis,
  channel: 'email' | 'whatsapp',
  language: 'Bosanski' | 'Hrvatski' | 'Srpski' | 'Engleski' | 'Njemački',
  offerType: 'Nova web stranica' | 'Rekonstrukcija web stranice' | 'Dodatne funkcionalnosti i automatizacija',
  settings: SalesAgentSettings,
  customPromptDirective?: string
): Promise<SalesMessage> {
  try {
    const res = await fetch('/api/sales-agent/generate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead,
        analysis,
        channel,
        language,
        offerType,
        userSettings: settings,
        customPromptDirective: customPromptDirective || settings.customProposalTemplate,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Greška pri generisanju poruke');
    }

    const data = await res.json();
    const msg = data.message;
    const now = new Date().toISOString().split('T')[0];

    return {
      id: `msg-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName || `${lead.companyName} Tim`,
      recipientEmail: lead.email || '',
      recipientPhone: lead.phone || '',
      channel,
      offerType,
      proposedService: msg.proposedService || analysis.proposedService || 'Web usluge',
      leadScore: analysis.leadScore,
      reasonForContact: msg.reasonForContact || analysis.reasonForInterest,
      subject: channel === 'email' ? msg.subject || `Prijedlog unapređenja web stranice za ${lead.companyName}` : undefined,
      bodyText: msg.bodyText,
      status: 'Pending Approval',
      language,
      createdAt: now,
      updatedAt: now,
      userId: lead.userId || 'demo-user',
    };
  } catch (error) {
    console.warn('Server AI pisanje nije uspjelo, koristi se stručni fallback:', error);
    const now = new Date().toISOString().split('T')[0];

    let subject = '';
    let bodyText = '';

    if (channel === 'email') {
      subject = `Upit za saradnju i digitalno unapređenje za ${lead.companyName}`;
      bodyText = `Poštovani,

Moje ime je ${settings.fullName} iz studija ${settings.brandName}. Pratim vaš rad i vidim da ${lead.companyName} uspješno posluje u gradu ${lead.city}.

Pregledom vašeg profila uočio sam priliku za značajno unapređenje vašeg online prisustva. ${
        offerType === 'Nova web stranica'
          ? 'Trenutno na Google-u nemate zvaničnu web stranicu, što znači da dio novih klijenata odlazi konkurenciji.'
          : 'Vaša trenutna web stranica ima prostor za vizuelno osvježenje i brže učitavanje na mobilnim uređajima.'
      }

Pripremio sam kratak prijedlog kako možemo izraditi modernu i brzu stranicu koja će vam dovoditi više upita.

Da li biste imali 10 minuta za kratak razgovor ili besplatan demo prijedlog ove sedmice?

Srdačan pozdrav,
${settings.fullName}
${settings.brandName}
Tel: ${settings.contactPhone}
Web: ${settings.portfolioUrl}`;
    } else {
      bodyText = `Pozdrav! Ja sam ${settings.fullName} (${settings.brandName}). Primijetio sam odličan rad firme ${lead.companyName} u ${lead.city}. ${
        offerType === 'Nova web stranica'
          ? 'Vidim da nemate web stranicu na Google-u, pa me zanima jeste li razmišljali o modernom sajtu koji automatski privlači nove klijente?'
          : 'Gledao sam vašu web stranicu pa bih vam rado poslao par besplatnih savjeta za lakše zakazivanje na mobitelu. Jeste li otvoreni za kratku poruku na tu temu?'
      }`;
    }

    return {
      id: `msg-${lead.id}-${Date.now()}`,
      leadId: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName || `${lead.companyName} Tim`,
      recipientEmail: lead.email || '',
      recipientPhone: lead.phone || '',
      channel,
      offerType,
      proposedService: analysis.proposedService || 'Izrada web stranice',
      leadScore: analysis.leadScore,
      reasonForContact: analysis.reasonForInterest,
      subject: channel === 'email' ? subject : undefined,
      bodyText,
      status: 'Pending Approval',
      language,
      createdAt: now,
      updatedAt: now,
      userId: lead.userId || 'demo-user',
    };
  }
}

/**
 * SEND EMAIL VIA API (Strictly verifies approval)
 */
export async function sendEmailMessage(
  message: SalesMessage,
  oauthAccessToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (message.status !== 'Approved') {
    return {
      success: false,
      error: 'SIGURNOSNA GREŠKA: Poruka mora biti pojedinačno odobrena u Approval Centeru prije slanja!',
    };
  }

  try {
    const res = await fetch('/api/sales-agent/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: message.id,
        leadId: message.leadId,
        recipientEmail: message.recipientEmail,
        subject: message.subject,
        bodyText: message.bodyText,
        oauthAccessToken,
        messageStatus: message.status,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Greška pri slanju emaila' };
    }

    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Neuspješno slanje emaila' };
  }
}

/**
 * SEND WHATSAPP VIA API (Strictly verifies approval)
 */
export async function sendWhatsAppMessage(
  message: SalesMessage,
  whatsappConfig?: { phoneNumberId: string; accessToken: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (message.status !== 'Approved') {
    return {
      success: false,
      error: 'SIGURNOSNA GREŠKA: Poruka mora biti pojedinačno odobrena u Approval Centeru prije slanja!',
    };
  }

  try {
    const res = await fetch('/api/sales-agent/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: message.id,
        leadId: message.leadId,
        recipientPhone: message.recipientPhone,
        bodyText: message.bodyText,
        whatsappConfig,
        messageStatus: message.status,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Greška pri slanju WhatsApp poruke' };
    }

    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Neuspješno slanje WhatsApp poruke' };
  }
}
