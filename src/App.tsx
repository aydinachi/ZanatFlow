import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';

// Views
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { AISalesAgentView } from './components/views/AISalesAgentView';
import { LeadFinderView } from './components/views/LeadFinderView';
import { ResearchView } from './components/views/ResearchView';
import { LeadsView } from './components/views/LeadsView';
import { ClientsView } from './components/views/ClientsView';
import { ProjectsView } from './components/views/ProjectsView';
import { TasksView } from './components/views/TasksView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { FinancesView } from './components/views/FinancesView';
import { ServicesView } from './components/views/ServicesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { SettingsView } from './components/views/SettingsView';

// Modals & Drawers
import { LeadModal } from './components/modals/LeadModal';
import { LeadDrawer } from './components/drawers/LeadDrawer';
import { ClientModal } from './components/modals/ClientModal';
import { ProjectModal } from './components/modals/ProjectModal';
import { TaskModal } from './components/modals/TaskModal';
import { FinanceModal } from './components/modals/FinanceModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { ImportCSVModal } from './components/modals/ImportCSVModal';

import { Lead, Client, Project, Task, Finance, ServiceItem } from './types';

function MainAppContent() {
  const { user } = useData();
  const [guestMode, setGuestMode] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Drawers States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeToEdit, setFinanceToEdit] = useState<Finance | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceItem | null>(null);

  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);

  // Unauthenticated Landing Screen Check
  if (!user && !guestMode) {
    return <LoginView onContinueAsGuest={() => setGuestMode(true)} />;
  }

  // Quick Triggers
  const handleOpenNewLead = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  const handleOpenNewClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewFinance = () => {
    setFinanceToEdit(null);
    setIsFinanceModalOpen(true);
  };

  const handleEditFinance = (finance: Finance) => {
    setFinanceToEdit(finance);
    setIsFinanceModalOpen(true);
  };

  const handleOpenNewService = () => {
    setServiceToEdit(null);
    setIsServiceModalOpen(true);
  };

  const handleEditService = (service: ServiceItem) => {
    setServiceToEdit(service);
    setIsServiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        onQuickAddLead={handleOpenNewLead}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Header Navigation */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewLead={handleOpenNewLead}
        onOpenNewTask={handleOpenNewTask}
        onSelectLead={handleSelectLead}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main View Area */}
      <main
        className={`flex-1 pt-18 sm:pt-20 px-3 sm:px-6 transition-all duration-300 ml-0 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenNewLead={handleOpenNewLead}
              onOpenNewClient={handleOpenNewClient}
              onOpenNewProject={handleOpenNewProject}
              onOpenNewTask={handleOpenNewTask}
              onOpenNewFinance={handleOpenNewFinance}
              onSelectLead={handleSelectLead}
            />
          )}

          {activeTab === 'agent' && <AISalesAgentView />}

          {activeTab === 'finder' && <LeadFinderView />}

          {activeTab === 'research' && (
            <ResearchView
              onOpenNewLead={handleOpenNewLead}
              onEditLead={handleEditLead}
              onSelectLead={handleSelectLead}
              onNavigateToLeads={() => setActiveTab('leads')}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              onOpenNewLead={handleOpenNewLead}
              onEditLead={handleEditLead}
              onSelectLead={handleSelectLead}
              onOpenImportCSV={() => setIsImportCSVOpen(true)}
              onNavigateToResearch={() => setActiveTab('research')}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              onOpenNewClient={handleOpenNewClient}
              onEditClient={handleEditClient}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              onOpenNewProject={handleOpenNewProject}
              onEditProject={handleEditProject}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              onOpenNewTask={handleOpenNewTask}
              onEditTask={handleEditTask}
            />
          )}

          {activeTab === 'activities' && <ActivitiesView />}

          {activeTab === 'finances' && (
            <FinancesView
              onOpenNewFinance={handleOpenNewFinance}
              onEditFinance={handleEditFinance}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              onOpenNewService={handleOpenNewService}
              onEditService={handleEditService}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && (
            <SettingsView onOpenImportCSV={() => setIsImportCSVOpen(true)} />
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        leadToEdit={leadToEdit}
      />

      <LeadDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
        onEditLead={handleEditLead}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectToEdit={projectToEdit}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      <FinanceModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        financeToEdit={financeToEdit}
      />

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        serviceToEdit={serviceToEdit}
      />

      <ImportCSVModal
        isOpen={isImportCSVOpen}
        onClose={() => setIsImportCSVOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <MainAppContent />
    </DataProvider>
  );
}
