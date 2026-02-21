import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Search, Sparkles, Filter, CheckCircle2, CircleDot, ArrowUpDown } from 'lucide-react';
import Layout from '../components/Layout';

const PokemonCollection = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [sortBy, setSortBy] = useState("numero-asc"); // Default sort

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
          nom: row[4], imageUrl: row[5], langue: row[6], etat: row[7]
        }));
        setCards(formatted);
        setLoading(false);
      }
    });
  }, []);

  // Logique de filtrage et de tri
  const processedCards = cards
    .filter(c => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        c.nom.toLowerCase().includes(search) || 
        c.serie.toLowerCase().includes(search) ||
        c.bloc.toLowerCase().includes(search) ||
        c.numero.toString().includes(search);
      
      const matchesStatus = statusFilter === "tous" || c.statut.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name-asc") return a.nom.localeCompare(b.nom);
      if (sortBy === "bloc-asc") return a.bloc.localeCompare(b.bloc);
      if (sortBy === "numero-asc") {
        // Nettoyage pour trier les numéros proprement (ex: "22/150" -> 22)
        const numA = parseInt(a.numero) || 0;
        const numB = parseInt(b.numero) || 0;
        return numA - numB;
      }
      if (sortBy === "numero-desc") {
        const numA = parseInt(a.numero) || 0;
        const numB = parseInt(b.numero) || 0;
        return numB - numA;
      }
      return 0;
    });

  return (
    <Layout activePage="pokemon">
      <div className="space-y-6">
        
        {/* Barre d'outils (Recherche, Filtres, Tri) */}
        <div className="flex flex-col xl:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800 shadow-2xl">
          
          {/* Recherche */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Nom, numéro, série..."
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full xl:w-auto">
            {/* Menu de Tri */}
            <div className="flex items-center gap-2 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2">
              <ArrowUpDown size={14} className="text-indigo-400" />
              <select 
                className="bg-transparent text-xs font-bold orbitron text-white focus:outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="numero-asc">N° Croissant</option>
                <option value="numero-desc">N° Décroissant</option>
                <option value="name-asc">Nom A-Z</option>
                <option value="bloc-asc">Par Bloc</option>
              </select>
            </div>

            {/* Filtres de Statut */}
            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-slate-700">
              {[
                { id: 'tous', label: 'Tous', icon: Filter },
                { id: "j'ai", label: 'Possédées', icon: CheckCircle2 },
                { id: 'je veux', label: 'Wishlist', icon: CircleDot }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setStatusFilter(btn.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold orbitron transition-all ${
                    statusFilter === btn.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <btn.icon size={12} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="flex justify-between items-center px-2">
          <div className="flex gap-4">
            <span className="text-slate-500 text-[10px] orbitron">
              Trouvées : <span className="text-indigo-400">{processedCards.length}</span>
            </span>
            <span className="text-slate-500 text-[10px] orbitron">
              Ma Collection : <span className="text-emerald-400">{cards.filter(c => c.statut.toLowerCase() === "j'ai").length}</span>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {processedCards.map((card, i) => (
              <div key={i} className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300">
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-800">
                  <img 
                    src={card.imageUrl} 
                    alt={card.nom}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-bold orbitron uppercase tracking-widest ${
                    card.statut.toLowerCase() === "j'ai" ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-black'
                  }`}>
                    {card.statut}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="truncate pr-2">
                      <h3 className="orbitron text-xs font-bold text-white truncate">{card.nom}</h3>
                      <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-tighter truncate">{card.serie}</p>
                    </div>
                    <span className="text-slate-500 text-[10px] font-mono shrink-0">#{card.numero}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <div className="flex gap-1.5">
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{card.langue}</span>
                      <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">{card.etat}</span>
                    </div>
                    <span className="text-[8px] text-slate-600 orbitron tracking-tight">{card.bloc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PokemonCollection;
