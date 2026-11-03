export type Currency = 'BAM' | 'EUR' | 'USD';

export type LeadStatus =
  | 'Novi potencijalni klijent'
  | 'Istražen'
  | 'Kontaktiran'
  | 'Poruka poslana'
  | 'Potrebno ponovno javljanje'
  | 'Odgovorio'
  | 'Pregovori'
  | 'Ponuda poslana'
  | 'Dobijen posao'
  | 'Izgubljen posao'
  | 'Nezainteresovan';

export type Priority = 'Nizak' | 'Srednji' | 'Visok';

export type LeadSource =
  | 'Google Maps'
  | 'Google pretraga'
  | 'LinkedIn'
  | 'Facebook'
  | 'Instagram'
  | 'Preporuka'
  | 'Freelance platforma'
  | 'Direktni kontakt'
  | 'Ostalo';

export interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  industry: string;
  source: LeadSource;
  socialLinks?: SocialLinks;
  
  // Poslovna prilika
  serviceType: string;
  currentWebsiteQuality: 'Nema web' | 'Zastarjela' | 'Nekvalitetna' | 'Prosječna' | 'Dobra';
  identifiedProblems: string;
  proposedSolution: string;
  estimatedValue: number;
  currency: Currency;
  priority: Priority;
  probability: number; // 0 - 100%
  status: LeadStatus;
  notes: string;
  
  // Google Maps Lead Finder Integracija
  googlePlaceId?: string;
  googleMapsUrl?: string;
  rating?: number;
  userRatingsTotal?: number;
  leadScore?: number;
  webStatus?: 'NO_WEBSITE' | 'NEEDS_RECONSTRUCTION' | 'BROKEN_WEBSITE' | 'HAS_WEBSITE';
  scoreReasons?: string[];
  
  lastContactDate?: string; // YYYY-MM-DD
  nextFollowUpDate?: string; // YYYY-MM-DD
  
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface GoogleMapsPlace {
  placeId: string;
  name: string;
  address: string;
  city: string;
  country?: string;
  phone: string;
  website: string;
  rating: number;
  userRatingsTotal: number;
  category: string;
  types: string[];
  lat: number;
  lng: number;
  googleMapsUrl: string;
  photoUrl?: string;
  
  // Analiza web prisustva & Lead Score
  webStatus: 'NO_WEBSITE' | 'NEEDS_RECONSTRUCTION' | 'BROKEN_WEBSITE' | 'HAS_WEBSITE';
  leadScore: number;
  scoreCategory: 'Visok potencijal' | 'Dobar potencijal' | 'Potrebna dodatna analiza' | 'Nizak prioritet';
  recommendedService: string;
  scoreReasons: string[];
  analyzedAt: string;
}

export interface SavedSearchQuery {
  id: string;
  queryText: string;
  city: string;
  country: string;
  category: string;
  radiusKm: number;
  minRating: number;
  minReviews: number;
  date: string;
  resultsCount: number;
}

export type ClientStatus = 'Aktivno' | 'Pauzirano' | 'Završeno' | 'Neaktivno';

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  industry: string;
  status: ClientStatus;
  notes: string;
  convertedFromLeadId?: string;
  totalEarned: number;
  unpaidAmount: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type ProjectStatus =
  | 'Planiranje'
  | 'U izradi'
  | 'Čeka se klijent'
  | 'Testiranje'
  | 'Završeno'
  | 'Održavanje'
  | 'Arhivirano';

export interface ProjectAttachment {
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  websiteUrl: string;
  projectType: string; // npr. Landing stranica, Web Shop, Poslovna stranica, Web App
  description: string;
  technologies: string[];
  startDate: string;
  deadlineDate: string;
  completedDate?: string;
  status: ProjectStatus;
  agreedPrice: number;
  paidAmount: number;
  remainingAmount: number;
  currency: Currency;
  
  hostingProvider: string;
  domainRegistrar: string;
  domainExpirationDate: string;
  hostingExpirationDate: string;
  githubRepo?: string;
  deploymentUrl?: string;
  adminPanelUrl?: string;
  credentialsNotes?: string;
  notes: string;
  attachments: ProjectAttachment[];
  
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type TaskStatus = 'Za uraditi' | 'U toku' | 'Završeno' | 'Odgođeno';
export type TaskType = 'Opći zadatak' | 'Podsjetnik za javljanje' | 'Projektni zadatak' | 'Finansijski zadatak';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  relatedClientId?: string;
  relatedLeadId?: string;
  relatedProjectId?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type ActivityType =
  | 'E-mail'
  | 'Telefonski poziv'
  | 'WhatsApp poruka'
  | 'LinkedIn poruka'
  | 'Sastanak'
  | 'Poslana ponuda'
  | 'Ostalo';

export interface Activity {
  id: string;
  entityType: 'lead' | 'client' | 'project';
  entityId: string;
  entityName: string;
  type: ActivityType;
  date: string;
  description: string;
  nextStep?: string;
  createdAt: string;
  userId: string;
}

export type FinanceType = 'prihod' | 'trosak';
export type FinanceCategory =
  | 'Uplata klijenta'
  | 'Hosting'
  | 'Domena'
  | 'Softver/Pretplata'
  | 'Oprema'
  | 'Projektni trošak'
  | 'Marketing'
  | 'Ostalo';
export type FinanceStatus = 'Plaćeno' | 'Neplaćeno' | 'Djelimično' | 'Zakašnjelo';

export interface Finance {
  id: string;
  type: FinanceType;
  category: FinanceCategory;
  description: string;
  amount: number;
  currency: Currency;
  date: string;
  dueDate?: string;
  status: FinanceStatus;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  invoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: Currency;
  estimatedDeliveryDays: number;
  includedFeatures: string[];
  optionalAddons: string[];
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface UserSettings {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  defaultCurrency: Currency;
  theme: 'light' | 'dark';
}

// ==========================================
// AI SALES AGENT TYPES
// ==========================================

export interface SalesAgentSettings {
  id: string;
  brandName: string;
  fullName: string;
  shortIntro: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  portfolioUrl: string;
  projectLinks: string;
  presentationStyle: string;
  defaultLanguage: 'Bosanski' | 'Hrvatski' | 'Srpski' | 'Engleski' | 'Njemački';
  tone: 'Profesionalan i prirodan' | 'Opušten i prijateljski' | 'Formalan';
  messageLength: 'Kratka i direktna' | 'Srednje dužine' | 'Detaljna';
  includeFreeDemo: boolean;
  includeMeeting: boolean;
  includePortfolio: boolean;
  priceInMessageOption: 'Uključi u poruku' | 'Izostavi iz poruke' | 'Samo za internu procjenu';
  defaultSenderEmail?: string;
  customProposalTemplate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface LeadAnalysis {
  id: string;
  leadId: string;
  companyName: string;
  website: string;
  webStatus: 'NO_WEBSITE' | 'NEEDS_RECONSTRUCTION' | 'BROKEN_WEBSITE' | 'HAS_WEBSITE';
  leadScore: number; // 0 - 100
  scoreCategory: 'Vrlo visok potencijal' | 'Visok potencijal' | 'Srednji potencijal' | 'Nizak potencijal';
  scoreReasons: string[];
  summary: string;
  onlinePresenceAnalysis: string;
  identifiedProblems: string[];
  proposedService: string;
  offerType: 'Nova web stranica' | 'Rekonstrukcija web stranice' | 'Dodatne funkcionalnosti i automatizacija';
  recommendedChannel: 'email' | 'whatsapp';
  reasonForInterest: string;
  reliability: 'Pouzdan podatak' | 'Potrebna ručna provjera' | 'Nije moguće potvrditi';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export type SalesMessageStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent' | 'Failed';
export type SalesChannel = 'email' | 'whatsapp';

export interface SalesMessage {
  id: string;
  leadId: string;
  companyName: string;
  contactName: string;
  recipientEmail: string;
  recipientPhone: string;
  channel: SalesChannel;
  offerType: 'Nova web stranica' | 'Rekonstrukcija web stranice' | 'Dodatne funkcionalnosti i automatizacija';
  proposedService: string;
  leadScore: number;
  reasonForContact: string;
  subject?: string;
  bodyText: string;
  status: SalesMessageStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  sentAt?: string;
  sendError?: string;
  sentMessageId?: string;
  language: 'Bosanski' | 'Hrvatski' | 'Srpski' | 'Engleski' | 'Njemački';
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface SalesActivity {
  id: string;
  leadId: string;
  companyName: string;
  type: 'Analiza pokrenuta' | 'Poruka generisana' | 'Poruka odobrena' | 'Poruka odbijena' | 'Poruka poslana' | 'Odgovor primljen' | 'Follow-up zakazan';
  channel?: SalesChannel;
  description: string;
  messageId?: string;
  createdAt: string;
  userId: string;
}

export type FollowUpStatus =
  | 'Nije kontaktiran'
  | 'Poruka pripremljena'
  | 'Poruka poslana'
  | 'Čeka se odgovor'
  | 'Odgovorio'
  | 'Zainteresovan'
  | 'Potrebna dodatna komunikacija'
  | 'Odbio ponudu'
  | 'Nije zainteresovan'
  | 'Saradnja dogovorena'
  | 'Ne kontaktirati ponovo';

export interface SalesFollowUp {
  id: string;
  leadId: string;
  companyName: string;
  channel: SalesChannel;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  status: FollowUpStatus;
  lastMessageText?: string;
  suggestedAction?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface SalesIntegration {
  id: string;
  channel: 'gmail' | 'whatsapp';
  isConnected: boolean;
  accountEmail?: string;
  senderName?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  accessToken?: string;
  lastTestedAt?: string;
  updatedAt: string;
  userId: string;
}
