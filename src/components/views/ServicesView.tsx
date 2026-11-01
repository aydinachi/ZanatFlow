import React from 'react';
import { Tag, Plus, Check, Clock, Edit2, Trash2, Sparkles } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ServiceItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ServicesViewProps {
  onOpenNewService: () => void;
  onEditService: (service: ServiceItem) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onOpenNewService, onEditService }) => {
  const { services, deleteService } = useData();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Obriši uslugu "${name}" iz cjenovnika?`)) {
      await deleteService(id);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Usluge i Cjenovnik
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Definisani paketi usluga i standardne cijene za brzu izradu ponuda potencijalnim klijentima.
          </p>
        </div>

        <button
          onClick={onOpenNewService}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Nova usluga
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((serv) => (
          <div
            key={serv.id}
            className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col justify-between space-y-4 relative ${
              serv.isPopular
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {serv.isPopular && (
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-indigo-600 text-white shadow-sm">
                Najpopularnije
              </span>
            )}

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {serv.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{serv.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline gap-1">
                <span className="text-xs text-slate-400 font-medium">od</span>
                <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                  {formatCurrency(serv.basePrice, serv.currency)}
                </span>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{serv.estimatedDeliveryDays} dana
                </span>
              </div>

              {/* Included Features */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Uključeno u paket:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {serv.includedFeatures?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Addons */}
              {serv.optionalAddons?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400">Dodatne opcije:</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    {serv.optionalAddons.join(' · ')}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => onEditService(serv)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Uredi"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(serv.id, serv.name)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                title="Obriši"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
