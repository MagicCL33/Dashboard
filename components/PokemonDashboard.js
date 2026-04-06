import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Database, TrendingUp, AlertCircle, Layers, CheckCircle2, Circle } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=1308994754";

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data
            .filter((row, index) => index > 0 && row[4])
            .map((row, index) => ({
              id: `card-${index}`, // ID unique pour la gestion d'état local
              statut: (row[0] || "").trim().toLowerCase(),
              bloc: row[1] || "",
              serie: row[2] || "",
              numero: row[3] || "0",
              nom: row[4] || "Inconnu",
              imageUrl: row[5] || "",
              langue: row[6] || "",
              etat: row[7] || "N/A"
            }));

          // Anti-doublon
          const uniqueCards = rawData.filter((card, index, self) =>
            index === self.findIndex((t) => (
              t.nom === card.nom && t.numero === card.numero && t.serie === card.serie
            ))
          );

          setCards(uniqueCards);
          setLoading(false);
        } catch (err) {
          setError("Erreur de chargement");
          setLoading(false);
        }
      }
    });
  }, []);

  // --- FONCTION POUR MODIFIER LE STATUT LOCALEMENT ---
  const toggleStatut = (cardId) => {
    setCards(prevCards => prevCards.map(card => {
      if (card.id === cardId) {
        return {
          ...card,
          statut: card.statut === "j'ai" ? "je veux" : "j'ai"
        };
      }
      return card;
    }));
  };

  const stats = useMemo(() => {
    const owned = cards.filter(c => c.statut === "j'ai").length;
    return { owned, total: cards.length, percent: cards.length > 0 ? ((owned / cards.length) * 100).toFixed(1) : 0 };
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const matchesSearch = c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || c.serie.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "tous" || c.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cards, searchTerm, statusFilter]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500 orbitron">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <Database className="text-indigo-400" />
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase">Collection</p>
              <p className="text-xl font-bold">{stats.owned} / {stats.total}</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
            <TrendingUp className="text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase">Complétion</p>
              <p className="text-xl font-bold">{stats.percent}%</p>
            </div>
          </div>
        </div>

        {/* FILTRES */}
        <div className="flex flex-col md:flex-row gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800 sticky top-4 z-30 backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-700">
            {['tous', "j'ai", 'je veux'].map(id => (
              <button 
                key={id} 
                onClick={() => setStatusFilter(id)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLE */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card) => {
            const isOwned = card.statut === "j'ai";
            
            return (
              <div 
                key={card.id}
                onClick={() => toggleStatut(card.id)}
                className={`group relative bg-slate-900/40 border rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer hover:scale-[1.02] ${
                  isOwned ? 'border-indigo-500/50 shadow-indigo-500/10 shadow-xl' : 'border-slate-800 opacity-60 grayscale hover:grayscale-[50%]'
                }`}
              >
                {/* Image avec filtre de couleur */}
                <div className="relative aspect-[3/4] bg-slate-800">
                  <img 
                    src={card.imageUrl} 
                    alt={card.nom} 
                    className="w-full h-full object-cover"
                  />
                  {/* Badge Statut */}
                  <div className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md ${isOwned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900/60 text-slate-400'}`}>
                    {isOwned ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>
                </div>

                {/* Infos */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className={`orbitron text-[10px] font-bold truncate ${isOwned ? 'text-white' : 'text-slate-400'}`}>{card.nom}</h3>
                    <span className="text-[9px] text-slate-500 font-mono">#{card.numero}</span>
                  </div>
                  <p className="text-indigo-500 text-[9px] font-bold uppercase tracking-widest">{card.serie}</p>
                  
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[8px] orbitron">
                    <span className="text-slate-500">{card.langue}</span>
                    <span className={`px-1.5 py-0.5 rounded ${isOwned ? 'bg-indigo-500/10 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {card.etat}
                    </span>
                  </div>
                </div>

                {/* Overlay au survol pour indiquer l'action */}
                <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-900/90 text-[8px] orbitron px-3 py-1 rounded-full border border-indigo-500 text-white tracking-widest">
                    {isOwned ? "PASSER EN WISHLIST" : "PASSER EN POSSÉDÉE"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
