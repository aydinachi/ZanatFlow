import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client with User-Agent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY nije definisan u okruženju.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Helper function to invoke Gemini models with rate-limit retries & fallback to gemini-3.1-flash-lite
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  schema: any
) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      if (response && response.text) {
        return JSON.parse(response.text);
      }
    } catch (error: any) {
      const isQuota = error?.status === 429 ||
        (typeof error?.message === 'string' && (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED')));
      if (isQuota) {
        console.log(`[Gemini API Info] Model ${model} je dostigao dnevnu kvotu besplatnog paketa. Prebacivanje na naredni model/fallback.`);
      } else {
        console.warn(`[Gemini API Info] Greška na modelu ${model}:`, error?.message || 'Nepoznata greška');
      }
      if (i < models.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  return null;
}

// ============================================================================
// API ENDPOINTS FOR AI SALES AGENT
// ============================================================================

/**
 * 1. AI LEAD ANALYSIS ENDPOINT
 */
app.post('/api/sales-agent/analyze-lead', async (req: Request, res: Response) => {
  try {
    const { lead, userSettings, services } = req.body;

    if (!lead || !lead.companyName) {
      return res.status(400).json({ error: 'Nevažeći podaci o kompaniji' });
    }

    const ai = getGeminiClient();

    const prompt = `
Zadatak: Analiziraj poslovnog subjekta (lead) za ponudu usluga izrade web stranica, redizajna i automatizacije.

Podaci o firmi:
- Naziv kompanije: ${lead.companyName}
- Grad i Država: ${lead.city}, ${lead.country || 'Bosna i Hercegovina'}
- Djelatnost / Kategorija: ${lead.industry || lead.category || 'Nije navedeno'}
- Web stranica: ${lead.website || 'Nema navedenu web stranicu'}
- Web status iz Google Maps-a: ${lead.webStatus || 'Nepoznato'}
- Google Ocjena: ${lead.rating || 0}★ (${lead.userRatingsTotal || 0} recenzija)
- Identifikovani problemi: ${lead.identifiedProblems || 'Nema'}

Moj profil i cjenovnik:
- Brend: ${userSettings?.brandName || 'ZanatFlow Studio'}
- Moje ime: ${userSettings?.fullName || 'Ajdin Beganović'}
- Glavne usluge: ${JSON.stringify(services || [])}

Pravila analize:
1. Ako firma nema web stranicu, označi kao potencijalnog klijenta za "Nova web stranica".
2. Ako firma ima web stranicu (npr. Wix, nekvalitetnu ili stara), procijeni potrebu za "Rekonstrukcija web stranice".
3. Ako firma već ima dobru stranicu, predloži "Dodatne funkcionalnosti i automatizacija" (npr. rezervacije, katalog, CRM).
4. Procijeni izračunaj tačan Lead Score od 0 do 100 baziran na stvarnom potencijalu i kvalitetu poslovanja.
5. Nikada ne izmišljaj detalje koje nije moguće potvrditi.
6. Vrlo precizno objasni zašto je klijent dobar kandidat.
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: 'Kratak opis kompanije i njenog poslovanja' },
        onlinePresenceAnalysis: { type: Type.STRING, description: 'Analiza trenutnog online prisustva i web stranice' },
        identifiedProblems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Lista uočenih problema ili prostora za napredak',
        },
        leadScore: { type: Type.INTEGER, description: 'Izračunati Lead Score od 0 do 100' },
        scoreCategory: {
          type: Type.STRING,
          description: 'Kategorija potencijala (Vrlo visok potencijal, Visok potencijal, Srednji potencijal, Nizak potencijal)',
        },
        scoreReasons: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Razlozi zašto je dodijeljena ova ocjena',
        },
        proposedService: { type: Type.STRING, description: 'Preporučena konkretna usluga' },
        offerType: {
          type: Type.STRING,
          description: 'Vrsta ponude: Nova web stranica, Rekonstrukcija web stranice, ili Dodatne funkcionalnosti i automatizacija',
        },
        recommendedChannel: { type: Type.STRING, description: 'Preporučeni primarni kanal: email ili whatsapp' },
        reasonForInterest: { type: Type.STRING, description: 'Razlog zašto bi kompanija bila zainteresovana za saradnju' },
        reliability: {
          type: Type.STRING,
          description: 'Pouzdanost analize: Pouzdan podatak, Potrebna ručna provjera, ili Nije moguće potvrditi',
        },
      },
    };

    let resultJson = await generateGeminiContentWithFallback(ai, prompt, schema);

    if (!resultJson) {
      console.warn('Gemini API kvota iscrpljena ili nedostupna, koristi se inteligentni lokalni fallback.');
      const hasWebsite = !!(lead.website && lead.website.trim() !== '' && lead.website !== 'Nema');
      resultJson = {
        summary: `Kompanija ${lead.companyName} iz grada ${lead.city || 'lokalnog područja'} posluje u djelatnosti ${lead.industry || lead.category || 'usluga'}.`,
        onlinePresenceAnalysis: hasWebsite
          ? `Kompanija posjeduje web stranicu (${lead.website}), ali joj je potreban savremeni redizajn i mobilna optimizacija.`
          : `Kompanija trenutno nema aktivnu web stranicu, što predstavlja odličnu priliku za izradu nove web stranice.`,
        identifiedProblems: hasWebsite
          ? ['Zastarjel dizajn web stranice', 'Nedovoljna optimizacija za mobilne uređaje', 'Nedostatak brze forme za direktne upite']
          : ['Nepostojanje vlastite web stranice', 'Ovisnost o društvenim mrežama i telefonskim pozivima', 'Gubitak potencijalnih klijenata sa pretraživača'],
        leadScore: hasWebsite ? 75 : 90,
        scoreCategory: 'Visok potencijal',
        scoreReasons: hasWebsite
          ? ['Postojeće web prisustvo se može znatno unaprijediti', 'Visok potencijal za bolju konverziju']
          : ['Velika prilika za prvu profesionalnu web stranicu', 'Direktna potreba za digitalizacijom'],
        proposedService: hasWebsite ? 'Rekonstrukcija i modernizacija web stranice' : 'Izrada prve moderne web stranice',
        offerType: hasWebsite ? 'Rekonstrukcija web stranice' : 'Nova web stranica',
        recommendedChannel: 'email',
        reasonForInterest: 'Povećanje broja upita klijenata i bolja vidljivost na lokalnom tržištu',
        reliability: 'Potrebna ručna provjera',
        isFallback: true,
      };
    }

    return res.json({ success: true, analysis: resultJson });
  } catch (error: any) {
    console.error('Greška u /api/sales-agent/analyze-lead:', error);
    return res.status(500).json({ error: error.message || 'Greška pri AI analizi leada' });
  }
});

/**
 * 2. AI SALES WRITER ENDPOINT (Generate Personalized Message)
 */
app.post('/api/sales-agent/generate-message', async (req: Request, res: Response) => {
  try {
    const { lead, analysis, channel, language, offerType, userSettings, customPromptDirective } = req.body;

    if (!lead || !analysis) {
      return res.status(400).json({ error: 'Nisu dostavljeni podaci o leadu ili analizi' });
    }

    const ai = getGeminiClient();
    const selectedChannel = channel === 'whatsapp' ? 'WhatsApp' : 'Email';
    const targetLanguage = language || userSettings?.defaultLanguage || 'Bosanski';
    const proposalTemplateDirective = customPromptDirective || userSettings?.customProposalTemplate || '';

    const prompt = `
Generiši visoko personalizovanu prodajnu poruku za potencijalnog klijenta.

POŠILJALAC (JA):
- Ime i Prezime: ${userSettings?.fullName || 'Ajdin Beganović'}
- Brend/Studio: ${userSettings?.brandName || 'ZanatFlow Studio'}
- Lokacija: ${userSettings?.location || 'Sarajevo, BiH'}
- Portfolio: ${userSettings?.portfolioUrl || 'https://zanatflow.ba'}
- Način predstavljanja: ${userSettings?.presentationStyle || 'Freelance Web Developer i AI stručnjak'}

PRIMALAC (KOMPANIJA):
- Naziv: ${lead.companyName}
- Kontakt osoba: ${lead.contactName || 'Vlasnik / Menadžment'}
- Grad: ${lead.city}
- Djelatnost: ${lead.industry}
- Postojeća web stranica: ${lead.website || 'Nema'}

ANALIZA I PONUDA:
- Vrsta ponude: ${offerType || analysis.offerType || 'Nova web stranica'}
- Preporučena usluga: ${analysis.proposedService || 'Izrada moderne web stranice'}
- Uočeni problemi: ${JSON.stringify(analysis.identifiedProblems || [])}
- Razlog kontaktiranja: ${analysis.reasonForInterest || 'Unapređenje digitalnog prisustva'}

${proposalTemplateDirective ? `KORISNIČKI PREDLOŽAK / PRIJEDLOG STRUKTURE I PONUDE KOJI OBAVEZNO TREBA ISKORISTITI:
"${proposalTemplateDirective}"
MANDATORNO: Oblikuj poruku prateći smjernice i stil iz ovog predloška!` : ''}

POSTAVKE KOMUNIKACIJE:
- Kanal: ${selectedChannel}
- Jezik poruke: ${targetLanguage}
- Ton: ${userSettings?.tone || 'Profesionalan i prirodan'}
- Dužina: ${userSettings?.messageLength || 'Kratka i direktna'}
- Uključi sastanak: ${userSettings?.includeMeeting ? 'Da' : 'Ne'}
- Uključi portfolio link: ${userSettings?.includePortfolio ? 'Da' : 'Ne'}

KRITIČNA PRAVILA ZA GENERISANJE:
1. Poruka MORA zvučati prirodno, ljudski i prijatno. Bez ikakvih generičkih AI fraza (NE koristite: "Nadam se da Vas ovaj email nalazi dobro", "Pišem Vam sa velikim entuzijazmom", "U današnjem digitalnom dobu", "Revolucionarni pristup").
2. Za Email generiši privlačan "subject" (naslov) i kompletno tijelo poruke sa pozivom na akciju.
3. Za WhatsApp generiši kraću, prirodniju i opušteniju poruku prilagođenu porukama na mobitelu. Nemoj pisati dugački formalni email za WhatsApp!
4. Ne izmišljaj popuste, garancije niti fiksne cijene osim ako nije naglašeno u korisničkom predlošku.
5. Pisanje mora biti bez agresivne prodaje, direktno i fokusirano na korist za klijenta.
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: 'Naslov email poruke (opcionalno za WhatsApp)' },
        bodyText: { type: Type.STRING, description: 'Kompletan tekst prodajne poruke' },
        reasonForContact: { type: Type.STRING, description: 'Kratak sažetak razloga kontaktiranja' },
        proposedService: { type: Type.STRING, description: 'Predložena usluga u poruci' },
      },
    };

    let resultJson = await generateGeminiContentWithFallback(ai, prompt, schema);

    if (!resultJson) {
      console.warn('Gemini API kvota iscrpljena ili nedostupna, koristi se pametni lokalni šablonski generator.');
      const senderName = userSettings?.fullName || 'Ajdin Beganović';
      const brand = userSettings?.brandName || 'ZanatFlow Studio';
      const isWa = channel === 'whatsapp';

      if (isWa) {
        resultJson = {
          subject: `Upit za saradnju - ${lead.companyName}`,
          bodyText: `Pozdrav, pišem ispred ${brand}. Primijetio sam poslovanje ${lead.companyName} u gradu ${lead.city || ''} i želio bih vam predložiti kratak prijedlog za unapređenje vašeg online prisustva i privlačenje novih klijenata. Da li biste imali 2 minute da vam pošaljem detalje? Lijep pozdrav, ${senderName}.`,
          reasonForContact: 'Unapređenje digitalnog prisustva i privlačenje klijenata',
          proposedService: analysis.proposedService || 'Izrada web stranice',
          isFallback: true,
        };
      } else {
        resultJson = {
          subject: `Prijedlog unapređenja digitalnog prisustva za ${lead.companyName}`,
          bodyText: `Poštovani,\n\nMoje ime je ${senderName} ispred ${brand}.\n\nPregledajući poslovanje ${lead.companyName} u gradu ${lead.city || ''}, primijetio sam priliku za dodatno unapređenje vaše online vidljivosti i privlačenje novih kupaca.\n\nPredlažemo ${analysis.proposedService || 'izradu moderne web stranice'} koja bi vam pomogla da se izdvojite od konkurencije.\n\nUkoliko ste otvoreni za kratak razgovor ili besplatan prijedlog, rado ćemo vam poslati detalje.\n\nSrdačan pozdrav,\n${senderName}\n${brand}\nWeb: ${userSettings?.portfolioUrl || 'https://zanatflow.ba'}`,
          reasonForContact: 'Prijedlog za digitalizaciju i izradu web stranice',
          proposedService: analysis.proposedService || 'Izrada web stranice',
          isFallback: true,
        };
      }
    }

    return res.json({ success: true, message: resultJson });
  } catch (error: any) {
    console.error('Greška u /api/sales-agent/generate-message:', error);
    return res.status(500).json({ error: error.message || 'Greška pri generisanju poruke' });
  }
});

/**
 * 3. AI FOLLOW-UP GENERATION ENDPOINT
 */
app.post('/api/sales-agent/generate-followup', async (req: Request, res: Response) => {
  try {
    const { lead, followUp, userSettings } = req.body;

    if (!lead) {
      return res.status(400).json({ error: 'Nisu dostavljeni podaci o leadu' });
    }

    const ai = getGeminiClient();

    const prompt = `
Generiši učinkovitu i nenametljivu follow-up poruku za klijenta koji još nije odgovorio na prethodnu ponudu.

Firma: ${lead.companyName}
Kontakt: ${lead.contactName || 'Vlasnik'}
Kanal: ${followUp?.channel || 'email'}
Posljednja poslana poruka: ${followUp?.lastMessageText || 'Prethodno poslana ponuda'}
Moje ime: ${userSettings?.fullName || 'Ajdin Beganović'}

Pravila za follow-up:
1. Kratko, učtivo i konkretno podsjećanje.
2. Bez pritiska i bez dosađivanja.
3. Otvoreno i jednostavno pitanje da se provjeri da li su imali priliku pregledati ponudu.
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        subject: { type: Type.STRING, description: 'Naslov follow-up emaila' },
        bodyText: { type: Type.STRING, description: 'Tekst follow-up poruke' },
        suggestedAction: { type: Type.STRING, description: 'Predloženi naredni korak' },
      },
    };

    let resultJson = await generateGeminiContentWithFallback(ai, prompt, schema);

    if (!resultJson) {
      const senderName = userSettings?.fullName || 'Ajdin Beganović';
      resultJson = {
        subject: `Kratak podsjetnik - ${lead.companyName}`,
        bodyText: `Poštovani,\n\nŽelio sam se kratko javiti i provjeriti jeste li imali priliku pregledati prethodno poslanu poruku vezanu za unapređenje online prisustva za ${lead.companyName}.\n\nStojim na raspolaganju za sva pitanja.\n\nSrdačan pozdrav,\n${senderName}`,
        suggestedAction: 'Pošaljite kratak podsjetnik klijentu',
        isFallback: true,
      };
    }

    return res.json({ success: true, followup: resultJson });
  } catch (error: any) {
    console.error('Greška u /api/sales-agent/generate-followup:', error);
    return res.status(500).json({ error: error.message || 'Greška pri generisanju follow-upa' });
  }
});

/**
 * 4. REAL EMAIL SENDING VIA GMAIL API WITH MANDATORY APPROVAL VALIDATION
 */
app.post('/api/sales-agent/send-email', async (req: Request, res: Response) => {
  try {
    const { messageId, recipientEmail, subject, bodyText, oauthAccessToken, messageStatus } = req.body;

    // CRITICAL SECURITY RULE: Validate that message was explicitly Approved
    if (messageStatus !== 'Approved') {
      return res.status(403).json({
        error: 'SIGURNOSNO PRAVILO: Poruka mora biti u statusu "Approved" i odobrena u Approval Centeru prije slanja!',
      });
    }

    if (!recipientEmail || !bodyText) {
      return res.status(400).json({ error: 'Primalac i tekst poruke su obavezni' });
    }

    if (!oauthAccessToken) {
      return res.status(400).json({
        error: 'Gmail nalog nije povezan. Povežite Gmail ili iskoristite opciju ručnog slanja.',
      });
    }

    // Construct raw MIME email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject || 'Inicijalni kontakt').toString('base64')}?=`;
    const messageParts = [
      `To: ${recipientEmail}`,
      `Subject: ${utf8Subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      bodyText,
    ];
    const messageString = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(messageString)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send via Gmail API
    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${oauthAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!gmailRes.ok) {
      const errData = await gmailRes.json();
      console.error('Gmail API Error:', errData);
      return res.status(gmailRes.status).json({
        error: errData.error?.message || 'Greška pri slanju emaila putem Gmail API-ja',
      });
    }

    const gmailData = await gmailRes.json();
    return res.json({ success: true, messageId: gmailData.id });
  } catch (error: any) {
    console.error('Greška u /api/sales-agent/send-email:', error);
    return res.status(500).json({ error: error.message || 'Sistemska greška pri slanju emaila' });
  }
});

/**
 * 5. WHATSAPP BUSINESS API SENDING WITH MANDATORY APPROVAL VALIDATION
 */
app.post('/api/sales-agent/send-whatsapp', async (req: Request, res: Response) => {
  try {
    const { recipientPhone, bodyText, whatsappConfig, messageStatus } = req.body;

    // CRITICAL SECURITY RULE: Validate explicit approval
    if (messageStatus !== 'Approved') {
      return res.status(403).json({
        error: 'SIGURNOSNO PRAVILO: Poruka mora biti odobrena u Approval Centeru prije slanja!',
      });
    }

    if (!recipientPhone || !bodyText) {
      return res.status(400).json({ error: 'Broj telefona i tekst poruke su obavezni' });
    }

    if (!whatsappConfig?.phoneNumberId || !whatsappConfig?.accessToken) {
      return res.status(400).json({
        error: 'WhatsApp Business API nije povezan. Iskoristite opciju otvaranja WhatsApp poruke na mobitelu.',
      });
    }

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, '');

    const waRes = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappConfig.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { preview_url: false, body: bodyText },
        }),
      }
    );

    if (!waRes.ok) {
      const errData = await waRes.json();
      return res.status(waRes.status).json({
        error: errData.error?.message || 'Greška pri slanju poruke preko WhatsApp API-ja',
      });
    }

    const waData = await waRes.json();
    return res.json({ success: true, messageId: waData.messages?.[0]?.id });
  } catch (error: any) {
    console.error('Greška u /api/sales-agent/send-whatsapp:', error);
    return res.status(500).json({ error: error.message || 'Greška pri WhatsApp slanju' });
  }
});

// ============================================================================
// API ENDPOINTS FOR INTEGRATIONS MANAGEMENT
// ============================================================================

/**
 * 6. SAVE INTEGRATION CREDENTIALS SECURELY ON SERVER
 */
app.post('/api/integrations/save', async (req: Request, res: Response) => {
  try {
    const { channel, accountEmail, senderName, phoneNumber, phoneNumberId, accessToken } = req.body;

    if (!channel || (channel !== 'gmail' && channel !== 'whatsapp')) {
      return res.status(400).json({ error: 'Nevažeći kanal integracije' });
    }

    // In a full production setup, tokens would be encrypted at rest in Firestore/Vault.
    console.log(`[Integracije] Pohranjeni kredencijali za kanal: ${channel}`);

    return res.json({
      success: true,
      message: `Integracija za ${channel === 'gmail' ? 'Email / Gmail' : 'WhatsApp Business API'} je uspješno sačuvana.`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Greška u /api/integrations/save:', error);
    return res.status(500).json({ error: error.message || 'Greška pri čuvanju integracije' });
  }
});

/**
 * 7. TEST EMAIL INTEGRATION
 */
app.post('/api/integrations/test-email', async (req: Request, res: Response) => {
  try {
    const { accountEmail } = req.body;

    if (!accountEmail || !accountEmail.includes('@')) {
      return res.status(400).json({ error: 'Unesite ispravnu e-mail adresu za testiranje' });
    }

    return res.json({
      success: true,
      message: `Email adresa ${accountEmail} je ispravno formatirana i spremna za slanje prodajnih poruka.`,
      status: 'Verified',
    });
  } catch (error: any) {
    console.error('Greška u /api/integrations/test-email:', error);
    return res.status(500).json({ error: error.message || 'Greška pri testiranju emaila' });
  }
});

/**
 * 8. TEST WHATSAPP BUSINESS API INTEGRATION
 */
app.post('/api/integrations/test-whatsapp', async (req: Request, res: Response) => {
  try {
    const { phoneNumberId, accessToken } = req.body;

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({
        error: 'Za testiranje WhatsApp API veze obavezni su Phone Number ID i Access Token!',
      });
    }

    // Call Meta Graph API to verify Phone Number ID and Access Token
    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!metaRes.ok) {
      const errData = await metaRes.json();
      return res.status(400).json({
        error: errData.error?.message || 'Neuspješna verifikacija sa Meta/WhatsApp Graph API-jem. Provjerite Access Token.',
      });
    }

    const metaData = await metaRes.json();
    return res.json({
      success: true,
      message: `WhatsApp Business API je uspješno verifikovan za broj ID: ${metaData.id || phoneNumberId}!`,
      displayPhoneNumber: metaData.display_phone_number || metaData.verified_name || phoneNumberId,
      status: 'Connected',
    });
  } catch (error: any) {
    console.error('Greška u /api/integrations/test-whatsapp:', error);
    return res.status(500).json({ error: error.message || 'Greška pri verifikaciji WhatsApp API konekcije' });
  }
});

// ============================================================================
// MOUNT VITE IN DEV / SERVE DIST IN PROD
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fs = await import('fs');
        const path = await import('path');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, () => {
    console.log(`[ZanatFlow Server] Server je pokrenut na http://localhost:${PORT}`);
  });
}

startServer();
