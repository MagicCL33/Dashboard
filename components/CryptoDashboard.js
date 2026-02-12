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

  const saveCryptos = async (newCryptos) => {
    setCryptos(newCryptos);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('cryptos', JSON.stringify(newCryptos));
    }
  };

  const saveAirdrops = async (newAirdrops) => {
    setAirdrops(newAirdrops);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('airdrops', JSON.stringify(newAirdrops));
    }
  };

  const savePortfolioHistory = async (newHistory) => {
    setPortfolioHistory(newHistory);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('portfolio-history', JSON.stringify(newHistory));
    }
  };

  // --- LOGIQUE COINGECKO ---
  const handlePriceAutoUpdate = async (currentCryptos) => {
    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('last_price_update_date');
    if (lastUpdate === today) return;

    const updatedCryptos = await fetchPricesFromCoinGecko(currentCryptos);
    if (updatedCryptos) {
      setCryptos(updatedCryptos);
      saveCryptos(updatedCryptos);
      localStorage.setItem('last_price_update_date', today);
      setLastUpdateDate(today);
    }
  };

  const fetchPricesFromCoinGecko = async (cryptoList) => {
    if (cryptoList.length === 0) return null;
    try {
      const symbols = cryptoList.map(c => c.symbol.toLowerCase()).join(',');
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbols}&order=market_cap_desc&sparkline=false`);
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

  // --- LOGIQUE PORTFOLIO ---
  const addCrypto = async (newAsset) => {
    const existingIndex = cryptos.findIndex(c => c.symbol.toUpperCase() === newAsset.symbol.toUpperCase());
    let updatedList;
    const transaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      amount: parseFloat(newAsset.amount) || 0,
      invested: parseFloat(newAsset.invested) || 0
    };

    if (existingIndex !== -1) {
      updatedList = [...cryptos];
      const existing = updatedList[existingIndex];
      updatedList[existingIndex] = {
        ...existing,
        amount: existing.amount + transaction.amount,
        invested: (existing.invested || 0) + transaction.invested,
        history: [...(existing.history || []), transaction],
        lastAddedDate: new Date().toISOString()
      };
    } else {
      updatedList = [...cryptos, { id: Date.now(), ...newAsset, history: [transaction], addedDate: new Date().toISOString() }];
    }

    const withPrices = await fetchPricesFromCoinGecko(updatedList);
    await saveCryptos(withPrices || updatedList);
    setShowAddCrypto(false);
  };

  const deleteCrypto = async (id) => {
    await saveCryptos(cryptos.filter(c => c.id !== id));
  };

  // --- LOGIQUE AIRDROPS ---
  const addAirdrop = async (airdrop) => {
    const newAirdrop = { id: Date.now(), ...airdrop, tasksCompleted: 0, createdDate: new Date().toISOString() };
    await saveAirdrops([...airdrops, newAirdrop]);
    setShowAddAirdrop(false);
  };

  const deleteAirdrop = async (id) => {
    await saveAirdrops(airdrops.filter(a => a.id !== id));
  };

  const updateAirdrop = async (id, updates) => {
    await saveAirdrops(airdrops.map(a => a.id === id ? { ...a, ...updates } : a));
    setEditingAirdrop(null);
  };

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
        .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.2); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="orbitron text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">CRYPTO TRACKER</h1>
          {lastUpdateDate && <div className="text-[10px] text-slate-500 orbitron">PRIX MAJ : {lastUpdateDate.toUpperCase()}</div>}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-2xl p-6">
            <span className="text-xs text-slate-500 orbitron">TOTAL VALUE</span>
            <div className="orbitron text-3xl font-bold text-white">${totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="card rounded-2xl p-6">
            <span className="text-xs text-slate-500 orbitron">P&L TOTAL</span>
            <div className={`orbitron text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}$
            </div>
          </div>
          <div className="card rounded-2xl p-6">
            <span className="text-xs text-slate-500 orbitron">PERFORMANCE</span>
            <div className={`orbitron text-3xl font-bold ${pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnlPercent.toFixed(2)}%</div>
          </div>
        </div>

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
              <button onClick={() => setShowAddCrypto(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ AJOUTER</button>
            </div>
            {showAddCrypto && <CryptoForm onSave={addCrypto} onCancel={() => setShowAddCrypto(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {cryptos.map(c => <CryptoCard key={c.id} crypto={c} onEdit={() => setEditingCrypto(c.id)} isEditing={editingCrypto === c.id} onDelete={() => deleteCrypto(c.id)} />)}
            </div>
          </div>
        )}

        {activeTab === 'airdrops' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Farming Airdrops</h2>
              <button onClick={() => setShowAddAirdrop(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ AJOUTER PROJET</button>
            </div>
            {showAddAirdrop && <AirdropForm onSave={addAirdrop} onCancel={() => setShowAddAirdrop(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {airdrops.map(a => <AirdropCard key={a.id} airdrop={a} onDelete={() => deleteAirdrop(a.id)} onEdit={() => setEditingAirdrop(a.id)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function CryptoCard({ crypto, isEditing, onEdit, onDelete }) {
  const [showHistory, setShowHistory] = useState(false);
  const currentPrice = crypto.price || 0;
  const val = crypto.amount * currentPrice;
  const pnl = val - (crypto.invested || 0);

  return (
    <div className="card rounded-2xl overflow-hidden mb-2">
      <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800/40" onClick={() => setShowHistory(!showHistory)}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-full"><TrendingUp size={24} className="text-indigo-400" /></div>
          <div>
            <h3 className="orbitron text-xl font-bold text-white">{crypto.symbol}</h3>
            <p className="text-slate-500 text-xs">${currentPrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="orbitron font-bold text-white">${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$</div>
        </div>
        <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <button onClick={onDelete} className="p-2 bg-red-900/20 rounded text-red-500"><Trash2 size={14}/></button>
        </div>
      </div>
      {showHistory && crypto.history && (
        <div className="bg-slate-900/60 p-4 border-t border-slate-800">
          <table className="w-full text-[10px] text-left">
            <thead><tr className="text-slate-500 border-b border-slate-800"><th className="pb-2">DATE</th><th className="pb-2">QTÉ</th><th className="pb-2">INVESTI</th><th className="pb-2 text-right">PAMP</th></tr></thead>
            <tbody>
              {crypto.history.map(tx => (
                <tr key={tx.id} className="border-b border-slate-800/30">
                  <td className="py-2 text-slate-400">{tx.date}</td><td className="py-2 text-white">{tx.amount}</td><td className="py-2 text-white">${tx.invested}</td>
                  <td className="py-2 text-right text-slate-500">${(tx.invested / tx.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CryptoForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ symbol: '', amount: '', invested: '' });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <input placeholder="Symbole" onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <input type="number" placeholder="Quantité" onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <input type="number" placeholder="Investi ($)" onChange={e => setFormData({...formData, invested: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <div className="md:col-span-3 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-indigo-600 px-6 py-2 rounded text-white orbitron font-bold">AJOUTER</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}

function AirdropCard({ airdrop, onDelete }) {
  const completionPercent = (airdrop.tasksCompleted / airdrop.tasksTotal) * 100;
  return (
    <div className="card rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="orbitron text-2xl font-bold text-white">{airdrop.project}</h3>
        <button onClick={onDelete} className="p-2 bg-red-900/20 rounded text-red-500"><Trash2 size={14}/></button>
      </div>
      <div className="text-xs orbitron text-slate-500 mb-1">PROGRESSION : {airdrop.tasksCompleted}/{airdrop.tasksTotal}</div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${completionPercent}%` }} /></div>
    </div>
  );
}

function AirdropForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ project: '', tasksTotal: 10 });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Nom du Projet" onChange={e => setFormData({...formData, project: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <input type="number" placeholder="Total Tâches" onChange={e => setFormData({...formData, tasksTotal: parseInt(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700" />
      <div className="md:col-span-2 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-indigo-600 px-6 py-2 rounded text-white orbitron font-bold">CRÉER</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}
