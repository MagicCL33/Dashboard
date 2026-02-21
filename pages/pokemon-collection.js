import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Search, Sparkles, Filter, CheckCircle2, CircleDot } from 'lucide-react';
import Layout from '../components/Layout';

const PokemonCollection = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous"); // "tous", "j'ai", "je veux"

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

  // Logique de filtrage combinée (Recherche + Statut)
  const filteredCards = cards.filter(c => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      c.nom.toLowerCase().includes(search) || 
      c.serie.toLowerCase().includes(search) ||
      c.bloc.toLowerCase().includes(search) ||
      c.numero.toString().includes(search);
    
    const matchesStatus = statusFilter === "tous" || c.statut.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout activePage="pokemon">
      <div className="space-y-6">
        {/* Header avec Stats & Barre de recherche */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Nom, numéro, série ou bloc..."
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 p-1 bg-slate-950/50 rounded-xl border border-slate-700">
            {[
              { id: 'tous', label: 'Tous', icon: Filter },
              { id: "j'ai", label: 'Possédées', icon: CheckCircle2 },
              { id: 'je veux', label: 'Wishlist', icon: CircleDot }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold orbitron transition-all ${
                  statusFilter === btn.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <btn.icon size={14} />
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Compteur */}
        <div className="text-slate-500 text-xs orbitron flex justify-between px-2">
          <span>Résultats : {filteredCards.length} cartes</span>
          <span>Collection : {cards.filter(c => c.statut.toLowerCase() === "j'ai").length} possédées</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredCards.map((card, i) => (
              <div key={i} className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={card.imageUrl} 
                    alt={card.nom}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold orbitron uppercase tracking-wider shadow-lg ${
                    card.statut.toLowerCase() === "j'ai" ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-black'
                  }`}>
                    {card.statut}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="max-w-[80%]">
                      <h3 className="orbitron text-sm font-bold text-white leading-tight truncate">{card.nom}</h3>
                      <p className="text-indigo-400 text-[10px] font-medium uppercase tracking-tighter mt-1 truncate">{card.serie}</p>
                    </div>
                    <span className="text-slate-500 text-[10px] font-mono">#{card.numero}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <div className="flex gap-2">
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 uppercase">{card.langue}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 uppercase">{card.etat}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 orbitron">{card.bloc}</span>
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
