import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Database, TrendingUp, AlertCircle, Layers } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  // URL configurée pour l'onglet "liste dashboard ok"
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=1308994754";

  useEffect(() => {
    let isMounted = true;

    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (!isMounted) return;

        try {
          // 1. On transforme les lignes du CSV en objets JS
          const rawData = results.data
            .filter((row, index) => index > 0 && row[4] && row[4].trim() !== "") // Ignore header et lignes sans nom
            .map(row => ({
              statut: (row[0] || "").trim(),
              bloc: (row[1] || "").trim(),
              serie: (row[2] || "").trim(),
              numero: (row[3] || "").trim(),
              nom: (row[4] || "Inconnu").trim(),
              imageUrl: (row[5] || "").trim(),
              langue: (row[6] || "").trim(),
              etat: (row[7] || "N/A").trim()
            }));

          // 2. LOGIQUE ANTI-DOUBLON : On ne garde qu'une seule instance si Nom + Série + Numéro sont identiques
          const uniqueCards = rawData.filter((card, index, self) =>
            index === self.findIndex((t) => (
              t.nom === card.nom && t.numero === card.numero && t.serie === card.serie
            ))
          );

          setCards(uniqueCards);
          setLoading(false);
        } catch (err) {
          console.error("Erreur parsing:", err);
          setError("Erreur lors du traitement des données.");
          setLoading(false);
        }
      },
      error: () => {
        setError("Impossible de charger le Google Sheet. Vérifiez le partage du fichier.");
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // --- CALCULS DES STATISTIQUES ---
  const stats = useMemo(() => {
    const owned = cards.filter(c => c.statut.toLowerCase() === "j'ai").length;
    const total = cards.length;
    return {
      owned,
      total,
      percent: total > 0 ? ((owned / total) * 100).toFixed(1) : 0
    };
  }, [cards]);

  // --- FILTRAGE ET RECHERCHE ---
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        c.nom.toLowerCase().includes(search) || 
        c.serie.toLowerCase().includes(search) ||
        c.numero.toLowerCase().includes(search);
      
      const matchesStatus = statusFilter === "tous" || c.statut.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [cards, searchTerm, statusFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
      <p className="text-slate-500 orbitron text-xs animate-pulse">Synchronisation avec la base de données...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-red-400 gap-3">
      <AlertCircle size={40} />
      <p className="orbitron text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 space-y-8">
      
      {/* HEADER : TITRE & STATS */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Layers className="text-indigo-500" size={32} />
          <h1 className="text-2xl font-bold orbitron tracking-tighter italic">POKÉDEX TRACKER</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl"><Database className="text-indigo-400" size={24} /></div>
            <div>
              <p className="text-slate-500 text-[10px] orbitron uppercase tracking-widest">Ma Collection</p>
              <p className="text-2xl font-bold text-white">{stats.owned} <span className="text-sm text-slate-600 font-normal">/ {stats.total}</span></p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl"><TrendingUp className="text-emerald-400" size={24} /></div>
            <div>
              <p className="text-slate-500 text-[10px] orbitron uppercase tracking-widest">Complétion</p>
              <p className="text-2xl font-bold text-white">{stats.percent}%</p>
            </div>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-col lg:flex-row gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800 sticky top-4 z-30 backdrop-blur-xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Nom, série ou n°..." 
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-slate-700">
            {['tous', "j'ai", 'je veux'].map(id => (
              <button 
                key={id} 
                onClick={() => setStatusFilter(id)}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {id === "j'ai" ? "POSSÉDÉES" : id === "je veux" ? "WISHLIST" : "TOUTES"}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE DE CARTES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card, i) => (
            <div 
              key={`${card.nom}-${card.serie}-${card.numero}-${i}`} 
              className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col shadow-2xl"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] bg-slate-800 overflow-hidden">
                <img 
                  src={card.imageUrl || 'https://via.placeholder.com/400x560?text=Image+Indisponible'} 
                  alt={card.nom} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                  loading="lazy" 
                />
                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-md text-[8px] font-bold orbitron ${card.statut.toLowerCase() === "j'ai" ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>
                  {card.statut.toUpperCase()}
                </div>
              </div>

              {/* Infos Container */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="orbitron text-[10px] font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors uppercase">{card.nom}</h3>
                    <span className="text-[9px] text-slate-500 font-mono">#{card.numero}</span>
                  </div>
                  <p className="text-indigo-500 text-[9px] font-bold uppercase tracking-widest">{card.serie}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 orbitron">LANGUE</span>
                    <span className="text-[9px] text-slate-300 font-bold">{card.langue || 'FR'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[7px] text-slate-600 orbitron">ÉTAT</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300 font-medium">{card.etat}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredCards.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 orbitron text-sm">Aucune carte trouvée dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
