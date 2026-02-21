import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Search, Filter, CheckCircle2, CircleDot, ArrowUpDown, Wallet, Database, TrendingUp } from 'lucide-react';

export default function PokemonCollection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [sortBy, setSortBy] = useState("numero-asc");

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=287748346";

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: false,
      complete: (results) => {
        const filteredData = results.data.filter((row, index) => {
          const rowNum = index + 1;
          return rowNum !== 1 && rowNum !== 28 && rowNum !== 29 && rowNum !== 199 && row[4];
        });
        const formatted = filteredData.map(row => ({
          statut: row[0], bloc: row[1], serie: row[2], numero: row[3],
          nom: row[4], imageUrl: row[5], langue: row[6], etat: row[7],
          prix: parseFloat(row[8]) || 0 // On récupère le prix en colonne 9 (index 8)
        }));
        setCards(formatted);
        setLoading(false);
      }
    });
  }, []);

  // --- CALCULS DES STATISTIQUES ---
  const cardsOwned = cards.filter(c => c.statut.toLowerCase() === "j'ai");
  const totalOwned = cardsOwned.length;
  const totalSpent = cardsOwned.reduce((sum, card) => sum + card.prix, 0);
  const completionRate = cards.length > 0 ? ((totalOwned / cards.length) * 100).toFixed(1) : 0;

  // Logique de filtrage et tri
  const processedCards = cards
    .filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = c.nom.toLowerCase().includes(search) || c.serie.toLowerCase().includes(search) || c.bloc.toLowerCase().includes(search) || c.numero.toString().includes(search);
      const matchesStatus = statusFilter === "tous" || c.statut.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.nom.localeCompare(b.nom);
      if (sortBy === "numero-asc") return (parseInt(a.numero) || 0) - (parseInt(b.numero) || 0);
      if (sortBy === "numero-desc") return (parseInt(b.numero) || 0) - (parseInt(a.numero) || 0);
      return 0;
    });

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="space-y-8">
      
      {/* --- BANDEAU DE STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Database className="text-emerald-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs orbitron uppercase tracking-wider">Cartes Possédées</p>
            <p className="text-2xl font-bold text-white">{totalOwned} <span className="text-sm text-slate-500 font-normal">/ {cards.length}</span></p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Wallet className="text-indigo-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs orbitron uppercase tracking-wider">Investissement Total</p>
            <p className="text-2xl font-bold text-white">{totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <TrendingUp className="text-purple-400" size={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs orbitron uppercase tracking-wider">Complétion</p>
            <p className="text-2xl font-bold text-white">{completionRate}%</p>
          </div>
        </div>
      </div>

      {/* --- BARRE D'OUTILS --- */}
      <div className="flex flex-col xl:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Rechercher une carte..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
            <select className="bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-xs orbitron text-white focus:border-indigo-500" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="numero-asc">N° Croissant</option>
                <option value="numero-desc">N° Décroissant</option>
                <option value="name-asc">Nom A-Z</option>
            </select>
            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-slate-700">
                {['tous', "j'ai", 'je veux'].map(id => (
                    <button key={id} onClick={() => setStatusFilter(id)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold orbitron transition-all whitespace-nowrap ${statusFilter === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}>
                      {id === "j'ai" ? "POSSÉDÉES" : id === "je veux" ? "WISHLIST" : "TOUTES"}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* --- GRILLE DE CARTES --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {processedCards.map((card, i) => (
          <div key={i} className="group bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
              <img src={card.imageUrl} alt={card.nom} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[8px] font-bold orbitron uppercase tracking-widest ${card.statut.toLowerCase() === "j'ai" ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-black'}`}>
                {card.statut}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="orbitron text-[11px] font-bold text-white truncate w-4/5">{card.nom}</h3>
                <span className="text-slate-500 text-[9px] font-mono">#{card.numero}</span>
              </div>
              <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-tighter mb-2">{card.serie}</p>
              {card.statut.toLowerCase() === "j'ai" && card.prix > 0 && (
                <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center">
                  <span className="text-[8px] text-slate-500 orbitron">ACHAT</span>
                  <span className="text-[10px] text-emerald-400 font-bold">{card.prix}€</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
