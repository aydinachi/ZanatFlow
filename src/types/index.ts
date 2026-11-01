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
  
  lastContactDate?: string; // YYYY-MM-DD
  nextFollowUpDate?: string; // YYYY-MM-DD
  
  createdAt: string;
  updatedAt: string;
  userId: string;
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
