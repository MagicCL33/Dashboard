import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { Search, Database, TrendingUp, AlertCircle, CheckCircle2, Circle, Wallet, Filter } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  
  // États pour les filtres dynamiques de bloc et série
  const [blocFilter, setBlocFilter] = useState("tous");
  const [serieFilter, setSerieFilter] = useState("tous");

  // URL configurée précisément sur l'onglet "liste dashboard" (GID 287748346)
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=287748346";

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Récupération des données sauvegardées localement (prix, statuts modifiés)
          const savedData = JSON.parse(localStorage.getItem('pokemon_dashboard_user_data')) || {};

          const rawData = results.data
            .filter((row, index) => {
              const rowNum = index + 1;
              // On ignore la ligne 1 (en-tête) et les lignes de séparation spécifiques de ton onglet
              return ![1, 28, 29, 199].includes(rowNum) && row[4] && row[4].trim() !== "";
            })
            .map((row, index) => {
              // Clé unique pour lier le LocalStorage (Nom - Série - Numéro)
              const cardKey = `${row[4].trim()}-${row[2].trim()}-${row[3].trim()}`;
              const hasLocalUpdate = savedData[cardKey];

              return {
                id: `card-${index}`,
                key: cardKey,
                statut: hasLocalUpdate ? savedData[cardKey].statut : (row[0] || "").trim().toLowerCase(),
                bloc: (row[1] || "").trim(),
                serie: (row[2] || "").trim(),
                numero: (row[3] || "").trim(),
                nom: (row[4] || "Inconnu").trim(),
                imageUrl: (row[5] || "").trim(),
                langue: (row[6] || "").trim(),
                etat: (row[7] || "N/A").trim(),
                // Récupère le prix modifié localement, sinon prend le prix par défaut du sheet s'il existe
                prix: hasLocalUpdate ? savedData[cardKey].prix : (parseFloat(String(row[8]).replace(',', '.')) || 0)
              };
            });

          // Nettoyage des doublons
          const uniqueCards = rawData.filter((card, index, self) =>
            index === self.findIndex((t) => t.key === card.key)
          );

          setCards(uniqueCards);
          setLoading(false);
        } catch (err) {
          setError("Erreur lors du traitement des données du Pokédex.");
          setLoading(false);
        }
      },
      error: () => {
        setError("Impossible de joindre le Google Sheet 'liste dashboard'.");
        setLoading(false);
      }
    });
  }, []);

  // --- INTERACTION CLIC (CHANGEMENT STATUT + DEMANDE DE PRIX) ---
  const handleCardInteraction = (cardId) => {
    setCards(prevCards => {
      const updatedCards = prevCards.map(card => {
        if (card.id === cardId) {
          const isNowOwned = card.statut !== "j'ai";
          let newPrix = card.prix;

          if (isNowOwned) {
            const input = window.prompt(`À quel prix as-tu acheté ${card.nom} ?`, card.prix || "0");
            newPrix = parseFloat(input?.replace(',', '.')) || 0;
          } else {
            newPrix = 0;
          }

          return { ...card, statut: isNowOwned ? "j'ai" : "je veux", prix: newPrix };
        }
        return card;
      });

      // Enregistrement persistant local
      const dataToSave = {};
      updatedCards.forEach(c => {
        dataToSave[c.key] = { statut: c.statut, prix: c.prix };
      });
      localStorage.setItem('pokemon_dashboard_user_data', JSON.stringify(dataToSave));

      return updatedCards;
    });
  };

  // --- EXTRACTION DYNAMIQUE DES LISTES DE FILTRES ---
  const { blocs, series } = useMemo(() => {
    const listBlocs = new Set();
    const listSeries = new Set();

    cards.forEach(card => {
      if (card.bloc) listBlocs.add(card.bloc);
      if (blocFilter === "tous" || card.bloc === blocFilter) {
        if (card.serie) listSeries.add(card.serie);
      }
    });

    return {
      blocs: Array.from(listBlocs).sort(),
      series: Array.from(listSeries).sort()
    };
  }, [cards, blocFilter]);

  const handleBlocChange = (e) => {
    setBlocFilter(e.target.value);
    setSerieFilter("tous"); 
  };

  // --- STATISTIQUES EN TEMPS RÉEL ---
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

  // --- APPLICATION DES FILTRES MULTI-CRITÈRES ---
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = c.nom.toLowerCase().includes(search) || c.numero.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "tous" || c.statut === statusFilter;
      const matchesBloc = blocFilter === "tous" || c.bloc === blocFilter;
      const matchesSerie = serieFilter === "tous" || c.serie === serieFilter;

      return matchesSearch && matchesStatus && matchesBloc && matchesSerie;
    });
  }, [cards, searchTerm, statusFilter, blocFilter, serieFilter]);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500 orbitron animate-pulse">Chargement de l'onglet 'liste dashboard'...</div>;
  if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500 orbitron">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* BANDEAU DE STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <Database className="text-indigo-400" size={24}/>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Total Cartes</p>
              <p className="text-xl font-bold">{stats.owned} / {stats.total}</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <Wallet className="text-emerald-400" size={24}/>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Investissement Global</p>
              <p className="text-xl font-bold text-emerald-400">{stats.totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
            <TrendingUp className="text-purple-400" size={24}/>
            <div>
              <p className="text-[10px] text-slate-500 orbitron uppercase tracking-widest">Progression</p>
              <p className="text-xl font-bold">{stats.percent}%</p>
            </div>
          </div>
        </div>

        {/* RECHERCHE & FILTRES */}
        <div className="flex flex-col gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 sticky top-4 z-40 backdrop-blur-md">
          
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input type="text" placeholder="Rechercher par nom ou numéro..." className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              
              {/* Filtre Bloc */}
              <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
                <Filter size={14} className="text-indigo-400" />
                <select value={blocFilter} onChange={handleBlocChange} className="bg-transparent text-xs orbitron text-white outline-none cursor-pointer w-full">
                  <option value="tous" className="bg-slate-900">BLOCS (TOUS)</option>
                  {blocs.map(b => <option key={b} value={b} className="bg-slate-900">{b.toUpperCase()}</option>)}
                </select>
              </div>

              {/* Filtre Série */}
              <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 flex-1 sm:flex-initial">
                <Filter size={14} className="text-purple-400" />
                <select value={serieFilter} onChange={(e) => setSerieFilter(e.target.value)} className="bg-transparent text-xs orbitron text-white outline-none cursor-pointer w-full">
                  <option value="tous" className="bg-slate-900">SÉRIES (TOUTES)</option>
                  {series.map(s => <option key={s} value={s} className="bg-slate-900">{s.toUpperCase()}</option>)}
                </select>
              </div>

            </div>

            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-slate-700 w-full sm:w-auto">
              {['tous', "j'ai", 'je veux'].map(id => (
                <button key={id} onClick={() => setStatusFilter(id)} className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                  {id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRILLE DES CARTES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCards.map((card) => {
            const isOwned = card.statut === "j'ai";
            return (
              <div key={card.id} onClick={() => handleCardInteraction(card.id)} className={`group relative flex flex-col bg-slate-900/40 border rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${isOwned ? 'border-indigo-500/50 shadow-xl' : 'border-slate-800 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                <div className="relative aspect-[3/4] bg-slate-800">
                  <img src={card.imageUrl || 'https://via.placeholder.com/400x560?text=No+Image'} alt={card.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
                    <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">{card.bloc}</p>
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

        {filteredCards.length === 0 && (
          <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-500 orbitron text-sm">Aucune carte Pokémon ne correspond à ces critères.</p>
          </div>
        )}

      </div>
    </div>
  );
}
