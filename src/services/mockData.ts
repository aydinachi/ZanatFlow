import { Lead, Client, Project, Task, Activity, Finance, ServiceItem } from '../types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    companyName: 'Restoran Bašča Baščaršija',
    contactName: 'Mirza Smajić',
    email: 'info@restoranbasca.ba',
    phone: '+387 61 234 567',
    website: 'http://restoran-basca-old.ba',
    city: 'Sarajevo',
    industry: 'Ugostiteljstvo & Turizam',
    source: 'Google Maps',
    socialLinks: {
      facebook: 'https://facebook.com/restoranbascasarajevo',
      instagram: 'https://instagram.com/restoranbasca'
    },
    serviceType: 'Redizajn web stranice + QR Meni + Online Rezervacije',
    currentWebsiteQuality: 'Zastarjela',
    identifiedProblems: 'Stranica iz 2015. godine, neprilagođena za mobitele, spor odziv, nema jelovnik u PDF/QR formatu, nema online rezervacije stola.',
    proposedSolution: 'Izrada ultra-brze Next.js/React web stranice sa dvojezičnim QR jelovnikom i formom za brzu rezervaciju stola.',
    estimatedValue: 2800,
    currency: 'BAM',
    priority: 'Visok',
    probability: 80,
    status: 'Pregovori',
    notes: 'Vlasnik je spreman za rad od početka sljedećeg mjeseca. Želi naglasak na tradiciju i vizuelni prikaz jela.',
    lastContactDate: '2026-10-28',
    nextFollowUpDate: '2026-11-02',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'lead-2',
    companyName: 'Stomatološka Poliklinika Smile',
    contactName: 'dr. Amra Kovačević',
    email: 'amra@smile-poliklinika.ba',
    phone: '+387 36 555 123',
    website: '',
    city: 'Mostar',
    industry: 'Zdravstvo & Stomatologija',
    source: 'Instagram',
    socialLinks: {
      instagram: 'https://instagram.com/smile_poliklinika_mostar'
    },
    serviceType: 'Izrada kompletne web stranice + Google profil',
    currentWebsiteQuality: 'Nema web',
    identifiedProblems: 'Nemaju web stranicu, oslanjaju se samo na Instagram. Pacijenti često pitaju za cjenovnik i radno vrijeme na Google pretrazi.',
    proposedSolution: 'Izrada moderne prezentacijske web stranice sa cjenovnikom usluga, biografijama stomatologa i zakazivanjem konsultacija.',
    estimatedValue: 3500,
    currency: 'BAM',
    priority: 'Visok',
    probability: 90,
    status: 'Ponuda poslana',
    notes: 'Poslana ponuda 30. oktobra. Čeka se odobrenje upravnog odbora poliklinike.',
    lastContactDate: '2026-10-30',
    nextFollowUpDate: '2026-11-03',
    createdAt: '2026-10-20',
    updatedAt: '2026-10-30',
    userId: 'demo-user'
  },
  {
    id: 'lead-3',
    companyName: 'Kovačević Inženjering & Građenje',
    contactName: 'Goran Kovačević',
    email: 'goran@kovacevic-ing.ba',
    phone: '+387 65 987 654',
    website: 'http://kovacevic-ing.ba',
    city: 'Banja Luka',
    industry: 'Građevinarstvo & Arhitektura',
    source: 'LinkedIn',
    socialLinks: {
      linkedin: 'https://linkedin.com/company/kovacevic-ing'
    },
    serviceType: 'Redizajn i izrada kataloga referentnih projekata',
    currentWebsiteQuality: 'Nekvalitetna',
    identifiedProblems: 'Zastarjel vizuelni identitet, galerija radova se ne učitava na iOS uređajima, nema opisa tehnologija građenja.',
    proposedSolution: 'Moderna portfoliio stranica sa filtriranjem po kategorijama objekata (stambeni, poslovni, industrijski) i 3D vizuelizacijama.',
    estimatedValue: 4200,
    currency: 'BAM',
    priority: 'Srednji',
    probability: 60,
    status: 'Kontaktiran',
    notes: 'Poslan inicijalni e-mail s analizom grešaka na njihovoj trenutnoj stranici.',
    lastContactDate: '2026-10-25',
    nextFollowUpDate: '2026-11-04',
    createdAt: '2026-10-22',
    updatedAt: '2026-10-25',
    userId: 'demo-user'
  },
  {
    id: 'lead-4',
    companyName: 'Advokatska Kancelarija Memić',
    contactName: 'Haris Memić',
    email: 'haris@advokat-memic.ba',
    phone: '+387 33 222 333',
    website: '',
    city: 'Sarajevo',
    industry: 'Pravne usluge',
    source: 'Preporuka',
    serviceType: 'Izrada reprezentativne pravne web stranice',
    currentWebsiteQuality: 'Nema web',
    identifiedProblems: 'Klijenti ih traže putem preporuke ali ne mogu provjeriti stručne oblasti i lokaciju uredno online.',
    proposedSolution: 'Elegantna, minimalistička web stranica sa prikazom pravnih oblasti, profilom advokata i kontakt formom.',
    estimatedValue: 2200,
    currency: 'BAM',
    priority: 'Visok',
    probability: 75,
    status: 'Potrebno ponovno javljanje',
    notes: 'Dogovoreno da se javim početkom novembra nakon što završi suđenje u predmetu.',
    lastContactDate: '2026-10-18',
    nextFollowUpDate: '2026-11-01',
    createdAt: '2026-10-10',
    updatedAt: '2026-10-18',
    userId: 'demo-user'
  },
  {
    id: 'lead-5',
    companyName: 'FitLife Fitness Centar',
    contactName: 'Edin Nukić',
    email: 'info@fitlife.ba',
    phone: '+387 62 111 222',
    website: 'http://fitlife.ba',
    city: 'Zenica',
    industry: 'Sport & Fitness',
    source: 'Direktni kontakt',
    socialLinks: {
      instagram: 'https://instagram.com/fitlife_zenica'
    },
    serviceType: 'Redizajn + raspored treninga + članarine',
    currentWebsiteQuality: 'Prosječna',
    identifiedProblems: 'Stranica nema ažurne rasporede grupnih treninga, članarine nisu jasno istaknute.',
    proposedSolution: 'Interaktivni raspored treninga sa trenerima i mrežom za prijavu novih članova.',
    estimatedValue: 2400,
    currency: 'BAM',
    priority: 'Srednji',
    probability: 50,
    status: 'Odgovorio',
    notes: 'Zainteresovani su za zimsku promociju u decembru.',
    lastContactDate: '2026-10-27',
    nextFollowUpDate: '2026-11-06',
    createdAt: '2026-10-18',
    updatedAt: '2026-10-27',
    userId: 'demo-user'
  },
  {
    id: 'lead-6',
    companyName: 'WoodArt Namještaj po mjeri',
    contactName: 'Tarik Lapo',
    email: 'woodart.konjic@gmail.com',
    phone: '+387 61 777 888',
    website: '',
    city: 'Konjic',
    industry: 'Proizvodnja namještaja',
    source: 'Preporuka',
    serviceType: 'E-commerce Katalog sa upitnikom za ponudu',
    currentWebsiteQuality: 'Nema web',
    identifiedProblems: 'Prodaju vrše samo preko Instagrama, gube klijente iz dijaspore koji žele kataloški pregled kuhinja i ormara sa okvirnim kalkulatorom cijena.',
    proposedSolution: 'Moderni web katalog namještaja sa 3D prikazom i formom za slanje dimenzija i zahtjeva za ponudu.',
    estimatedValue: 5000,
    currency: 'BAM',
    priority: 'Visok',
    probability: 40,
    status: 'Novi potencijalni klijent',
    notes: 'Dobili preporuku od klijenta Slastic Pekara. Potrebno poslati uvodnu prezentaciju.',
    lastContactDate: '2026-10-31',
    nextFollowUpDate: '2026-11-02',
    createdAt: '2026-10-31',
    updatedAt: '2026-10-31',
    userId: 'demo-user'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'client-1',
    companyName: 'Hotel & Spa Central Sarajevo',
    contactName: 'Selma Hadžić',
    email: 'selma@hotelcentral.ba',
    phone: '+387 33 567 890',
    address: 'ul. Ferhadija 18, 71000 Sarajevo',
    website: 'https://hotelcentral.ba',
    industry: 'Ugostiteljstvo & Hotelijerstvo',
    status: 'Aktivno',
    notes: 'Dugogodišnji partner. Imamo ugovor o mjesečnom tehničkom održavanju web stranice.',
    totalEarned: 6500,
    unpaidAmount: 0,
    currency: 'BAM',
    createdAt: '2025-11-10',
    updatedAt: '2026-10-01',
    userId: 'demo-user'
  },
  {
    id: 'client-2',
    companyName: 'IT Consulting & Solutions d.o.o.',
    contactName: 'Bojan Savić',
    email: 'bojan@itconsulting.ba',
    phone: '+387 33 888 999',
    address: 'ul. Zmaja od Bosne 74, 71000 Sarajevo',
    website: 'https://itconsulting.ba',
    industry: 'Informacione Tehnologije',
    status: 'Aktivno',
    notes: 'Radi se na B2B klijentskom portalu. Druga rata računa čeka na naplatu po završetku testne faze.',
    totalEarned: 8000,
    unpaidAmount: 3000,
    currency: 'BAM',
    createdAt: '2026-04-12',
    updatedAt: '2026-10-15',
    userId: 'demo-user'
  },
  {
    id: 'client-3',
    companyName: 'Pekara i Slastičarna Slastic',
    contactName: 'Lejla Bešić',
    email: 'uprava@slastic.ba',
    phone: '+387 32 444 555',
    address: 'ul. Maršala Tita 45, 72000 Zenica',
    website: 'https://slastic.ba',
    industry: 'Hrana i Proizvodnja',
    status: 'Završeno',
    notes: 'Projekat završen u potpunosti i plaćen. Vrlo zadovoljni klijenti.',
    totalEarned: 2200,
    unpaidAmount: 0,
    currency: 'BAM',
    createdAt: '2026-02-01',
    updatedAt: '2026-06-15',
    userId: 'demo-user'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Redizajn i izrada web prezentacije Hotel Central',
    clientId: 'client-1',
    clientName: 'Hotel & Spa Central Sarajevo',
    websiteUrl: 'https://hotelcentral.ba',
    projectType: 'Poslovna web stranica + Rezervacije',
    description: 'Kompletna izrada dvojezičke web stranice za luksuzni hotel u centru Sarajeva sa integracijom booking motora.',
    technologies: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'i18n'],
    startDate: '2025-11-15',
    deadlineDate: '2026-01-30',
    completedDate: '2026-01-25',
    status: 'Završeno',
    agreedPrice: 6500,
    paidAmount: 6500,
    remainingAmount: 0,
    currency: 'BAM',
    hostingProvider: 'Hetzner Cloud CloudVPS',
    domainRegistrar: 'UTIC (.ba registrar)',
    domainExpirationDate: '2027-11-10',
    hostingExpirationDate: '2027-11-10',
    githubRepo: 'https://github.com/myusername/hotel-central-web',
    deploymentUrl: 'https://hotelcentral.ba',
    adminPanelUrl: 'https://hotelcentral.ba/admin',
    credentialsNotes: 'Pristupni podaci pohranjeni u Bitwarden trezoru u fascikli HotelCentral.',
    notes: 'Ugovoreno mjesečno održavanje u iznosu od 200 KM/mjesečno.',
    attachments: [
      { name: 'Ugovor_Hotel_Central_Signed.pdf', url: '#', size: 1240000, type: 'application/pdf' },
      { name: 'Specifikacija_Zatjeva_v2.docx', url: '#', size: 450000, type: 'application/docx' }
    ],
    createdAt: '2025-11-15',
    updatedAt: '2026-01-25',
    userId: 'demo-user'
  },
  {
    id: 'proj-2',
    title: 'B2B Portal i CRM Klijent Management',
    clientId: 'client-2',
    clientName: 'IT Consulting & Solutions d.o.o.',
    websiteUrl: 'https://itconsulting.ba',
    projectType: 'Web Aplikacija / CRM',
    description: 'Razvoj interne B2B aplikacije za upravljanje zahtjevima klijenata, ticketing sistem i automatsko slanje računa.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Firebase'],
    startDate: '2026-05-01',
    deadlineDate: '2026-11-15',
    status: 'U izradi',
    agreedPrice: 8000,
    paidAmount: 5000,
    remainingAmount: 3000,
    currency: 'BAM',
    hostingProvider: 'Vercel Pro + Firebase',
    domainRegistrar: 'Namecheap',
    domainExpirationDate: '2026-12-01',
    hostingExpirationDate: '2026-11-20', // Isteče uskoro!
    githubRepo: 'https://github.com/myusername/itconsulting-b2b-portal',
    deploymentUrl: 'https://portal.itconsulting.ba',
    adminPanelUrl: 'https://portal.itconsulting.ba/login',
    credentialsNotes: 'Admin račun: admin@itconsulting.ba (Lozinka u 1Password)',
    notes: 'Preostala uplata od 3.000 KM dospijeva nakon konačnog akceptacijskog testiranja u novembru.',
    attachments: [
      { name: 'Arhitektura_Baze_Podataka.png', url: '#', size: 850000, type: 'image/png' }
    ],
    createdAt: '2026-05-01',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'proj-3',
    title: 'Web stranica i QR Meni za Slastic Pekaru',
    clientId: 'client-3',
    clientName: 'Pekara i Slastičarna Slastic',
    websiteUrl: 'https://slastic.ba',
    projectType: 'Landing stranica + Katalog',
    description: 'Kompaktna web prezentacija sa ponudom torti i kolača te QR kodovima na stolovima lokala.',
    technologies: ['React', 'Vite', 'Tailwind CSS'],
    startDate: '2026-02-05',
    deadlineDate: '2026-03-01',
    completedDate: '2026-02-28',
    status: 'Održavanje',
    agreedPrice: 2200,
    paidAmount: 2200,
    remainingAmount: 0,
    currency: 'BAM',
    hostingProvider: 'Netlify',
    domainRegistrar: 'Leftor (.ba)',
    domainExpirationDate: '2027-02-01',
    hostingExpirationDate: '2027-02-01',
    githubRepo: 'https://github.com/myusername/slastic-landing',
    deploymentUrl: 'https://slastic.ba',
    notes: 'Klijent povremeno šalje slike novih proizvoda za galeriju.',
    attachments: [],
    createdAt: '2026-02-05',
    updatedAt: '2026-03-01',
    userId: 'demo-user'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Javiti se Harisu (Advokatska Kancelarija Memić) za korigovanu ponudu',
    description: 'Nazvati Harisa na +387 33 222 333 i provjeriti da li je pregledao uvodni prijedlog strukture pravne web stranice.',
    dueDate: '2026-11-01',
    priority: 'Visok',
    status: 'Za uraditi',
    type: 'Podsjetnik za javljanje',
    relatedLeadId: 'lead-4',
    createdAt: '2026-10-28',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'task-2',
    title: 'Završiti integraciju modul-statistika za B2B Portal IT Consulting',
    description: 'Implementirati grafikone u Recharts biblioteci i provjeriti odziv na mobilnim telefonima.',
    dueDate: '2026-11-03',
    priority: 'Visok',
    status: 'U toku',
    type: 'Projektni zadatak',
    relatedProjectId: 'proj-2',
    createdAt: '2026-10-25',
    updatedAt: '2026-10-29',
    userId: 'demo-user'
  },
  {
    id: 'task-3',
    title: 'Poslati račune za oktobarsko tehničko održavanje web stranica',
    description: 'Izdati fakturu u iznosu od 200 KM klijentu Hotel Central Sarajevo.',
    dueDate: '2026-11-01',
    priority: 'Srednji',
    status: 'Za uraditi',
    type: 'Finansijski zadatak',
    relatedClientId: 'client-1',
    createdAt: '2026-10-30',
    updatedAt: '2026-10-30',
    userId: 'demo-user'
  },
  {
    id: 'task-4',
    title: 'Obnoviti hosting pretplatu za IT Consulting na Vercel servisu',
    description: 'Hosting zakupljen za klijenta isteče 20. novembra. Potrebno izvršiti uplatu.',
    dueDate: '2026-11-15',
    priority: 'Visok',
    status: 'Za uraditi',
    type: 'Opći zadatak',
    relatedProjectId: 'proj-2',
    createdAt: '2026-10-20',
    updatedAt: '2026-10-20',
    userId: 'demo-user'
  },
  {
    id: 'task-5',
    title: 'Pripremiti uvodni demo i ponudu za WoodArt Namještaj',
    description: 'Sastaviti prijedlog funkcionalnosti web kataloga sa opcijom slanja dimenzija.',
    dueDate: '2026-11-04',
    priority: 'Srednji',
    status: 'Za uraditi',
    type: 'Podsjetnik za javljanje',
    relatedLeadId: 'lead-6',
    createdAt: '2026-10-31',
    updatedAt: '2026-10-31',
    userId: 'demo-user'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    entityType: 'lead',
    entityId: 'lead-1',
    entityName: 'Restoran Bašča Baščaršija',
    type: 'E-mail',
    date: '2026-10-28',
    description: 'Poslan detaljan prijedlog web stranice sa dvojezičnim QR jelovnikom i formom za rezervacije.',
    nextStep: 'Nazvati vlasnika u ponedjeljak za pregled ponude.',
    createdAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'act-2',
    entityType: 'lead',
    entityId: 'lead-2',
    entityName: 'Stomatološka Poliklinika Smile',
    type: 'Telefonski poziv',
    date: '2026-10-30',
    description: 'Obavljen razgovor sa dr. Amrom. Izrazili veliku zainteresovanost za pakete sa izradom vizuelnog identiteta.',
    nextStep: 'Čeka se potvrda sa sastanka upravnog odbora.',
    createdAt: '2026-10-30',
    userId: 'demo-user'
  },
  {
    id: 'act-3',
    entityType: 'project',
    entityId: 'proj-2',
    entityName: 'B2B Portal i CRM IT Consulting',
    type: 'Sastanak',
    date: '2026-10-29',
    description: 'Online sastanak preko Google Meet-a. Prezentiran demo klijentskog panela i dogovorena završna faza.',
    nextStep: 'Završiti integraciju izvoz podataka u Excel formatu.',
    createdAt: '2026-10-29',
    userId: 'demo-user'
  },
  {
    id: 'act-4',
    entityType: 'lead',
    entityId: 'lead-3',
    entityName: 'Kovačević Inženjering',
    type: 'LinkedIn poruka',
    date: '2026-10-25',
    description: 'Poslana LinkedIn poruka direktoru s primjerima izgrađenih građevinskih portfolia.',
    nextStep: 'Poslati podsjetnik ako ne odgovori do 4. novembra.',
    createdAt: '2026-10-25',
    userId: 'demo-user'
  }
];

export const INITIAL_FINANCES: Finance[] = [
  {
    id: 'fin-1',
    type: 'prihod',
    category: 'Uplata klijenta',
    description: 'Prva rata za izradu B2B Portala (50%)',
    amount: 5000,
    currency: 'BAM',
    date: '2026-05-05',
    status: 'Plaćeno',
    clientId: 'client-2',
    clientName: 'IT Consulting & Solutions d.o.o.',
    projectId: 'proj-2',
    projectName: 'B2B Portal i CRM',
    invoiceNumber: 'FAK-2026-012',
    createdAt: '2026-05-05',
    updatedAt: '2026-05-05',
    userId: 'demo-user'
  },
  {
    id: 'fin-2',
    type: 'prihod',
    category: 'Uplata klijenta',
    description: 'Konačna uplata za projekt web stranice Hotel Central',
    amount: 3250,
    currency: 'BAM',
    date: '2026-01-25',
    status: 'Plaćeno',
    clientId: 'client-1',
    clientName: 'Hotel & Spa Central Sarajevo',
    projectId: 'proj-1',
    projectName: 'Redizajn i web prezentacija',
    invoiceNumber: 'FAK-2026-004',
    createdAt: '2026-01-25',
    updatedAt: '2026-01-25',
    userId: 'demo-user'
  },
  {
    id: 'fin-3',
    type: 'prihod',
    category: 'Uplata klijenta',
    description: 'Uplata za izradu web stranice Slastic Pekara',
    amount: 2200,
    currency: 'BAM',
    date: '2026-02-28',
    status: 'Plaćeno',
    clientId: 'client-3',
    clientName: 'Pekara i Slastičarna Slastic',
    projectId: 'proj-3',
    projectName: 'Web stranica i QR Meni',
    invoiceNumber: 'FAK-2026-008',
    createdAt: '2026-02-28',
    updatedAt: '2026-02-28',
    userId: 'demo-user'
  },
  {
    id: 'fin-4',
    type: 'prihod',
    category: 'Uplata klijenta',
    description: 'Druga rata po završetku B2B Portala',
    amount: 3000,
    currency: 'BAM',
    date: '2026-11-15',
    dueDate: '2026-11-15',
    status: 'Neplaćeno',
    clientId: 'client-2',
    clientName: 'IT Consulting & Solutions d.o.o.',
    projectId: 'proj-2',
    projectName: 'B2B Portal i CRM',
    invoiceNumber: 'FAK-2026-028',
    createdAt: '2026-10-25',
    updatedAt: '2026-10-25',
    userId: 'demo-user'
  },
  {
    id: 'fin-5',
    type: 'trosak',
    category: 'Hosting',
    description: 'Godišnji VPS Server zakup Hetzner',
    amount: 360,
    currency: 'BAM',
    date: '2026-01-10',
    status: 'Plaćeno',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-10',
    userId: 'demo-user'
  },
  {
    id: 'fin-6',
    type: 'trosak',
    category: 'Softver/Pretplata',
    description: 'GitHub Copilot + Vercel Pro pretplata (Oktobar 2026)',
    amount: 85,
    currency: 'BAM',
    date: '2026-10-15',
    status: 'Plaćeno',
    createdAt: '2026-10-15',
    updatedAt: '2026-10-15',
    userId: 'demo-user'
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'serv-1',
    name: 'Izrada Landing Stranice',
    description: 'Brza, moderna i konverzijski optimizirana jednostranična web prezentacija namijenjena za promociju jednog proizvoda ili usluge.',
    basePrice: 1200,
    currency: 'BAM',
    estimatedDeliveryDays: 7,
    includedFeatures: [
      'Responzivan dizajn (Mobitel, Tablet, Desktop)',
      'Brzina učitavanja 95+ na Google PageSpeed',
      'Kontakt forma i integracija sa e-mailom',
      'Google Maps & Društvene mreže',
      'Osnovna SEO optimizacija'
    ],
    optionalAddons: ['Dvojezičnost (+300 KM)', 'Animirani vizuelni efekti (+200 KM)'],
    isPopular: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  },
  {
    id: 'serv-2',
    name: 'Poslovna Web Stranica',
    description: 'Višestranata web reprezentacija (Početna, O nama, Usluge, Galerija/Projekti, Blog/Novosti, Kontakt) za pravna lica i obrtnike.',
    basePrice: 2500,
    currency: 'BAM',
    estimatedDeliveryDays: 14,
    includedFeatures: [
      'Do 8 prilagođenih podstranica',
      'CMS panel za samostalno uređivanje sadržaja',
      'Google My Business integracija i SEO optimizacija',
      'Brzo učitavanje i SSL sigurnosni sertifikat',
      'Obuka korisnika za rad u panelu'
    ],
    optionalAddons: ['E-mail marketing integracija (+250 KM)', 'Višejezičnost (+400 KM)'],
    isPopular: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  },
  {
    id: 'serv-3',
    name: 'Izrada Web Shopa (E-commerce)',
    description: 'Kompletna web prodavnica sa katalogom artikala, korpom, online kartičnim plaćanjem i upravljanjem narudžbama.',
    basePrice: 4500,
    currency: 'BAM',
    estimatedDeliveryDays: 25,
    includedFeatures: [
      'Neograničen broj artikala i kategorija',
      'Integracija kartičnog plaćanja (Monri/Corvus/Stripe)',
      'Automatska obavještenja o narudžbi putem SMS-a/E-maila',
      'Kuponi i popusti za klijente',
      'Izvoz faktura u PDF formatu'
    ],
    optionalAddons: ['Integracija sa fiskalnom kasom (+800 KM)', 'Import artikala iz Excel-a (+300 KM)'],
    isPopular: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  },
  {
    id: 'serv-4',
    name: 'Redizajn & Optimizacija Postojeće Stranice',
    description: 'Modernizacija zastarjelog sajta, ubrzanje učitavanja, popravka mobilnog prikaza i podizanje sigurnosti.',
    basePrice: 1500,
    currency: 'BAM',
    estimatedDeliveryDays: 10,
    includedFeatures: [
      'Potpuni vizuelni fejslift u modernom UI stilu',
      'Optimizacija slika i koda za max brzinu',
      'Popravka SEO grešaka i slomljenih linkova',
      'Prilagođavanje za sve veličine ekrana'
    ],
    optionalAddons: ['Prijenos na novi brži server (+150 KM)'],
    isPopular: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  },
  {
    id: 'serv-5',
    name: 'Tehničko Održavanje & Sigurnost',
    description: 'Mjesečni paket brige o web stranici: rezervne kopije, sigurnosne zakrpe, sitne izmjene tekstova i nadzor rada servera.',
    basePrice: 200,
    currency: 'BAM',
    estimatedDeliveryDays: 30,
    includedFeatures: [
      'Sedmični backup baze i fajlova',
      'Ažuriranje dodataka i sistema',
      '2 sata mjesečno za unos novih materijala',
      'Prioritetna tehnička podrška 24/7'
    ],
    optionalAddons: [],
    isPopular: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  },
  {
    id: 'serv-6',
    name: 'Razvoj Poslovne Web Aplikacije / CRM',
    description: 'Prilagođeni softverski sistem po mjeri vašeg poslovanja: interaktivne tabele, baze podataka, uloge korisnika i analitika.',
    basePrice: 6000,
    currency: 'BAM',
    estimatedDeliveryDays: 45,
    includedFeatures: [
      'Napredna baza podataka u oblaku',
      'Prijava sa višestrukim nivoima pristupa (RBAC)',
      'Interaktivni grafikoni i izvještaji',
      'Automatizacija e-mail podsjetnika i zadataka'
    ],
    optionalAddons: ['REST API integracija (+1000 KM)'],
    isPopular: false,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    userId: 'demo-user'
  }
];

// ==========================================
// INITIAL AI SALES AGENT SAMPLE DATA
// ==========================================
import { SalesMessage, LeadAnalysis, SalesActivity, SalesFollowUp, SalesIntegration } from '../types';

export const INITIAL_SALES_ANALYSES: LeadAnalysis[] = [
  {
    id: 'analysis-lead-1',
    leadId: 'lead-1',
    companyName: 'Restoran Bašča Baščaršija',
    website: 'http://restoran-basca-old.ba',
    webStatus: 'NEEDS_RECONSTRUCTION',
    leadScore: 85,
    scoreCategory: 'Vrlo visok potencijal',
    scoreReasons: [
      '+40: Web stranica je zastarjela i neprilagođena za mobitele',
      '+25: Odlična pozicija i recenzije na Google Mapsu (4.6★)',
      '+20: Nedostaje dvojezični QR meni i online rezervacije'
    ],
    summary: 'Tragom visoke ocjene na Google Maps-u, Restoran Bašča privlači turiste i domaće goste, ali gubi rezervacije zbog neupotrebljivog sajta.',
    onlinePresenceAnalysis: 'Postojeći sajt je kreiran 2015. godine u starom Flash/HTTP formatu, te je nepotpuno responzivan na novijim telefonima.',
    identifiedProblems: [
      'Stranica nije prilagođena mobilnim uređajima',
      'Nema SSL certifikat (HTTP umjesto HTTPS)',
      'Nedostaje online forma za brzu rezervaciju stola'
    ],
    proposedService: 'Redizajn web stranice + QR Meni + Online Rezervacije',
    offerType: 'Rekonstrukcija web stranice',
    recommendedChannel: 'email',
    reasonForInterest: 'Veliki priliv turista koji žele unajmiti sto unaprijed online.',
    reliability: 'Pouzdan podatak',
    createdAt: '2026-10-28',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'analysis-lead-2',
    leadId: 'lead-2',
    companyName: 'Stomatološka Poliklinika Smile',
    website: '',
    webStatus: 'NO_WEBSITE',
    leadScore: 92,
    scoreCategory: 'Vrlo visok potencijal',
    scoreReasons: [
      '+40: Kompanija uopšte nema web stranicu',
      '+30: Visoke ocjene i cijenjena usluga u Mostaru',
      '+22: Pacijenti traže cjenovnik i profil stomatologa'
    ],
    summary: 'Stomatološka ordinacija Smile ima fantastičnu reputaciju, ali nema zvaničnu web lokaciju, oslanjajući se samo na društvene mreže.',
    onlinePresenceAnalysis: 'Google profil ima visok broj pretraga mjesečno ali vodi samo na broj telefona.',
    identifiedProblems: [
      'Nema zvanične web stranice na Google-u',
      'Pacijenti ne mogu vidjeti cjenovnik stomatoloških usluga',
      'Nema mogućnosti zakazivanja prvog besplatnog pregleda'
    ],
    proposedService: 'Izrada kompletne web stranice + Google profil',
    offerType: 'Nova web stranica',
    recommendedChannel: 'email',
    reasonForInterest: 'Privlačenje pacijenata iz cijele hercegovačke regije i dijaspore.',
    reliability: 'Pouzdan podatak',
    createdAt: '2026-10-30',
    updatedAt: '2026-10-30',
    userId: 'demo-user'
  }
];

export const INITIAL_SALES_MESSAGES: SalesMessage[] = [
  {
    id: 'msg-1',
    leadId: 'lead-1',
    companyName: 'Restoran Bašča Baščaršija',
    contactName: 'Mirza Smajić',
    recipientEmail: 'info@restoranbasca.ba',
    recipientPhone: '+387 61 234 567',
    channel: 'email',
    offerType: 'Rekonstrukcija web stranice',
    proposedService: 'Redizajn web stranice + QR Meni',
    leadScore: 85,
    reasonForContact: 'Modernizacija stranice i uvođenje online rezervacija',
    subject: 'Prijedlog moderne web stranice i QR jelovnika za Restoran Bašča',
    bodyText: `Poštovani Mirza,

Moje ime je Ajdin Beganović iz studija ZanatFlow. Pratim vaš rad na Baščaršiji i vidim da imate sjajne ocjene gostiju.

Pregledom vašeg profila uočio sam da vaša trenutna web stranica nije prilagođena mobilnim telefonima i nema opciju dvojezičnog QR jelovnika niti online rezervacije stola.

Pripremio sam brz interaktivni demo kako bi nova stranica izgledala na telefonima vaših gostiju.

Jeste li slobodni za kratki 5-minutni poziv ove sedmice?

Srdačan pozdrav,
Ajdin Beganović
ZanatFlow Studio
Tel: +387 61 000 000
Web: https://zanatflow.ba`,
    status: 'Pending Approval',
    language: 'Bosanski',
    createdAt: '2026-10-28',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'msg-2',
    leadId: 'lead-2',
    companyName: 'Stomatološka Poliklinika Smile',
    contactName: 'dr. Amra Kovačević',
    recipientEmail: 'amra@smile-poliklinika.ba',
    recipientPhone: '+387 36 555 123',
    channel: 'email',
    offerType: 'Nova web stranica',
    proposedService: 'Izrada reprezentativne web stranice poliklinike',
    leadScore: 92,
    reasonForContact: 'Izrada zvanične web stranice sa cjenovnikom i online zakazivanjem',
    subject: 'Prijedlog izrade web stranice za Stomatološku Polikliniku Smile',
    bodyText: `Poštovana dr. Kovačević,

Ja sam Ajdin Beganović, specijalizovani web developer za zdravstvene ustanove.

Prateći rad vaše poliklinike u Mostaru, primijetio sam da nemate zvaničnu web stranicu na Google pretrazi, gdje pacijenti svakodnevno traže cjenovnik i profile vašeg tima.

Možemo izraditi moderan i brz sajt koji će vašim pacijentima omogućiti jednostavan pregled usluga i zakazivanje pregleda.

Bilo bi mi zadovoljstvo poslati vam neobavezujući prijedlog strukture.

Lijep pozdrav,
Ajdin Beganović
ZanatFlow Studio`,
    status: 'Approved',
    approvedAt: '2026-10-30',
    approvedBy: 'Ajdin Beganović',
    language: 'Bosanski',
    createdAt: '2026-10-30',
    updatedAt: '2026-10-30',
    userId: 'demo-user'
  }
];

export const INITIAL_SALES_ACTIVITIES: SalesActivity[] = [
  {
    id: 'sact-1',
    leadId: 'lead-1',
    companyName: 'Restoran Bašča Baščaršija',
    type: 'Analiza pokrenuta',
    channel: 'email',
    description: 'Završena AI analiza kompanije. Izračunat Lead Score: 85/100.',
    createdAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'sact-2',
    leadId: 'lead-2',
    companyName: 'Stomatološka Poliklinika Smile',
    type: 'Poruka odobrena',
    channel: 'email',
    description: 'Prodajna poruka odobrena od strane korisnika u Approval Centeru.',
    messageId: 'msg-2',
    createdAt: '2026-10-30',
    userId: 'demo-user'
  }
];

export const INITIAL_SALES_FOLLOWUPS: SalesFollowUp[] = [
  {
    id: 'fol-1',
    leadId: 'lead-1',
    companyName: 'Restoran Bašča Baščaršija',
    channel: 'email',
    lastContactDate: '2026-10-28',
    nextFollowUpDate: '2026-11-04',
    status: 'Čeka se odgovor',
    lastMessageText: 'Prijedlog moderne web stranice i QR jelovnika za Restoran Bašča',
    suggestedAction: 'Poslati kratki podsjetnik sa ponudom besplatnog demo uzorka.',
    createdAt: '2026-10-28',
    updatedAt: '2026-10-28',
    userId: 'demo-user'
  },
  {
    id: 'fol-2',
    leadId: 'lead-2',
    companyName: 'Stomatološka Poliklinika Smile',
    channel: 'email',
    lastContactDate: '2026-10-30',
    nextFollowUpDate: '2026-11-03',
    status: 'Poruka pripremljena',
    lastMessageText: 'Prijedlog izrade web stranice za Stomatološku Polikliniku Smile',
    suggestedAction: 'Pripremiti poziv nakon odobrenja poruke.',
    createdAt: '2026-10-30',
    updatedAt: '2026-10-30',
    userId: 'demo-user'
  }
];

export const INITIAL_SALES_INTEGRATIONS: SalesIntegration[] = [
  {
    id: 'integ-gmail',
    channel: 'gmail',
    isConnected: true,
    accountEmail: 'aydinachi@gmail.com',
    updatedAt: '2026-11-01',
    userId: 'demo-user'
  },
  {
    id: 'integ-whatsapp',
    channel: 'whatsapp',
    isConnected: false,
    updatedAt: '2026-11-01',
    userId: 'demo-user'
  }
];

