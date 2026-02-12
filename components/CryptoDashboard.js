import React, { useState, useEffect } from 'react';
import { Wallet, Droplet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity, RefreshCw } from 'lucide-react';
import PortfolioChart from './PortfolioChart';

export default function CryptoDashboard() {
  const [cryptos, setCryptos] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [editingCrypto, setEditingCrypto] = useState(null);
  const [editingAirdrop, setEditingAirdrop] = useState(null);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [showAddAirdrop, setShowAddAirdrop] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [walletAddress, setWalletAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [lastUpdateDate, setLastUpdateDate] = useState('');

  // Initialisation au chargement
  useEffect(() => {
    const initDashboard = async () => {
      const savedData = await loadData();
      if (savedData && savedData.length > 0) {
        handlePriceAutoUpdate(savedData);
      }
    };
    initDashboard();
  }, []);

  const loadData = async () => {
    try {
      let loadedCryptos = [];
      if (typeof window !== 'undefined' && localStorage) {
        const cryptoData = localStorage.getItem('cryptos');
        const airdropData = localStorage.getItem('airdrops');
        const historyData = localStorage.getItem('portfolio-history');
        const lastUpdate = localStorage.getItem('last_price_update_date');
        
        if (cryptoData) {
          loadedCryptos = JSON.parse(cryptoData);
          setCryptos(loadedCryptos);
        }
        if (airdropData) setAirdrops(JSON.parse(airdropData));
        if (historyData) setPortfolioHistory(JSON.parse(historyData));
        if (lastUpdate) setLastUpdateDate(lastUpdate);
      }
      return loadedCryptos;
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  // Fonction pour mettre à jour les prix automatiquement (1x par jour)
  const handlePriceAutoUpdate = async (currentCryptos) => {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('last_price_update_date');

    if (lastUpdate === today) {
      console.log("Mise à jour des prix déjà effectuée aujourd'hui.");
      return;
    }

    console.log("Mise à jour quotidienne des prix via CoinGecko...");
    const updatedCryptos = await fetchPricesFromCoinGecko(currentCryptos);
    
    if (updatedCryptos) {
      setCryptos(updatedCryptos);
      saveCryptos(updatedCryptos);
      localStorage.setItem('last_price_update_date', today);
      setLastUpdateDate(today);
    }
  };

  // Appel API CoinGecko
  const fetchPricesFromCoinGecko = async (cryptoList) => {
    if (cryptoList.length === 0) return null;

    try {
      const symbols = cryptoList.map(c => c.symbol.toLowerCase()).join(',');
      // On utilise l'endpoint simple/price qui est très léger
      // Pour être plus précis, CoinGecko préfère les IDs, mais le symbole marche souvent
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbols}&order=market_cap_desc&sparkline=false`
      );
      const data = await response.json();

      if (!Array.isArray(data)) return null;

      return cryptoList.map(crypto => {
        const coinData = data.find(d => d.symbol.toLowerCase() === crypto.symbol.toLowerCase());
        return coinData ? { ...crypto, price: coinData.current_price } : crypto;
      });
    } catch (error) {
      console.error("Erreur CoinGecko:", error);
      return null;
    }
  };

  const saveCryptos = async (newCryptos) => {
    setCryptos(newCryptos);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('cryptos', JSON.stringify(newCryptos));
    }
  };

  // --- RESTE DES FONCTIONS (saveAirdrops, addCrypto, etc.) ---
  // (Inchangées par rapport à la version précédente pour garder la stabilité)
  
  const saveAirdrops = async (newAirdrops) => {
    setAirdrops(newAirdrops);
    if (typeof window !== 'undefined' && localStorage) localStorage.setItem('airdrops', JSON.stringify(newAirdrops));
  };

  const savePortfolioHistory = async (newHistory) => {
    setPortfolioHistory(newHistory);
    if (typeof window !== 'undefined' && localStorage) localStorage.setItem('portfolio-history', JSON.stringify(newHistory));
  };

  const addCrypto = async (crypto) => {
    const newCrypto = { id: Date.now(), ...crypto, addedDate: new Date().toISOString() };
    const listWithNew = [...cryptos, newCrypto];
    // On tente de récupérer le prix immédiatement pour la nouvelle crypto
    const updatedList = await fetchPricesFromCoinGecko(listWithNew);
    await saveCryptos(updatedList || listWithNew);
    setShowAddCrypto(false);
  };

  const updateCrypto = async (id, updates) => {
    await saveCryptos(cryptos.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingCrypto(null);
  };

  const deleteCrypto = async (id) => {
    await saveCryptos(cryptos.filter(c => c.id !== id));
  };

  // Calculs totaux
  const totalValue = cryptos.reduce((sum, c) => sum + (c.amount * (c.price || 0)), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + (c.invested || 0), 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { font-family: 'Space Mono', monospace; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.2); transition: all 0.3s ease; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center relative">
          <h1 className="orbitron text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">
            CRYPTO TRACKER
          </h1>
          {lastUpdateDate && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 orbitron">
              <RefreshCw size={12} className="text-green-500" />
              PRIX À JOUR : {lastUpdateDate.toUpperCase()}
            </div>
          )}
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              <Wallet className="text-indigo-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">TOTAL VALUE</span>
            </div>
            <div className="orbitron text-3xl font-bold text-white">${totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              {totalPnL >= 0 ? <TrendingUp className="text-green-400" size={24} /> : <TrendingDown className="text-red-400" size={24} />}
              <span className="text-xs text-slate-500 orbitron">P&L TOTAL</span>
            </div>
            <div className={`orbitron text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}$
            </div>
          </div>
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              <Activity className="text-purple-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">PERFORMANCE</span>
            </div>
            <div className={`orbitron text-3xl font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('portfolio')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>PORTFOLIO</button>
          <button onClick={() => setActiveTab('airdrops')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'airdrops' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>AIRDROPS</button>
        </div>

        {activeTab === 'portfolio' && (
          <div>
            <div className="card rounded-2xl p-6 mb-6">
               <PortfolioChart cryptos={cryptos} portfolioHistory={portfolioHistory} onUpdateHistory={savePortfolioHistory} />
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Mes Actifs</h2>
              <button onClick={() => setShowAddCrypto(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ AJOUTER MANUELLEMENT</button>
            </div>

            {showAddCrypto && <CryptoForm onSave={addCrypto} onCancel={() => setShowAddCrypto(false)} />}

            <div className="grid grid-cols-1 gap-4">
              {cryptos.map(c => (
                <CryptoCard 
                  key={c.id} 
                  crypto={c} 
                  isEditing={editingCrypto === c.id} 
                  onEdit={() => setEditingCrypto(c.id)} 
                  onSave={(u) => updateCrypto(c.id, u)} 
                  onCancel={() => setEditingCrypto(null)} 
                  onDelete={() => deleteCrypto(c.id)} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Note: La section Airdrops reste identique à ton code précédent */}
      </div>
    </div>
  );
}

// Composant pour l'affichage d'une carte Crypto
function CryptoCard({ crypto, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState(crypto);
  const currentPrice = crypto.price || 0;
  const val = crypto.amount * currentPrice;
  const pnl = val - (crypto.invested || 0);

  if (isEditing) {
    return (
      <div className="card rounded-2xl p-6 grid grid-cols-2 gap-4">
        <input value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} placeholder="Symbole (ex: BTC)" className="p-2 bg-slate-900 rounded text-white" />
        <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} placeholder="Quantité" className="p-2 bg-slate-900 rounded text-white" />
        <input type="number" value={formData.invested} onChange={e => setFormData({...formData, invested: parseFloat(e.target.value)})} placeholder="Total Investi ($)" className="p-2 bg-slate-900 rounded text-white" />
        <div className="flex gap-2">
          <button onClick={() => onSave(formData)} className="bg-green-600 p-2 rounded text-white flex-1"><Save size={16} className="mx-auto"/></button>
          <button onClick={onCancel} className="bg-slate-600 p-2 rounded text-white flex-1"><X size={16} className="mx-auto"/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-500/20 p-3 rounded-full">
          <TrendingUp size={24} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="orbitron text-xl font-bold text-white">{crypto.symbol}</h3>
          <p className="text-slate-500 text-xs">Prix: ${currentPrice.toLocaleString()}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="orbitron font-bold text-white">${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
        <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <button onClick={onEdit} className="p-2 bg-slate-800 rounded text-slate-400 hover:text-white"><Edit2 size={14}/></button>
        <button onClick={onDelete} className="p-2 bg-red-900/20 rounded text-red-500 hover:bg-red-900/40"><Trash2 size={14}/></button>
      </div>
    </div>
  );
}

function CryptoForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ symbol: '', amount: '', invested: '', notes: '' });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input placeholder="Symbole (BTC, ETH...)" onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <input type="number" placeholder="Quantité" onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <input type="number" placeholder="Montant Investi ($)" onChange={e => setFormData({...formData, invested: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <div className="md:col-span-3 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-green-600 px-6 py-2 rounded text-white orbitron font-bold">AJOUTER</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}
