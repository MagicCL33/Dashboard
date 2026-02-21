import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';

const PokemonCollection = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL de ton Google Sheet exporté en CSV
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1CeE5Mfm50je0Rn9zijf1zrMgmLFmurys4nL3362q71Y/export?format=csv&gid=287748346";

  useEffect(() => {
    const fetchData = async () => {
      Papa.parse(SHEET_URL, {
        download: true,
        header: false, // On utilise false car on saute la ligne 1 manuellement
        complete: (results) => {
          const rawData = results.data;
          
          // Filtrage des données selon tes critères :
          // - Skip ligne 1 (index 0)
          // - Skip lignes 28, 29 (index 27, 28)
          // - Skip ligne 199 (index 198)
          const filteredData = rawData.filter((row, index) => {
            const rowNumber = index + 1;
            if (rowNumber === 1 || rowNumber === 28 || rowNumber === 29 || rowNumber === 199) return false;
            return row[4]; // S'assurer que la colonne Nom n'est pas vide
          });

          const formattedCards = filteredData.map(row => ({
            statut: row[0],
            bloc: row[1],
            serie: row[2],
            numero: row[3],
            nom: row[4],
            imageUrl: row[5],
            langue: row[6],
            etat: row[7]
          }));

          setCards(formattedCards);
          setLoading(false);
        }
      });
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Chargement de la collection...</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">Ma Collection Pokémon</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-all group">
            {/* Image de la carte */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-700">
              <img 
                src={card.imageUrl} 
                alt={card.nom}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Badge Statut */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase ${
                card.statut.toLowerCase() === "j'ai" ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
              }`}>
                {card.statut}
              </div>
            </div>

            {/* Infos de la carte */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h2 className="font-bold text-lg leading-tight truncate">{card.nom}</h2>
                <span className="text-gray-400 text-xs font-mono">#{card.numero}</span>
              </div>
              
              <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">{card.serie}</p>
              
              <div className="flex gap-2 mt-3">
                <span className="bg-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600">
                  {card.langue}
                </span>
                <span className="bg-gray-700 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-600 uppercase">
                  {card.etat}
                </span>
                <span className="text-gray-500 text-[10px] self-center">{card.bloc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonCollection;
