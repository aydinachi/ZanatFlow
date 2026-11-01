import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Globe,
  Phone,
  Star,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Bookmark,
  Download,
  RotateCcw,
  ExternalLink,
  Layers,
  Map as MapIcon,
  Table as TableIcon,
  LayoutGrid,
  Sparkles,
  Zap,
  Filter,
  Check,
  Building2,
  ArrowRight,
  TrendingUp,
  Info,
  SlidersHorizontal,
  X,
  History,
  ShieldAlert,
} from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { GoogleMapsPlace, SavedSearchQuery } from '../../types';
import { searchGoogleMapsPlaces, analyzePlaceWebPresence, waitForGoogleMapsPlaces } from '../../services/googlePlacesService';
import { useData } from '../../context/DataContext';

const GOOGLE_MAPS_LIBRARIES: ('places' | 'geometry' | 'drawing' | 'visualization')[] = ['places'];

const PRESET_CITIES = [
  'Sarajevo',
  'Bihać',
  'Cazin',
  'Mostar',
  'Zenica',
  'Tuzla',
  'Banja Luka',
  'Zagreb',
  'Beč',
];

const PRESET_CATEGORIES = [
  'Restorani',
  'Frizerski saloni',
  'Autoservisi',
  'Stomatološke ordinacije',
  'Građevinske firme',
  'Hoteli i apartmani',
  'Kozmetički saloni',
  'Vodoinstalateri',
];

export const LeadFinderView: React.FC = () => {
  const { leads, addLead } = useData();

  // Pretraga stanja
  const [selectedCity, setSelectedCity] = useState('Sarajevo');
  const [customCity, setCustomCity] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('Bosna i Hercegovina');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Restorani']);
  const [customCategory, setCustomCategory] = useState('');
  const [queryText, setQueryText] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [minReviews, setMinReviews] = useState<number>(0);

  // Rezultati i učitavanje
  const [places, setPlaces] = useState<GoogleMapsPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'map' | 'grid'>('table');
  const [selectedPlace, setSelectedPlace] = useState<GoogleMapsPlace | null>(null);

  // Selektovani elementi za grupne akcije
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedSearchQuery[]>(() => {
    const saved = localStorage.getItem('zanatflow_saved_queries');
    return saved ? JSON.parse(saved) : [];
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const activeCity = customCity.trim() || selectedCity;

  // Izvršavanje pretrage
  const handleRunSearch = async () => {
    setIsLoading(true);
    setSelectedPlaceIds([]);
    try {
      const categoriesToPass = customCategory.trim()
        ? [customCategory.trim()]
        : selectedCategories.length > 0
        ? selectedCategories
        : ['Poslovni subjekti'];

      const results = await searchGoogleMapsPlaces({
        city: activeCity,
        country: selectedCountry,
        categories: categoriesToPass,
        queryText: queryText,
        minRating: minRating,
        minReviews: minReviews,
      });

      setPlaces(results);
      if (results.length > 0) {
        showNotification(`Pronađeno ${results.length} poslovnih subjekata u gradu ${activeCity}!`);
      } else {
        showNotification('Nije pronađena nijedna firma sa zadatim filterima.', 'info');
      }

      // Sačuvaj u historiju
      const newQuery: SavedSearchQuery = {
        id: `query-${Date.now()}`,
        queryText,
        city: activeCity,
        country: selectedCountry,
        category: categoriesToPass.join(', '),
        radiusKm: 15,
        minRating,
        minReviews,
        date: new Date().toLocaleDateString('bs-BA'),
        resultsCount: results.length,
      };
      setSavedQueries((prev) => {
        const updated = [newQuery, ...prev.slice(0, 9)];
        localStorage.setItem('zanatflow_saved_queries', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Greška pri pretrazi Google Maps-a:', error);
      showNotification('Došlo je do greške pri dohvaćanju Google Maps podataka.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Pokreni početnu pretragu pri učitavanju
  useEffect(() => {
    handleRunSearch();
  }, []);

  // Prebacivanje kategorija
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Provjera da li je klijent već u CRM bazi
  const isPlaceInCRM = (placeId: string) => {
    return leads.some((l) => l.googlePlaceId === placeId || l.companyName.toLowerCase() === selectedPlace?.name.toLowerCase());
  };

  // Dodavanje pojedinačnog lead-a u CRM
  const handleAddSingleToCRM = async (place: GoogleMapsPlace) => {
    if (isPlaceInCRM(place.placeId)) {
      showNotification(`Firma "${place.name}" je već dodana u vaše leadove!`, 'info');
      return;
    }

    try {
      let quality: 'Nema web' | 'Zastarjela' | 'Nekvalitetna' | 'Prosječna' | 'Dobra' = 'Prosječna';
      if (place.webStatus === 'NO_WEBSITE') quality = 'Nema web';
      else if (place.webStatus === 'NEEDS_RECONSTRUCTION') quality = 'Zastarjela';
      else if (place.webStatus === 'BROKEN_WEBSITE') quality = 'Nekvalitetna';

      let value = 1500;
      if (place.webStatus === 'NO_WEBSITE') value = 1800;
      else if (place.webStatus === 'NEEDS_RECONSTRUCTION') value = 1200;

      await addLead({
        companyName: place.name,
        contactName: place.name + ' - Vlasnik',
        email: '',
        phone: place.phone === 'Nije navedeno' ? '' : place.phone,
        website: place.website,
        city: place.city,
        industry: place.category,
        source: 'Google Maps',
        serviceType: place.recommendedService,
        currentWebsiteQuality: quality,
        identifiedProblems: place.scoreReasons.join('; '),
        proposedSolution: place.recommendedService,
        estimatedValue: value,
        currency: 'BAM',
        priority: place.leadScore >= 80 ? 'Visok' : place.leadScore >= 60 ? 'Srednji' : 'Nizak',
        probability: place.leadScore,
        status: 'Novi potencijalni klijent',
        notes: `Pronađeno putem Google Maps Finder-a. Rating: ${place.rating}★ (${place.userRatingsTotal} recenzija). Lead Score: ${place.leadScore}/100. Razlozi: ${place.scoreReasons.join(', ')}`,
        googlePlaceId: place.placeId,
        googleMapsUrl: place.googleMapsUrl,
        rating: place.rating,
        userRatingsTotal: place.userRatingsTotal,
        leadScore: place.leadScore,
        webStatus: place.webStatus,
        scoreReasons: place.scoreReasons,
      });

      showNotification(`Firma "${place.name}" je uspješno dodana u vaše leadove! 🎉`);
    } catch (e) {
      console.error(e);
      showNotification('Greška pri dodavanju leada u CRM.', 'error');
    }
  };

  // Grupno dodavanje odabranih firmi u CRM
  const handleBulkAddToCRM = async () => {
    if (selectedPlaceIds.length === 0) return;
    let addedCount = 0;

    for (const placeId of selectedPlaceIds) {
      const place = places.find((p) => p.placeId === placeId);
      if (place && !isPlaceInCRM(place.placeId)) {
        await handleAddSingleToCRM(place);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      showNotification(`Uspješno dodano ${addedCount} firmi u vaš CRM!`, 'success');
      setSelectedPlaceIds([]);
    } else {
      showNotification('Sve odabrane firme već postoje u vašim leadovima.', 'info');
    }
  };

  // Izvoz u CSV
  const handleExportCSV = () => {
    if (places.length === 0) return;
    const headers = ['Naziv firme', 'Kategorija', 'Grad', 'Telefon', 'Web stranica', 'Google Ocjena', 'Recenzije', 'Status Weba', 'Lead Score', 'Preporučena usluga'];
    const rows = places.map((p) => [
      p.name,
      p.category,
      p.city,
      p.phone,
      p.website,
      p.rating.toString(),
      p.userRatingsTotal.toString(),
      p.webStatus,
      p.leadScore.toString(),
      p.recommendedService,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${(cell || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Google_Maps_Leads_${activeCity}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('CSV datoteka je uspješno preuzeta.');
  };

  // Ponovna analiza web stranice
  const handleReanalyzePlace = (place: GoogleMapsPlace) => {
    const updated = analyzePlaceWebPresence({
      ...place,
    });
    setPlaces((prev) => prev.map((p) => (p.placeId === place.placeId ? updated : p)));
    if (selectedPlace?.placeId === place.placeId) {
      setSelectedPlace(updated);
    }
    showNotification(`Web prisustvo za "${place.name}" je ponovo analizirano.`);
  };

  // Statistika
  const totalCount = places.length;
  const noWebCount = places.filter((p) => p.webStatus === 'NO_WEBSITE').length;
  const needsReconCount = places.filter((p) => p.webStatus === 'NEEDS_RECONSTRUCTION' || p.webStatus === 'BROKEN_WEBSITE').length;
  const highPotentialCount = places.filter((p) => p.leadScore >= 80).length;
  const addedToCRMCount = places.filter((p) => leads.some((l) => l.googlePlaceId === p.placeId)).length;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <APIProvider apiKey={apiKey} libraries={GOOGLE_MAPS_LIBRARIES}>
      <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* Toast Notification Banner */}
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

      {/* Top Title & Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Maps Platform Leads Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Finder klijenata <span className="text-indigo-600 dark:text-indigo-400">(Google Maps Lead Finder)</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Pronađite stvarne poslovne subjekte u bilo kojem gradu, analizirajte njihovo web prisustvo i pretvorite ih u ugovorene poslove.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={places.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Izvezi CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Kriteriji pretrage potencijalnih klijenata</span>
          </div>
          <span className="text-[11px] text-slate-400">Google Places API (New)</span>
        </div>

        {/* Location & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Grad / Mjesto</label>
            <div className="flex gap-2">
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCustomCity('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {PRESET_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Ili upišite drugi grad</label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              placeholder="npr. Livno, Lukavac, Travnik..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Država</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Bosna i Hercegovina">Bosna i Hercegovina</option>
              <option value="Hrvatska">Hrvatska</option>
              <option value="Srbija">Srbija</option>
              <option value="Crna Gora">Crna Gora</option>
              <option value="Austrija">Austrija</option>
              <option value="Njemačka">Njemačka</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Naziv / Ključna riječ</label>
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="npr. Autoservis, Stomatolog..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Chips Multi-Select */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
            Kategorije djelatnosti (Kliknite za odabir jedne ili više kategorija)
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters & Action Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Min. Google Ocjena</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value={0}>Sve ocjene</option>
                <option value={3.5}>3.5★ i više</option>
                <option value={4.0}>4.0★ i više (Preporučeno)</option>
                <option value={4.5}>4.5★ i više</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Min. Recenzija</label>
              <select
                value={minReviews}
                onChange={(e) => setMinReviews(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value={0}>Sve firme</option>
                <option value={5}>Više od 5 recenzija</option>
                <option value={15}>Više od 15 recenzija</option>
                <option value={50}>Više od 50 recenzija</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRunSearch}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Pretraživanje Google Maps-a...' : `Pretraži firme u ${activeCity}`}</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ukupno firmi</span>
          <p className="text-xl font-black text-slate-900 dark:text-white">{totalCount}</p>
          <span className="text-[10px] text-slate-500">Pronađeno na mapi</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">🔴 Nema Web Stranicu</span>
          <p className="text-xl font-black text-red-700 dark:text-red-300">{noWebCount}</p>
          <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
            {totalCount > 0 ? Math.round((noWebCount / totalCount) * 100) : 0}% prilika za nov sajt
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">🟡 Potrebna Rekonstrukcija</span>
          <p className="text-xl font-black text-amber-700 dark:text-amber-300">{needsReconCount}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Loš UX / Wix / Pokvareno</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🔥 Visok Potencijal (80+)</span>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{highPotentialCount}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Top leadovi za kontakt</span>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">➕ Dodano u CRM</span>
          <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{addedToCRMCount}</p>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">U bazi leadova</span>
        </div>
      </div>

      {/* VIEW MODES TOOLBAR & BULK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedPlaceIds.length > 0 ? (
            <button
              onClick={handleBulkAddToCRM}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm animate-in fade-in"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj odabranih ({selectedPlaceIds.length}) firmi u CRM</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500 font-medium">Prikazano rezultata: <strong className="text-slate-900 dark:text-white font-bold">{places.length}</strong></span>
          )}
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Tabela</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'map' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Google Maps</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kartice</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedPlaceIds.length === places.length && places.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedPlaceIds(places.map((p) => p.placeId));
                        else setSelectedPlaceIds([]);
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Firma & Lokacija</th>
                  <th className="p-4">Kategorija</th>
                  <th className="p-4">Google Ocjena</th>
                  <th className="p-4">Status Web Prisustva</th>
                  <th className="p-4">Lead Score (0-100)</th>
                  <th className="p-4">Preporučena Usluga</th>
                  <th className="p-4 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {places.map((place) => {
                  const inCRM = isPlaceInCRM(place.placeId);
                  const isChecked = selectedPlaceIds.includes(place.placeId);

                  return (
                    <tr
                      key={place.placeId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPlace(place)}
                    >
                      <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPlaceIds([...selectedPlaceIds, place.placeId]);
                            else setSelectedPlaceIds(selectedPlaceIds.filter((id) => id !== place.placeId));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{place.name}</span>
                          {inCRM && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                              U CRM-u
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                          <span className="truncate">{place.address}</span>
                        </div>
                        {place.phone && place.phone !== 'Nije navedeno' && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 shrink-0 text-slate-400" />
                            <span>{place.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {place.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">{place.rating}</span>
                          <span className="text-[11px] text-slate-400">({place.userRatingsTotal})</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {place.webStatus === 'NO_WEBSITE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-[11px] font-bold border border-red-200 dark:border-red-900">
                            <AlertTriangle className="w-3 h-3" /> Nema web stranicu
                          </span>
                        )}
                        {place.webStatus === 'NEEDS_RECONSTRUCTION' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-900">
                            <Globe className="w-3 h-3" /> Potrebna rekonstrukcija
                          </span>
                        )}
                        {place.webStatus === 'BROKEN_WEBSITE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-900">
                            <ShieldAlert className="w-3 h-3" /> Domena ne radi
                          </span>
                        )}
                        {place.webStatus === 'HAS_WEBSITE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 className="w-3 h-3" /> Postoji web stranica
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs ${
                              place.leadScore >= 80
                                ? 'bg-emerald-600'
                                : place.leadScore >= 60
                                ? 'bg-blue-600'
                                : place.leadScore >= 40
                                ? 'bg-amber-500'
                                : 'bg-slate-500'
                            }`}
                          >
                            {place.leadScore}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {place.scoreCategory}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                          {place.recommendedService}
                        </p>
                      </td>

                      <td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {inCRM ? (
                          <button disabled className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Dodano
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddSingleToCRM(place)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1 active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" /> Dodaj u leadove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: GOOGLE MAPS INTERACTIVE VIEW */}
      {viewMode === 'map' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-[600px] relative">
          <Map
            defaultCenter={places[0] ? { lat: places[0].lat, lng: places[0].lng } : { lat: 43.8563, lng: 18.4131 }}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {places.map((place) => (
              <AdvancedMarker
                key={place.placeId}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => setSelectedPlace(place)}
              >
                <Pin
                  background={
                    place.webStatus === 'NO_WEBSITE'
                      ? '#ef4444'
                      : place.webStatus === 'NEEDS_RECONSTRUCTION'
                      ? '#f59e0b'
                      : '#10b981'
                  }
                  borderColor="#ffffff"
                  glyphColor="#ffffff"
                />
              </AdvancedMarker>
            ))}

            {selectedPlace && (
              <InfoWindow
                position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
                onCloseClick={() => setSelectedPlace(null)}
              >
                <div className="p-2 space-y-2 max-w-xs font-sans text-slate-900">
                  <h3 className="font-bold text-sm text-slate-900">{selectedPlace.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedPlace.address}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-600">Score: {selectedPlace.leadScore}/100</span>
                    <span className="text-slate-400">({selectedPlace.rating}★)</span>
                  </div>
                  <button
                    onClick={() => handleAddSingleToCRM(selectedPlace)}
                    className="w-full py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    + Dodaj u moje leadove
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      )}

      {/* VIEW 3: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((place) => {
            const inCRM = isPlaceInCRM(place.placeId);
            return (
              <div
                key={place.placeId}
                onClick={() => setSelectedPlace(place)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{place.name}</h3>
                    <div
                      className={`px-2 py-0.5 rounded-lg text-white font-black text-xs ${
                        place.leadScore >= 80 ? 'bg-emerald-600' : place.leadScore >= 60 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                    >
                      {place.leadScore}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{place.address}</span>
                  </p>

                  <div className="flex items-center gap-2 text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 dark:text-white">{place.rating}</span>
                    <span className="text-slate-400">({place.userRatingsTotal} recenzija)</span>
                  </div>

                  {place.webStatus === 'NO_WEBSITE' && (
                    <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold border border-red-200 dark:border-red-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Nema web stranicu na Google-u</span>
                    </div>
                  )}

                  {place.webStatus === 'NEEDS_RECONSTRUCTION' && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span>Potreban redizajn i UX modernizacija</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500">{place.category}</span>
                  {inCRM ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> U CRM-u
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSingleToCRM(place);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                    >
                      + Dodaj u leadove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLACE DETAIL PROFIL MODAL */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-xs font-bold">
                <span>{selectedPlace.category}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedPlace.name}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedPlace.address}</span>
              </p>
            </div>

            {/* Lead Score Breakdown Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Izračunati Lead Score</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{selectedPlace.leadScore} / 100</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    selectedPlace.leadScore >= 80 ? 'bg-emerald-500' : selectedPlace.leadScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${selectedPlace.leadScore}%` }}
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Razlozi bodovanja:</span>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  {selectedPlace.scoreReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Service */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 space-y-1 text-xs">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Preporučena prodajna ponuda:</span>
              <p className="text-indigo-950 dark:text-indigo-100 font-semibold">{selectedPlace.recommendedService}</p>
            </div>

            {/* Action Links */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {selectedPlace.website && (
                <a
                  href={selectedPlace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" /> Otvori web stranicu <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <a
                href={selectedPlace.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Otvori na Google Mapsu <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  handleAddSingleToCRM(selectedPlace);
                  setSelectedPlace(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Dodaj u moje leadove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </APIProvider>
  );
};
