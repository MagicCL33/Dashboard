import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Search, TrendingUp } from 'lucide-react';

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
      // Essayer window.storage (production) puis localStorage (dev)
      if (typeof window !== 'undefined' && window.storage) {
        const cardsData = await window.storage.get('pokemon-cards');
        if (cardsData?.value) {
          setCards(JSON.parse(cardsData.value));
          console.log('Données chargées depuis window.storage');
        }
      } else if (typeof window !== 'undefined' && localStorage) {
        const cardsData = localStorage.getItem('pokemon-cards');
        if (cardsData) {
          setCards(JSON.parse(cardsData));
          console.log('Données chargées depuis localStorage');
        }
      }
    } catch (error) {
      console.log('Initialisation des cartes Pokémon', error);
    }
  };

  const saveCards = async (newCards) => {
    setCards(newCards);
    
    // Sauvegarder avec window.storage (production) et localStorage (dev)
    try {
      if (typeof window !== 'undefined' && window.storage) {
        await window.storage.set('pokemon-cards', JSON.stringify(newCards));
        console.log('Sauvegarde dans window.storage réussie');
      }
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem('pokemon-cards', JSON.stringify(newCards));
        console.log('Sauvegarde dans localStorage réussie');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  // Obtenir les suggestions d'autocomplétion pour les champs texte
  const getFieldSuggestions = (fieldName, currentValue) => {
    if (!currentValue || currentValue.length < 2) return [];
    
    const values = new Set();
    cards.forEach(card => {
      const value = card[fieldName];
      if (value && typeof value === 'string') {
        values.add(value);
      }
    });
    
    return Array.from(values)
      .filter(v => v.toLowerCase().includes(currentValue.toLowerCase()))
      .slice(0, 5);
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
        bloc: card.set.series, // Le "bloc" correspond à la série dans l'API
        extension: card.set.name, // L'extension est le nom du set
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

  // Récupérer le prix depuis CardMarket (simulé)
  const fetchCardMarketPrice = async (cardName, setName) => {
    try {
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
      bloc: suggestion.bloc,
      extension: suggestion.extension,
      setName: suggestion.setName,
      number: suggestion.number,
      image: suggestion.image,
      imageHD: suggestion.imageHD,
      rarity: suggestion.rarity,
      artist: suggestion.artist,
      status: 'want',
      condition: 'Near Mint', // État par défaut
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
          existingCards={cards}
          getFieldSuggestions={getFieldSuggestions}
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
            getFieldSuggestions={getFieldSuggestions}
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

// Composant pour les champs avec autocomplétion
function AutocompleteInput({ value, onChange, placeholder, suggestions, className }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(e);
    setShowSuggestions(newValue.length >= 2);
  };

  const handleSelectSuggestion = (suggestion) => {
    setLocalValue(suggestion);
    onChange({ target: { value: suggestion } });
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(localValue.length >= 2)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className={className}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-3 py-2 hover:bg-slate-600 cursor-pointer text-white text-sm"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCardForm({ searchQuery, setSearchQuery, suggestions, isSearching, onSearch, onSelectSuggestion, onAddCustom, onCancel, existingCards, getFieldSuggestions }) {
  const [customMode, setCustomMode] = useState(false);
  const [customData, setCustomData] = useState({
    pokemonName: '',
    series: '',
    bloc: '',
    extension: '',
    number: '',
    image: '',
    status: 'want',
    condition: 'Near Mint',
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
                    <p className="text-xs text-slate-400">{suggestion.extension}</p>
                    <p className="text-xs text-slate-400">Bloc: {suggestion.bloc}</p>
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
          <AutocompleteInput
            value={customData.pokemonName}
            onChange={(e) => setCustomData({ ...customData, pokemonName: e.target.value })}
            placeholder="Nom du Pokémon"
            suggestions={getFieldSuggestions('pokemonName', customData.pokemonName)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <AutocompleteInput
            value={customData.series}
            onChange={(e) => setCustomData({ ...customData, series: e.target.value })}
            placeholder="Série"
            suggestions={getFieldSuggestions('series', customData.series)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <AutocompleteInput
            value={customData.bloc}
            onChange={(e) => setCustomData({ ...customData, bloc: e.target.value })}
            placeholder="Bloc"
            suggestions={getFieldSuggestions('bloc', customData.bloc)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <AutocompleteInput
            value={customData.extension}
            onChange={(e) => setCustomData({ ...customData, extension: e.target.value })}
            placeholder="Extension"
            suggestions={getFieldSuggestions('extension', customData.extension)}
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
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          />
          <select
            value={customData.status}
            onChange={(e) => setCustomData({ ...customData, status: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="want">Je veux</option>
            <option value="owned">Je possède</option>
          </select>
          <select
            value={customData.condition}
            onChange={(e) => setCustomData({ ...customData, condition: e.target.value })}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700"
          >
            <option value="Near Mint">Near Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Played">Played</option>
            <option value="Poor">Poor</option>
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

function PokemonCard({ card, isEditing, onEdit, onSave, onCancel, onDelete, getFieldSuggestions }) {
  const [formData, setFormData] = useState(card);

  const priorityColors = {
    1: 'bg-red-600/30 text-red-300',
    2: 'bg-yellow-600/30 text-yellow-300',
    3: 'bg-green-600/30 text-green-300'
  };

  const conditionColors = {
    'Near Mint': 'bg-emerald-600/30 text-emerald-300',
    'Excellent': 'bg-blue-600/30 text-blue-300',
    'Good': 'bg-yellow-600/30 text-yellow-300',
    'Played': 'bg-orange-600/30 text-orange-300',
    'Poor': 'bg-red-600/30 text-red-300'
  };

  // Couleurs de fond selon le statut
  const cardBackgroundClass = card.status === 'owned' 
    ? 'bg-green-900/20 border-green-500/30' 
    : 'bg-slate-800/50 border-slate-700';

  if (isEditing) {
    return (
      <div className={`card rounded-xl p-4 ${cardBackgroundClass}`}>
        <div className="space-y-3">
          <AutocompleteInput
            value={formData.pokemonName}
            onChange={(e) => setFormData({ ...formData, pokemonName: e.target.value })}
            placeholder="Nom"
            suggestions={getFieldSuggestions('pokemonName', formData.pokemonName)}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          />
          <AutocompleteInput
            value={formData.bloc}
            onChange={(e) => setFormData({ ...formData, bloc: e.target.value })}
            placeholder="Bloc"
            suggestions={getFieldSuggestions('bloc', formData.bloc)}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          />
          <AutocompleteInput
            value={formData.extension}
            onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
            placeholder="Extension"
            suggestions={getFieldSuggestions('extension', formData.extension)}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          >
            <option value="want">Je veux</option>
            <option value="owned">Je possède</option>
          </select>
          <select
            value={formData.condition || 'Near Mint'}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            className="w-full px-3 py-2 rounded bg-slate-800 text-white text-sm"
          >
            <option value="Near Mint">Near Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Played">Played</option>
            <option value="Poor">Poor</option>
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
    <div className={`card rounded-xl p-4 hover:shadow-xl transition-all group ${cardBackgroundClass} ${
      card.status === 'owned' ? 'hover:shadow-green-500/20' : 'hover:shadow-purple-500/20'
    }`}>
      {/* Image */}
      <div className="relative mb-3">
        <img
          src={card.image || card.imageHD || 'https://via.placeholder.com/245x342?text=No+Image'}
          alt={card.pokemonName}
          className={`w-full rounded-lg shadow-lg ${card.status === 'want' ? 'opacity-60 grayscale' : ''}`}
        />
        {card.status === 'owned' && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
            ✓ POSSÉDÉE
          </div>
        )}
        {card.status === 'want' && (
          <div className="absolute top-2 right-2 bg-slate-600 text-slate-300 px-2 py-1 rounded text-xs font-bold">
            ★ RECHERCHÉE
          </div>
        )}
      </div>

      {/* Info */}
      <h3 className="orbitron font-bold text-white text-lg mb-2">{card.pokemonName}</h3>
      
      <div className="space-y-1 text-sm mb-3">
        {card.extension && <p className="text-slate-400">Ext: {card.extension}</p>}
        {card.bloc && <p className="text-slate-400">Bloc: {card.bloc}</p>}
        <p className="text-slate-400">#{card.number}</p>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-slate-400">{card.language}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[card.priority]}`}>
            P{card.priority}
          </span>
        </div>
        
        {card.condition && (
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${conditionColors[card.condition]}`}>
              {card.condition}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-1 text-green-400 font-bold mt-2">
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
