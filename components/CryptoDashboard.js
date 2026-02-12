import React, { useState, useEffect } from 'react';
import { Wallet, Droplet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity, RefreshCw, Target } from 'lucide-react';
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

  // --- INITIALISATION ---
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
        if (airdropData) {
          const parsedAirdrops = JSON.parse(airdropData);
          const securedAirdrops = parsedAirdrops.map(a => ({
            ...a,
            actions: a.actions || [],
            totalPnL: a.totalPnL || 0,
            targetGain: a.targetGain || 0 // Initialisation de l'objectif
          }));
          setAirdrops(securedAirdrops);
        }
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
    if (!cryptoList || cryptoList.length === 0) return null;
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
        amount: (existing.amount || 0) + transaction.amount,
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
  const addAirdropAction = async (newAction) => {
    const existingIndex = airdrops.findIndex(a => a.project?.toLowerCase() === newAction.project?.toLowerCase());
    let updatedAirdrops;
    
    const actionEntry = {
      id: Date.now(),
      date: newAction.date, // Utilise la date rentrée par l'utilisateur
      wallet: newAction.wallet || 'Principal',
      profitLoss: parseFloat(newAction.profitLoss) || 0,
      note: newAction.note || ''
    };

    if (existingIndex !== -1) {
      updatedAirdrops = [...airdrops];
      const existing = updatedAirdrops[existingIndex];
      updatedAirdrops[existingIndex] = {
        ...existing,
        status: newAction.status,
        targetGain: parseFloat(newAction.targetGain) || existing.targetGain,
        totalPnL: (existing.totalPnL || 0) + actionEntry.profitLoss,
        actions: [actionEntry, ...(existing.actions || [])]
      };
    } else {
      updatedAirdrops = [...airdrops, {
        id: Date.now(),
        project: newAction.project,
        status: newAction.status,
        targetGain: parseFloat(newAction.targetGain) || 0,
        totalPnL: actionEntry.profitLoss,
        actions: [actionEntry]
      }];
    }

    await saveAirdrops(updatedAirdrops);
    setShowAddAirdrop(false);
  };

  const deleteAirdrop = async (id) => {
    await saveAirdrops(airdrops.filter(a => a.id !== id));
  };

  // --- CALCULS ---
  const totalValue = cryptos.reduce((sum, c) => sum + ((c.amount || 0) * (c.price || 0)), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + (c.invested || 0), 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8 text-slate-200">
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
          <button onClick={() => setActiveTab('portfolio')} className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-400'}`}>PORTFOLIO</button>
          <button onClick={() => setActiveTab('airdrops')} className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'airdrops' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-800 text-slate-400'}`}>AIRDROPS</button>
        </div>

        {activeTab === 'portfolio' && (
          <div className="animate-in fade-in duration-500">
            <div className="card rounded-2xl p-6 mb-6">
              <PortfolioChart cryptos={cryptos} portfolioHistory={portfolioHistory} onUpdateHistory={savePortfolioHistory} />
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Mes Actifs</h2>
              <button onClick={() => setShowAddCrypto(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm hover:bg-indigo-500 transition-colors">+ AJOUTER</button>
            </div>
            {showAddCrypto && <CryptoForm onSave={addCrypto} onCancel={() => setShowAddCrypto(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {cryptos.map(c => <CryptoCard key={c.id} crypto={c} onDelete={() => deleteCrypto(c.id)} />)}
            </div>
          </div>
        )}

        {activeTab === 'airdrops' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Farming Airdrops</h2>
              <button onClick={() => setShowAddAirdrop(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm hover:bg-indigo-500 transition-colors">+ NOUVELLE ACTION</button>
            </div>
            {showAddAirdrop && <AirdropForm onSave={addAirdropAction} onCancel={() => setShowAddAirdrop(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {airdrops && airdrops.length > 0 ? (
                airdrops.map(a => <AirdropCard key={a.id} airdrop={a} onDelete={() => deleteAirdrop(a.id)} />)
              ) : (
                <div className="card rounded-2xl p-12 text-center text-slate-500 orbitron">AUCUN PROJET ENREGISTRÉ</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function CryptoCard({ crypto, onDelete }) {
  const [showHistory, setShowHistory] = useState(false);
  const currentPrice = crypto?.price || 0;
  const val = (crypto?.amount || 0) * currentPrice;
  const pnl = val - (crypto?.invested || 0);

  return (
    <div className="card rounded-2xl overflow-hidden mb-2 border border-slate-800/50">
      <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800/40" onClick={() => setShowHistory(!showHistory)}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-full"><TrendingUp size={24} className="text-indigo-400" /></div>
          <div>
            <h3 className="orbitron text-xl font-bold text-white">{crypto?.symbol}</h3>
            <p className="text-slate-500 text-xs tracking-widest">${currentPrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="orbitron font-bold text-white">${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$ ({crypto.invested > 0 ? ((pnl / crypto.invested) * 100).toFixed(1) : 0}%)
          </div>
        </div>
        <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <button onClick={onDelete} className="p-2 bg-red-900/10 rounded text-red-500 hover:bg-red-900/30"><Trash2 size={14}/></button>
        </div>
      </div>
      {showHistory && crypto?.history && (
        <div className="bg-slate-900/60 p-4 border-t border-slate-800/50">
          <table className="w-full text-[10px] text-left">
            <thead><tr className="text-slate-500 border-b border-slate-800"><th className="pb-2">DATE</th><th className="pb-2">QTÉ</th><th className="pb-2">INVESTI</th><th className="pb-2 text-right">PAMP</th></tr></thead>
            <tbody>
              {crypto.history.map(tx => (
                <tr key={tx.id} className="border-b border-slate-800/30 text-slate-300">
                  <td className="py-2">{tx.date}</td><td className="py-2">{tx.amount}</td><td className="py-2">${tx.invested}</td>
                  <td className="py-2 text-right text-slate-500">${tx.amount > 0 ? (tx.invested / tx.amount).toFixed(2) : 0}</td>
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
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-indigo-500/20">
      <input placeholder="Symbole (ex: BTC)" onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 focus:border-indigo-500 outline-none" />
      <input type="number" placeholder="Quantité" onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 focus:border-indigo-500 outline-none" />
      <input type="number" placeholder="Investi ($)" onChange={e => setFormData({...formData, invested: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 focus:border-indigo-500 outline-none" />
      <div className="md:col-span-3 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-indigo-600 px-6 py-2 rounded text-white orbitron font-bold flex-1">CONFIRMER</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS AIRDROPS ---

function AirdropCard({ airdrop, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const statusColors = { 
    'En cours': 'text-blue-400 border-blue-400/30 bg-blue-400/10', 
    'À continuer': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', 
    'Terminé': 'text-green-400 border-green-400/30 bg-green-400/10' 
  };

  const target = airdrop?.targetGain || 0;
  const costs = Math.abs(airdrop?.totalPnL || 0);
  const ratio = target > 0 ? (costs / target) * 100 : 0;

  return (
    <div className="card rounded-2xl overflow-hidden mb-2 border-l-4 border-l-indigo-500">
      <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-800/40" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="orbitron text-xl font-bold text-white uppercase">{airdrop?.project || 'Projet'}</h3>
            <span className={`text-[8px] px-2 py-0.5 rounded border orbitron ${statusColors[airdrop?.status] || 'text-slate-400'}`}>
              {airdrop?.status?.toUpperCase() || 'EN COURS'}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 orbitron">
              <Target size={10} className="text-pink-400" />
              OBJ : ${target.toLocaleString()}
            </div>
            <p className="text-slate-500 text-[10px] orbitron">{airdrop?.actions?.length || 0} ACTIONS</p>
          </div>
          {/* Barre de rentabilité (coûts vs objectif) */}
          <div className="w-48 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-pink-500/50" style={{ width: `${Math.min(ratio, 100)}%` }} />
          </div>
        </div>
        
        <div className="text-right flex items-center gap-6">
          <div>
            <div className="text-[10px] text-slate-500 orbitron">COÛTS GAS/FRAIS</div>
            <div className={`orbitron font-bold ${airdrop?.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {airdrop?.totalPnL > 0 ? '+' : ''}{(airdrop?.totalPnL || 0).toFixed(2)}$
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(airdrop.id); }} className="text-red-500/50 hover:text-red-500 transition-colors">
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
      
      {showDetails && airdrop?.actions && (
        <div className="bg-slate-900/60 p-4 border-t border-slate-800/50">
          <div className="space-y-2">
            {airdrop.actions.map(action => (
              <div key={action.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <div className="flex flex-col">
                  <span className="text-[9px] text-indigo-400 orbitron">{action.date} — {action.wallet?.toUpperCase()}</span>
                  <span className="text-xs text-slate-200 mt-1">{action.note}</span>
                </div>
                <div className={`orbitron text-xs font-bold ${action.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {action.profitLoss > 0 ? '+' : ''}{action.profitLoss}$
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AirdropForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ 
    project: '', 
    wallet: '', 
    date: new Date().toISOString().split('T')[0], 
    profitLoss: '', 
    note: '',
    status: 'En cours',
    targetGain: '' 
  });

  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-2 border-indigo-500/20">
      <div className="md:col-span-2 flex justify-between items-center border-b border-slate-800 pb-2 mb-2">
        <h3 className="orbitron text-sm text-indigo-400 tracking-widest uppercase">Nouvelle Action Farming</h3>
      </div>
      
      <input placeholder="Projet" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      <input placeholder="Wallet" value={formData.wallet} onChange={e => setFormData({...formData, wallet: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      
      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      <input type="number" placeholder="Objectif de gain ($)" value={formData.targetGain} onChange={e => setFormData({...formData, targetGain: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      
      <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none">
        <option>En cours</option>
        <option>À continuer</option>
        <option>Terminé</option>
      </select>
      <input type="number" placeholder="Frais/Gain ($) ex: -5.50" value={formData.profitLoss} onChange={e => setFormData({...formData, profitLoss: e.target.value})} className="p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      
      <input placeholder="Note (Action effectuée)" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="md:col-span-2 p-2 bg-slate-900 rounded text-white border border-slate-700 outline-none" />
      
      <div className="md:col-span-2 flex gap-2 mt-2">
        <button onClick={() => onSave(formData)} className="bg-indigo-600 px-6 py-2 rounded text-white orbitron font-bold flex-1 hover:bg-indigo-500">ENREGISTRER</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}
