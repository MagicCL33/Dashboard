import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Database, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  // URL ciblée sur l'onglet "liste dashboard ok"
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=1308994754";

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const formatted = results.data
            .filter((row, index) => index > 0 && row[4]) // Ignore header et lignes sans nom
            .map(row => ({
              statut: (row[0] || "").trim(),
              bloc: row[1] || "",
              serie: row[2] || "",
              numero: row[3] || "0",
              nom: row[4] || "Inconnu",
              imageUrl: row[5] || "",
              langue: row[6] || "",
              etat: row[7] || "N/A"
            }));

          setCards(formatted);
          setLoading(false);
        } catch (err) {
          setError("Erreur lors de la lecture des données.");
          setLoading(false);
        }
      },
      error: () => {
        setError("Lien Google Sheet inaccessible.");
        setLoading(false);
      }
    });
  }, []);

  // --- STATISTIQUES ---
  const stats = useMemo(() => {
    const owned = cards.filter(c => c.statut.toLowerCase() === "j'ai").length;
    const total = cards.length;
    return {
      owned,
      total,
      percent: total > 0 ? ((owned / total) * 100).toFixed(1) : 0
    };
  }, [cards]);

  // --- FILTRAGE ---
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = c.nom.toLowerCase().includes(search) || c.serie.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "tous" || c.statut.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [cards, searchTerm, statusFilter]);

  if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 orbitron">Initialisation du Pokédex...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-slate-950 min-h-screen text-slate-200">
      
      {/* HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-indigo-500/10 rounded-xl"><Database className="text-indigo-400" /></div>
          <div>
            <p className="text-xs text-slate-500 orbitron uppercase">Collection</p>
            <p className="text-2xl font-bold">{stats.owned} / {stats.total} <span className="text-sm font-normal text-slate-600">Cartes</span></p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 rounded-xl"><TrendingUp className="text-emerald-400" /></div>
          <div>
            <p className="text-xs text-slate-500 orbitron uppercase">Taux de complétion</p>
            <p className="text-2xl font-bold">{stats.percent}%</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:row gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 sticky top-4 z-20 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un Pokémon..." 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-500 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-700">
          {['tous', "j'ai", 'je veux'].map(id => (
            <button 
              key={id} 
              onClick={() => setStatusFilter(id)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {id === "j'ai" ? "POSSÉDÉES" : id === "je veux" ? "WISHLIST" : "TOUTES"}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredCards.map((card, i) => (
          <div key={i} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all flex flex-col">
            <div className="relative aspect-[3/4] bg-slate-800">
              <img src={card.imageUrl} alt={card.nom} className="w-full h-full object-cover" loading="lazy" />
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold orbitron ${card.statut.toLowerCase() === "j'ai" ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>
                {card.statut.toUpperCase()}
              </div>
            </div>
            <div className="p-4 space-y-2 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="orbitron text-[10px] font-bold truncate pr-2">{card.nom}</h3>
                <span className="text-[9px] text-slate-500 font-mono">#{card.numero}</span>
              </div>
              <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-tighter">{card.serie}</p>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-[8px] text-slate-500">{card.langue}</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">{card.etat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
