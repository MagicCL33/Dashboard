import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, Star, TrendingUp, Filter } from 'lucide-react';

export default function PokemonDashboard() {
  const [cards, setCards] = useState([]);
  const [editingCard, setEditingCard] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Charger les données depuis le stockage
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const cardsData = await window.storage.get('pokemon-cards');
      if (cardsData?.value) {
        setCards(JSON.parse(cardsData.value));
      }
    } catch (error) {
      console.log('Initialisation des cartes Pokémon', error);
    }
  };

  const saveCards = async (newCards) => {
    setCards(newCards);
    await window.storage.set('pokemon-cards', JSON.stringify(newCards));
  };

  // Rechercher des cartes via l'API Pokémon TCG
  const searchPokemonCards = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}*&pageSize=10`
      );
      const data = await response.json();
      
      const formattedSuggestions = data.data.map(card => ({
        id: card.id,
        name: card.name,
        series: card.set.series,
        setName: card.set.name,
        number: card.number,
        image: card.images.small,
        imageHD: card.images.large,
        rarity: card.rarity,
        artist: card.artist,
        releaseDate: card.set.releaseDate
      }));
      
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Récupérer le prix depuis CardMarket (simulé - nécessite API key réelle)
  const fetchCardMarketPrice = async (cardName, setName) => {
    // Note: L'API CardMarket nécessite une authentification OAuth
    // Voici une simulation - à remplacer par une vraie implémentation
    try {
      // Pour l'instant, on simule un prix aléatoire
      // En production, utilisez l'API CardMarket avec vos credentials
      const mockPrice = (Math.random() * 50 + 5).toFixed(2);
      return mockPrice;
    } catch (error) {
      console.error('Erreur prix CardMarket:', error);
      return 'N/A';
    }
  };

  const addCardFromSuggestion = async (suggestion) => {
    const price = await fetchCardMarketPrice(suggestion.name, suggestion.setName);
    
    const newCard = {
      id: Date.now(),
      pokemonName: suggestion.name,
      series: suggestion.series,
      setName: suggestion.setName,
      number: suggestion.number,
      image: suggestion.image,
      imageHD: suggestion.imageHD,
      rarity: suggestion.rarity,
      artist: suggestion.artist,
      status: 'want',
      price: price,
      language: 'FR',
      priority: 2,
      addedDate: new Date().toISOString(),
      notes: ''
    };

    await saveCards([...cards, newCard]);
    setSearchQuery('');
    setSuggestions([]);
    setShowAddCard(false);
  };

  const addCustomCard = async (cardData) => {
    const newCard = {
      id: Date.now(),
      ...cardData,
      addedDate: new Date().toISOString()
    };
    await saveCards([...cards, newCard]);
    setShowAddCard(false);
  };

  const updateCard = async (id, updates) => {
    await saveCards(cards.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingCard(null);
  };

  const deleteCard = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      await saveCards(cards.filter(c => c.id !== id));
    }
  };

  // Filtrer les cartes
  const filteredCards = cards.filter(card => {
    if (filterStatus !== 'all' && card.status !== filterStatus) return false;
    if (filterPriority !== 'all' && card.priority !== parseInt(filterPriority)) return false;
    return true;
  });

  // Statistiques
  const stats = {
    total: cards.length,
    owned: cards.filter(c => c.status === 'owned').length,
    wanted: cards.filter(c => c.status === 'want').length,
    totalValue: cards
      .filter(c => c.status === 'owned' && !isNaN(parseFloat(c.price)))
      .reduce((sum, c) => sum + parseFloat(c.price), 0)
      .toFixed(2)
  };

  return (
    <div className="space-y-6">
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card rounded-xl p-4 border-l-4 border-purple-500">
          <div className="text-slate-400 text-sm orbitron mb-1">TOTAL CARTES</div>
          <div className="text-3xl font-bold text-white orbitron">{stats.total}</div>
        </div>
        <div className="card rounded-xl p-4 border-l-4 border-green-500">
          <div className="text-slate-400 text-sm orbitron mb-1">POSSÉDÉES</div>
          <div className="text-3xl font-bold text-green-400 orbitron">{stats.owned}</div>
        </div>
        <div className="card rounded-xl p-4 border-l-4 border-yellow-500">
          <div className="text-slate-400 text-sm orbitron mb-1">RECHERCHÉES</div>
          <div className="text-3xl font-bold text-yellow-400 orbitron">{stats.wanted}</div>
        </div>
        <div className="card rounded-xl p-4 border-l-4 border-blue-500">
          <div className="text-slate-400 text-sm orbitron mb-1">VALEUR COLLECTION</div>
          <div className="text-3xl font-bold text-blue-400 orbitron">{stats.totalValue}€</div>
        </div>
      </div>

      {/* Boutons d'action et filtres */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <button
          onClick={() => setShowAddCard(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all orbitron font-bold"
        >
          <Plus size={20} /> AJOUTER UNE CARTE
        </button>

        <div className="flex gap-3 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="owned">Possédées</option>
            <option value="want">Recherchées</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="all">Toutes priorités</option>
            <option value="1">Priorité 1 (Haute)</option>
            <option value="2">Priorité 2 (Moyenne)</option>
            <option value="3">Priorité 3 (Basse)</option>
          </select>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddCard && (
        <AddCardForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          suggestions={suggestions}
          isSearching={isSearching}
          onSearch={searchPokemonCards}
          onSelectSuggestion={addCardFromSuggestion}
          onAddCustom={addCustomCard}
          onCancel={() => {
            setShowAddCard(false);
            setSearchQuery('');
            setSuggestions([]);
          }}
        />
      )}

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCards.map(card => (
          <PokemonCard
            key={card.id}
            card={card}
            isEditing={editingCard === card.id}
            onEdit={() => setEditingCard(card.id)}
            onSave={(updates) => updateCard(card.id, updates)}
            onCancel={() => setEditingCard(null)}
            onDelete={() => deleteCard(card.id)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-20">
          <div className="text-slate-500 text-lg orbitron">
            {cards.length === 0 
              ? "Aucune carte dans votre collection. Commencez par en ajouter !" 
              : "Aucune carte ne correspond aux filtres sélectionnés."}
          </div>
        </div>
      )}
    </div>
  );
}

function AddCardForm({ searchQuery, setSearchQuery, suggestions, isSearching, onSearch, onSelectSuggestion, onAddCustom, onCancel }) {
  const [customMode, setCustomMode] = useState(false);
  const [customData, setCustomData] = useState({
    pokemonName: '',
    series: '',
    setName: '',
    number: '',
    image: '',
    status: 'want',
    price: '',
    language: 'FR',
    priority: 2,
    notes: ''
  });

  return (
    <div className="card rounded-2xl p-6">
      <h3 className="orbitron text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Plus className="text-purple-400" /> Ajouter une carte Pokémon
      </h3>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCustomMode(false)}
          className={`px-4 py-2 rounded-lg orbitron font-semibold transition-all ${
            !customMode ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Recherche automatique
        </button>
        <button
          onClick={() => setCustomMode(true)}
          className={`px-4 py-2 rounded-lg orbitron font-semibold transition-all ${
            customMode ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
          }`}
        >
          Ajout manuel
        </button>
      </div>

      {!customMode ? (
        <div className="space-y-4">
          {/* Barre de recherche */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un Pokémon (ex: Pikachu, Charizard...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            {isSearching && (
              <div className="text-slate-400 text-sm mt-2">Recherche en cours...</div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {suggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="cursor-pointer card rounded-lg p-4 hover:border-purple-500 transition-all flex gap-4"
                >
                  <img 
                    src={suggestion.image} 
                    alt={suggestion.name}
                    className="w-20 h-28 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white orbitron">{suggestion.name}</h4>
                    <p className="text-xs text-slate-400">{suggestion.setName}</p>
                    <p className="text-xs text-slate-400">#{suggestion.number}</p>
                    {suggestion.rarity && (
                      <span className="inline-block mt-2 px-2 py-1 bg-yellow-600/20 text-yellow-300 text-xs rounded">
                        {suggestion.rarity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom du Pokémon"
            value={customData.pokemonName}
            onChange={(e) => setCustomData({ ...customData, pokemonName: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <input
            type="text"
            placeholder="Série"
            value={customData.series}
            onChange={(e) => setCustomData({ ...customData, series: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <input
            type="text"
            placeholder="Nom du set"
            value={customData.setName}
            onChange={(e) => setCustomData({ ...customData, setName: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <input
            type="text"
            placeholder="Numéro"
            value={customData.number}
            onChange={(e) => setCustomData({ ...customData, number: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <input
            type="text"
            placeholder="URL de l'image"
            value={customData.image}
            onChange={(e) => setCustomData({ ...customData, image: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 md:col-span-2"
          />
          <select
            value={customData.status}
            onChange={(e) => setCustomData({ ...customData, status: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="want">Je veux</option>
            <option value="owned">Je possède</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Prix (€)"
            value={customData.price}
            onChange={(e) => setCustomData({ ...customData, price: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <select
            value={customData.language}
            onChange={(e) => setCustomData({ ...customData, language: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="FR">Français</option>
            <option value="EN">Anglais</option>
            <option value="JP">Japonais</option>
            <option value="DE">Allemand</option>
            <option value="ES">Espagnol</option>
            <option value="IT">Italien</option>
          </select>
          <select
            value={customData.priority}
            onChange={(e) => setCustomData({ ...customData, priority: parseInt(e.target.value) })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="1">Priorité 1 (Haute)</option>
            <option value="2">Priorité 2 (Moyenne)</option>
            <option value="3">Priorité 3 (Basse)</option>
          </select>
          <textarea
            placeholder="Notes"
            value={customData.notes}
            onChange={(e) => setCustomData({ ...customData, notes: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 md:col-span-2"
            rows="3"
          />
        </div>
      )}

      <div className="flex gap-2 mt-6">
        {customMode && (
          <button
            onClick={() => onAddCustom(customData)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all orbitron font-bold"
          >
            <Save size={16} /> AJOUTER
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 transition-all orbitron font-bold"
        >
          <X size={16} /> ANNULER
        </button>
      </div>
    </div>
  );
}

function PokemonCard({ card, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState(card);

  const priorityColors = {
    1: 'bg-red-600/30 text-red-300',
    2: 'bg-yellow-600/30 text-yellow-300',
    3: 'bg-green-600/30 text-green-300'
  };

  const priorityLabels = {
    1: 'Haute',
    2: 'Moyenne',
    3: 'Basse'
  };

  if (isEditing) {
    return (
      <div className="card rounded-xl p-4">
        <div className="space-y-3">
          <input
            type="text"
            value={formData.pokemonName}
            onChange={(e) => setFormData({ ...formData, pokemonName: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
            placeholder="Nom"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          >
            <option value="want">Je veux</option>
            <option value="owned">Je possède</option>
          </select>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
            placeholder="Prix"
          />
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          >
            <option value="FR">FR</option>
            <option value="EN">EN</option>
            <option value="JP">JP</option>
            <option value="DE">DE</option>
            <option value="ES">ES</option>
            <option value="IT">IT</option>
          </select>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          >
            <option value="1">Priorité 1</option>
            <option value="2">Priorité 2</option>
            <option value="3">Priorité 3</option>
          </select>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
            rows="2"
            placeholder="Notes"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm font-bold hover:bg-green-700 transition-all"
          >
            <Save size={14} className="inline mr-1" /> OK
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm font-bold hover:bg-slate-600 transition-all"
          >
            <X size={14} className="inline mr-1" /> Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-xl p-4 hover:shadow-xl hover:shadow-purple-500/20 transition-all group">
      {/* Image */}
      <div className="relative mb-3">
        <img
          src={card.image || card.imageHD || 'https://via.placeholder.com/245x342?text=No+Image'}
          alt={card.pokemonName}
          className="w-full rounded-lg shadow-lg"
        />
        {card.status === 'owned' && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            ✓ POSSÉDÉE
          </div>
        )}
        {card.status === 'want' && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
            ★ RECHERCHÉE
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="orbitron font-bold text-white text-lg mb-2">{card.pokemonName}</h3>
      
      <div className="space-y-1 text-sm mb-3">
        <p className="text-slate-400">{card.setName || card.series}</p>
        <p className="text-slate-400">#{card.number}</p>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{card.language}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[card.priority]}`}>
            P{card.priority}
          </span>
        </div>
        <div className="flex items-center gap-1 text-green-400 font-bold">
          <TrendingUp size={14} />
          {card.price && !isNaN(parseFloat(card.price)) ? `${parseFloat(card.price).toFixed(2)}€` : 'N/A'}
        </div>
      </div>

      {card.notes && (
        <p className="text-slate-500 text-xs mb-3 italic">{card.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm hover:bg-slate-600 transition-all"
        >
          <Edit2 size={14} className="inline mr-1" /> Modifier
        </button>
        <button
          onClick={onDelete}
          className="bg-red-600/20 text-red-400 px-3 py-2 rounded text-sm hover:bg-red-600/30 transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
