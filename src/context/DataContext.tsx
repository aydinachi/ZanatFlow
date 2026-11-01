import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  Client,
  Project,
  Task,
  Activity,
  Finance,
  ServiceItem,
  LeadStatus,
  UserSettings,
} from '../types';
import {
  INITIAL_LEADS,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_FINANCES,
  INITIAL_SERVICES,
} from '../services/mockData';
import { auth, db, loginWithGoogle, logoutUser } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

interface DataContextType {
  // Auth & System state
  user: User | null;
  isDemoMode: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  toggleDemoMode: () => void;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Collections
  leads: Lead[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  activities: Activity[];
  finances: Finance[];
  services: ServiceItem[];
  userSettings: UserSettings;

  // Actions - Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToClient: (leadId: string) => Promise<string>;
  importLeadsCSV: (csvText: string) => Promise<{ imported: number; errors: number }>;

  // Actions - Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Actions - Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Actions - Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Actions - Activities
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'userId'>) => Promise<string>;
  deleteActivity: (id: string) => Promise<void>;

  // Actions - Finances
  addFinance: (finance: Omit<Finance, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateFinance: (id: string, updates: Partial<Finance>) => Promise<void>;
  deleteFinance: (id: string) => Promise<void>;

  // Actions - Services
  addService: (service: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateService: (id: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;

  // System & Sample Data
  resetToSampleData: () => void;
  seedSampleDataToFirestore: () => Promise<void>;
  exportDataToCSV: (entityName: 'leads' | 'clients' | 'projects' | 'finances') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_LEADS = 'fbm_leads_v1';
const LOCAL_STORAGE_KEY_CLIENTS = 'fbm_clients_v1';
const LOCAL_STORAGE_KEY_PROJECTS = 'fbm_projects_v1';
const LOCAL_STORAGE_KEY_TASKS = 'fbm_tasks_v1';
const LOCAL_STORAGE_KEY_ACTIVITIES = 'fbm_activities_v1';
const LOCAL_STORAGE_KEY_FINANCES = 'fbm_finances_v1';
const LOCAL_STORAGE_KEY_SERVICES = 'fbm_services_v1';
const LOCAL_STORAGE_KEY_THEME = 'fbm_theme_v1';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  // Local state initialized with Mock Data or LocalStorage
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_LEADS);
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TASKS);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [finances, setFinances] = useState<Finance[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FINANCES);
    return saved ? JSON.parse(saved) : INITIAL_FINANCES;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [userSettings] = useState<UserSettings>({
    fullName: 'Freelance Developer',
    businessName: 'Web & Digital Studio',
    email: 'moj.email@domain.com',
    phone: '+387 61 000 000',
    defaultCurrency: 'BAM',
    theme: 'light',
  });

  // Theme Syncing
  useEffect(() => {
    const savedTheme = (localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as 'light' | 'dark') || 'light';
    setThemeState(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Sync to LocalStorage in Demo Mode
  useEffect(() => {
    if (isDemoMode) {
      localStorage.setItem(LOCAL_STORAGE_KEY_LEADS, JSON.stringify(leads));
      localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(clients));
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(tasks));
      localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
      localStorage.setItem(LOCAL_STORAGE_KEY_FINANCES, JSON.stringify(finances));
      localStorage.setItem(LOCAL_STORAGE_KEY_SERVICES, JSON.stringify(services));
    }
  }, [leads, clients, projects, tasks, activities, finances, services, isDemoMode]);

  // Firebase Auth & Firestore Listeners
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoMode(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore when user is authenticated
  useEffect(() => {
    if (!user || isDemoMode) return;

    setIsLoading(true);
    const userId = user.uid;

    const unsubs = [
      onSnapshot(query(collection(db, 'leads'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Lead));
        setLeads(docs);
      }),
      onSnapshot(query(collection(db, 'clients'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Client));
        setClients(docs);
      }),
      onSnapshot(query(collection(db, 'projects'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(docs);
      }),
      onSnapshot(query(collection(db, 'tasks'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(docs);
      }),
      onSnapshot(query(collection(db, 'activities'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Activity));
        setActivities(docs);
      }),
      onSnapshot(query(collection(db, 'finances'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Finance));
        setFinances(docs);
      }),
      onSnapshot(query(collection(db, 'services'), where('userId', '==', userId)), (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServiceItem));
        setServices(docs);
      }),
    ];

    setIsLoading(false);

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user, isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const loginGoogle = async () => {
    try {
      await loginWithGoogle();
      setIsDemoMode(false);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    await logoutUser();
    setIsDemoMode(true);
  };

  // Helper for generating IDs in demo mode
  const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const currentUserId = user ? user.uid : 'demo-user';
  const nowIso = new Date().toISOString().split('T')[0];

  // LEADS ACTIONS
  const addLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('lead');
    const newLead: Lead = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'leads', id), newLead);
    } else {
      setLeads((prev) => [newLead, ...prev]);
    }

    // Add activity automatically
    await addActivity({
      entityType: 'lead',
      entityId: id,
      entityName: newLead.companyName,
      type: 'Ostalo',
      date: nowIso,
      description: `Pronađen i unesen novi potencijalni klijent sa statusom "${newLead.status}".`,
    });

    return id;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'leads', id), { ...updates, updatedAt });
    } else {
      setLeads((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const lead = leads.find((l) => l.id === id);
    await updateLead(id, { status, lastContactDate: nowIso });
    if (lead) {
      await addActivity({
        entityType: 'lead',
        entityId: id,
        entityName: lead.companyName,
        type: 'Ostalo',
        date: nowIso,
        description: `Promijenjen status u "${status}".`,
      });
    }
  };

  const deleteLead = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'leads', id));
    } else {
      setLeads((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const convertLeadToClient = async (leadId: string): Promise<string> => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) throw new Error('Potencijalni klijent nije pronađen');

    const clientId = genId('client');
    const newClient: Client = {
      id: clientId,
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      address: lead.city,
      website: lead.website,
      industry: lead.industry,
      status: 'Aktivno',
      notes: `Prebačeno iz potencijalnog klijenta. Izvor: ${lead.source}. Prijedlog: ${lead.proposedSolution}`,
      convertedFromLeadId: lead.id,
      totalEarned: 0,
      unpaidAmount: 0,
      currency: lead.currency,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'clients', clientId), newClient);
      await updateDoc(doc(db, 'leads', leadId), { status: 'Dobijen posao', updatedAt: nowIso });
    } else {
      setClients((prev) => [newClient, ...prev]);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: 'Dobijen posao', updatedAt: nowIso } : l))
      );
    }

    await addActivity({
      entityType: 'client',
      entityId: clientId,
      entityName: newClient.companyName,
      type: 'Ostalo',
      date: nowIso,
      description: `Potencijalni klijent uspješno pretvoren u stalnog klijenta.`,
    });

    return clientId;
  };

  const importLeadsCSV = async (csvText: string) => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) return { imported: 0, errors: lines.length };

    let imported = 0;
    let errors = 0;

    // Standard headers expected: Naziv, Kontakt, Email, Telefon, Grad, Djelatnost, Izvor, Vrijednost, Status
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 1 && parts[0]) {
        try {
          await addLead({
            companyName: parts[0] || 'Nepoznata firma',
            contactName: parts[1] || '',
            email: parts[2] || '',
            phone: parts[3] || '',
            website: parts[4] || '',
            city: parts[5] || 'Sarajevo',
            industry: parts[6] || 'Opće poslovanje',
            source: (parts[7] as any) || 'Direktni kontakt',
            serviceType: 'Izrada web stranice',
            currentWebsiteQuality: 'Zastarjela',
            identifiedProblems: 'Potrebna analiza',
            proposedSolution: 'Savremeni web redizajn',
            estimatedValue: parseFloat(parts[8]) || 1500,
            currency: 'BAM',
            priority: 'Srednji',
            probability: 50,
            status: 'Novi potencijalni klijent',
            notes: 'Uvezeno iz CSV datoteke.',
          });
          imported++;
        } catch {
          errors++;
        }
      }
    }

    return { imported, errors };
  };

  // CLIENTS ACTIONS
  const addClient = async (data: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('client');
    const newClient: Client = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'clients', id), newClient);
    } else {
      setClients((prev) => [newClient, ...prev]);
    }

    return id;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'clients', id), { ...updates, updatedAt });
    } else {
      setClients((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const deleteClient = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'clients', id));
    } else {
      setClients((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // PROJECTS ACTIONS
  const addProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('proj');
    const newProject: Project = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'projects', id), newProject);
    } else {
      setProjects((prev) => [newProject, ...prev]);
    }

    return id;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'projects', id), { ...updates, updatedAt });
    } else {
      setProjects((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const deleteProject = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'projects', id));
    } else {
      setProjects((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // TASKS ACTIONS
  const addTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('task');
    const newTask: Task = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'tasks', id), newTask);
    } else {
      setTasks((prev) => [newTask, ...prev]);
    }

    return id;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'tasks', id), { ...updates, updatedAt });
    } else {
      setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'Završeno' ? 'Za uraditi' : 'Završeno';
    await updateTask(id, { status: newStatus });
  };

  const deleteTask = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'tasks', id));
    } else {
      setTasks((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // ACTIVITIES ACTIONS
  const addActivity = async (data: Omit<Activity, 'id' | 'createdAt' | 'userId'>): Promise<string> => {
    const id = genId('act');
    const newActivity: Activity = {
      ...data,
      id,
      createdAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'activities', id), newActivity);
    } else {
      setActivities((prev) => [newActivity, ...prev]);
    }

    return id;
  };

  const deleteActivity = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'activities', id));
    } else {
      setActivities((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // FINANCES ACTIONS
  const addFinance = async (data: Omit<Finance, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('fin');
    const newFinance: Finance = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'finances', id), newFinance);
    } else {
      setFinances((prev) => [newFinance, ...prev]);
    }

    // Update Client metrics if linked
    if (data.clientId && data.type === 'prihod') {
      const client = clients.find((c) => c.id === data.clientId);
      if (client) {
        const totalEarned = (client.totalEarned || 0) + (data.status === 'Plaćeno' ? data.amount : 0);
        const unpaidAmount = (client.unpaidAmount || 0) + (data.status === 'Neplaćeno' ? data.amount : 0);
        await updateClient(data.clientId, { totalEarned, unpaidAmount });
      }
    }

    return id;
  };

  const updateFinance = async (id: string, updates: Partial<Finance>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'finances', id), { ...updates, updatedAt });
    } else {
      setFinances((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const deleteFinance = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'finances', id));
    } else {
      setFinances((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // SERVICES ACTIONS
  const addService = async (data: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> => {
    const id = genId('serv');
    const newService: ServiceItem = {
      ...data,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: currentUserId,
    };

    if (user && !isDemoMode) {
      await setDoc(doc(db, 'services', id), newService);
    } else {
      setServices((prev) => [newService, ...prev]);
    }

    return id;
  };

  const updateService = async (id: string, updates: Partial<ServiceItem>) => {
    const updatedAt = nowIso;
    if (user && !isDemoMode) {
      await updateDoc(doc(db, 'services', id), { ...updates, updatedAt });
    } else {
      setServices((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt } : item)));
    }
  };

  const deleteService = async (id: string) => {
    if (user && !isDemoMode) {
      await deleteDoc(doc(db, 'services', id));
    } else {
      setServices((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // RESET SAMPLE DATA
  const resetToSampleData = () => {
    setLeads(INITIAL_LEADS);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setActivities(INITIAL_ACTIVITIES);
    setFinances(INITIAL_FINANCES);
    setServices(INITIAL_SERVICES);

    localStorage.setItem(LOCAL_STORAGE_KEY_LEADS, JSON.stringify(INITIAL_LEADS));
    localStorage.setItem(LOCAL_STORAGE_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(LOCAL_STORAGE_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(LOCAL_STORAGE_KEY_FINANCES, JSON.stringify(INITIAL_FINANCES));
    localStorage.setItem(LOCAL_STORAGE_KEY_SERVICES, JSON.stringify(INITIAL_SERVICES));
  };

  // EXPORT CSV
  const exportDataToCSV = (entityName: 'leads' | 'clients' | 'projects' | 'finances') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${entityName}_izvoz_${nowIso}.csv`;

    if (entityName === 'leads') {
      headers = ['Naziv firme', 'Kontakt osoba', 'Email', 'Telefon', 'Grad', 'Djelatnost', 'Izvor', 'Vrijednost', 'Valuta', 'Prioritet', 'Status', 'Zadnji kontakt'];
      rows = leads.map((l) => [
        l.companyName,
        l.contactName,
        l.email,
        l.phone,
        l.city,
        l.industry,
        l.source,
        l.estimatedValue.toString(),
        l.currency,
        l.priority,
        l.status,
        l.lastContactDate || '',
      ]);
    } else if (entityName === 'clients') {
      headers = ['Naziv firme', 'Kontakt osoba', 'Email', 'Telefon', 'Grad/Adresa', 'Djelatnost', 'Status', 'Ukupno zaradjeno', 'Neplaceno'];
      rows = clients.map((c) => [
        c.companyName,
        c.contactName,
        c.email,
        c.phone,
        c.address,
        c.industry,
        c.status,
        c.totalEarned.toString(),
        c.unpaidAmount.toString(),
      ]);
    } else if (entityName === 'projects') {
      headers = ['Naziv projekta', 'Klijent', 'Vrsta', 'URL', 'Status', 'Ugovorena cijena', 'Uplaceno', 'Preostalo', 'Istek domene', 'Istek hostinga'];
      rows = projects.map((p) => [
        p.title,
        p.clientName,
        p.projectType,
        p.websiteUrl,
        p.status,
        p.agreedPrice.toString(),
        p.paidAmount.toString(),
        p.remainingAmount.toString(),
        p.domainExpirationDate || '',
        p.hostingExpirationDate || '',
      ]);
    } else if (entityName === 'finances') {
      headers = ['Tip', 'Kategorija', 'Opis', 'Iznos', 'Valuta', 'Datum', 'Status', 'Klijent', 'Broj fakture'];
      rows = finances.map((f) => [
        f.type,
        f.category,
        f.description,
        f.amount.toString(),
        f.currency,
        f.date,
        f.status,
        f.clientName || '',
        f.invoiceNumber || '',
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SEED SAMPLE DATA TO FIRESTORE
  const seedSampleDataToFirestore = async () => {
    if (!user) return;
    const userId = user.uid;

    for (const item of INITIAL_LEADS) {
      await setDoc(doc(db, 'leads', item.id), { ...item, userId });
    }
    for (const item of INITIAL_CLIENTS) {
      await setDoc(doc(db, 'clients', item.id), { ...item, userId });
    }
    for (const item of INITIAL_PROJECTS) {
      await setDoc(doc(db, 'projects', item.id), { ...item, userId });
    }
    for (const item of INITIAL_TASKS) {
      await setDoc(doc(db, 'tasks', item.id), { ...item, userId });
    }
    for (const item of INITIAL_ACTIVITIES) {
      await setDoc(doc(db, 'activities', item.id), { ...item, userId });
    }
    for (const item of INITIAL_FINANCES) {
      await setDoc(doc(db, 'finances', item.id), { ...item, userId });
    }
    for (const item of INITIAL_SERVICES) {
      await setDoc(doc(db, 'services', item.id), { ...item, userId });
    }
  };

  return (
    <DataContext.Provider
      value={{
        user,
        isDemoMode,
        isLoading,
        theme,
        setTheme,
        toggleTheme,
        toggleDemoMode,
        loginGoogle,
        logout,
        leads,
        clients,
        projects,
        tasks,
        activities,
        finances,
        services,
        userSettings,
        addLead,
        updateLead,
        updateLeadStatus,
        deleteLead,
        convertLeadToClient,
        importLeadsCSV,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        toggleTaskCompleted,
        deleteTask,
        addActivity,
        deleteActivity,
        addFinance,
        updateFinance,
        deleteFinance,
        addService,
        updateService,
        deleteService,
        resetToSampleData,
        seedSampleDataToFirestore,
        exportDataToCSV,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData mora biti korišten unutar DataProvider-a');
  }
  return context;
};
