import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Search, Filter, CheckCircle2, CircleDot, ArrowUpDown } from 'lucide-react';

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
          nom: row[4], imageUrl: row[5], langue: row[6], etat: row[7]
        }));
        setCards(formatted);
        setLoading(false);
      }
    });
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-4 items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Rechercher..." className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
            <select className="bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-xs orbitron text-white" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="numero-asc">N° Croissant</option>
                <option value="numero-desc">N° Décroissant</option>
                <option value="name-asc">Nom A-Z</option>
            </select>
            <div className="flex gap-1 p-1 bg-slate-950/50 rounded-xl border border-slate-700">
                {['tous', "j'ai", 'je veux'].map(id => (
                    <button key={id} onClick={() => setStatusFilter(id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold orbitron transition-all ${statusFilter === id ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>{id}</button>
                ))}
            </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {processedCards.map((card, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all">
            <img src={card.imageUrl} alt={card.nom} className="w-full aspect-[3/4] object-cover" loading="lazy" />
            <div className="p-3">
              <h3 className="orbitron text-[10px] font-bold text-white truncate">{card.nom}</h3>
              <p className="text-indigo-400 text-[8px] uppercase">{card.serie}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
