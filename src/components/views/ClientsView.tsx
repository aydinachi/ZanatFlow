import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Client } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ClientsViewProps {
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ onOpenNewClient, onEditClient }) => {
  const { clients, projects, deleteClient } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEarnedAll = clients.reduce((sum, c) => sum + (c.totalEarned || 0), 0);
  const totalUnpaidAll = clients.reduce((sum, c) => sum + (c.unpaidAmount || 0), 0);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Da li ste sigurni da želite obrisati klijenta "${name}"?`)) {
      await deleteClient(id);
      if (selectedClient?.id === id) setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Klijenti i Partneri ({clients.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pregled svih aktivnih i stalnih klijenata sa ukupnom ostvarenom zaradom i projektima.
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Novi klijent
        </button>
      </div>

      {/* Stats Summary Ribbon */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ukupno aktivnih klijenata</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {clients.filter((c) => c.status === 'Aktivno').length} klijenata
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ukupna ostvarena zarada</p>
          <h3 className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(totalEarnedAll, 'BAM')}
          </h3>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Neplaćeni iznosi od klijenata</p>
          <h3 className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {formatCurrency(totalUnpaidAll, 'BAM')}
          </h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pretraži klijente po nazivu, kontaktu ili gradu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Grid of Client Cards & Side Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer space-y-3 shadow-sm hover:shadow-md ${
                  selectedClient?.id === client.id
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {client.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{client.contactName}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {client.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.address || '-'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400">Zarađeno</p>
                    <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(client.totalEarned, client.currency)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">Projekti</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {clientProjects.length} izrađeno
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Client Detail Inspector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          {selectedClient ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedClient.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedClient.industry}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditClient(selectedClient)}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Uredi"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedClient.id, selectedClient.companyName)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    title="Obriši"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Kontakt osoba:</strong> {selectedClient.contactName}
                </p>
                <p>
                  <strong>E-mail:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>Telefon:</strong> {selectedClient.phone}
                </p>
                <p>
                  <strong>Adresa:</strong> {selectedClient.address}
                </p>
                {selectedClient.website && (
                  <p>
                    <strong>Web Stranica:</strong>{' '}
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      {selectedClient.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Napomene</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedClient.notes || 'Nema posebnih napomena.'}</p>
              </div>

              {/* Linked Projects */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Povezani projekti
                </h4>
                <div className="space-y-2">
                  {projects
                    .filter((p) => p.clientId === selectedClient.id)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{proj.title}</p>
                          <p className="text-[10px] text-slate-500">{proj.status}</p>
                        </div>
                        <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(proj.agreedPrice, proj.currency)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Odaberite klijenta iz liste sa lijeve strane za pregled detalja i povezanih projekata.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
