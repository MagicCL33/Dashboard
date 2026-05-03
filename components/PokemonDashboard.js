import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Database, TrendingUp, AlertCircle, Layers, CheckCircle2, Circle, Wallet } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=287748346";

  useEffect(() => {
    let isMounted = true;
    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        if (!isMounted) return;
        try {
          const rawData = results.data
            .filter((row, index) => {
              const rowNum = index + 1;
              const isExcluded = [1, 28, 29, 199].includes(rowNum);
              return !isExcluded && row[4] && row[4].trim() !== "";
            })
            .map((row, index) => ({
              id: `card-${index}`,
              statut: (row[0] || "").trim().toLowerCase(),
              bloc: (row[1] || "").trim(),
              serie: (row[2] || "").trim(),
              numero: (row[3] || "").trim(),
              nom: (row[4] || "Inconnu").trim(),
              imageUrl: (row[5] || "").trim(),
              langue: (row[6] || "").trim(),
              etat: (row[7] || "N/A").trim(),
              prix: parseFloat(String(row[8]).replace(',', '.')) || 0 // Lecture initiale du prix si présent
            }));

          const uniqueCards = rawData.filter((card, index, self) =>
            index === self.findIndex((t) => (
              t.nom === card.nom && t.numero === card.numero && t.serie === card.serie
            ))
          );

          setCards(uniqueCards);
          setLoading(false);
        } catch (err) {
          setError("Erreur de traitement des données.");
          setLoading(false);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  // --- LOGIQUE DE MODIFICATION (STATUT + PRIX) ---
  const handleCardInteraction = (cardId) => {
    setCards(prevCards => prevCards.map(card => {
      if (card.id === cardId) {
        const isNowOwned = card.statut !== "j'ai";
        let newPrix = card.prix;

        if (isNowOwned) {
          // Demander le prix à l'utilisateur
          const input = window.prompt(`À quel prix as-tu acheté ${card.nom} ?`, card.prix || "0");
          newPrix = parseFloat(input?.replace(',', '.')) || 0;
        } else {
          newPrix = 0; // On remet le prix à 0 si elle retourne en wishlist
        }

        return { 
          ...card, 
          statut: isNowOwned ? "j'ai" : "je veux",
          prix: newPrix
        };
      }
      return card;
    }));
  };

  // --- STATISTIQUES GLOBALES ---
  const stats = useMemo(() => {
    const ownedCards = cards.filter(c => c.statut === "j'ai");
    const totalSpent = ownedCards.reduce((sum, c) => sum + (c.prix || 0), 0);
    const total = cards.length;
    return {
      owned: ownedCards.length,
      total,
      percent: total > 0 ? ((ownedCards.length / total) * 100).toFixed(1) : 0,
      totalSpent
    };
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = c.nom.toLowerCase().includes(search) || c.serie.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "tous" || c.statut === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cards, searchTerm, statusFilter]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500 orbitron animate-pulse">Chargement...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- BANDEAU DE STATISTIQUES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Database size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Collection</p>
              <p className="text-xl font-bold">{stats.owned} / {stats.total}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Wallet size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Investissement Total</p>
              <p className="text-xl font-bold text-emerald-400">
                {stats.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 backdrop-blur-sm">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><TrendingUp size={24}/></div>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Progression</p>
              <p className="text-xl font-bold">{stats.percent}%</p>
            </div>
          </div>
        </div>

        {/* --- FILTRES --- */}
        <div className="flex flex-col lg:flex-row gap-4 sticky top-4 z-40 backdrop-blur-xl bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une carte..." 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-slate-900/50 rounded-xl border border-slate-700">
            {['tous', "j'ai", 'je veux'].map(id => (
              <button 
                key={id} 
                onClick={() => setStatusFilter(id)}
                className={`px-6 py-2 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
              >
                {id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* --- GRILLE --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card) => {
            const isOwned = card.statut === "j'ai";
            return (
              <div 
                key={card.id}
                onClick={() => handleCardInteraction(card.id)}
                className={`group relative flex flex-col bg-slate-900/40 border rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  isOwned 
                  ? 'border-indigo-500/50 shadow-xl shadow-indigo-500/5' 
                  : 'border-slate-800 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <div className="relative aspect-[3/4] bg-slate-800">
                  <img 
                    src={card.imageUrl || 'https://via.placeholder.com/400x560?text=No+Image'} 
                    alt={card.nom} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-md ${isOwned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900/80 text-slate-500'}`}>
                    {isOwned ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className={`orbitron text-[10px] font-bold truncate ${isOwned ? 'text-white' : 'text-slate-400'}`}>{card.nom}</h3>
                      <span className="text-[9px] text-slate-500 font-mono">#{card.numero}</span>
                    </div>
                    <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest truncate">{card.serie}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[8px] orbitron text-slate-500">{card.langue}</span>
                    {isOwned && card.prix > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-400">{card.prix}€</span>
                    ) : (
                      <span className="text-[8px] px-2 py-0.5 rounded bg-slate-800 text-slate-600 uppercase">{card.etat}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
