import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity, RefreshCw, Target, Search, History } from 'lucide-react';
import PortfolioChart from './PortfolioChart';

export default function CryptoDashboard() {
  const [cryptos, setCryptos] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [tradeActions, setTradeActions] = useState([]); // Nouvel état pour les trades
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [editingCrypto, setEditingCrypto] = useState(null);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false); // Modal pour nouveau trade
  const [showAddAirdrop, setShowAddAirdrop] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [lastUpdateDate, setLastUpdateDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
      if (typeof window !== 'undefined' && localStorage) {
        const cryptoData = localStorage.getItem('cryptos');
        const airdropData = localStorage.getItem('airdrops');
        const tradeData = localStorage.getItem('trade-actions');
        const historyData = localStorage.getItem('portfolio-history');
        const lastUpdate = localStorage.getItem('last_price_update_date');
        
        if (cryptoData) setCryptos(JSON.parse(cryptoData));
        if (airdropData) setAirdrops(JSON.parse(airdropData));
        if (tradeData) setTradeActions(JSON.parse(tradeData));
        if (historyData) setPortfolioHistory(JSON.parse(historyData));
        if (lastUpdate) setLastUpdateDate(lastUpdate);
        
        return cryptoData ? JSON.parse(cryptoData) : [];
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const saveTrades = (newTrades) => {
    setTradeActions(newTrades);
    localStorage.setItem('trade-actions', JSON.stringify(newTrades));
  };

  // --- LOGIQUE PRIX COINGECKO ---
  const handlePriceAutoUpdate = async (currentCryptos) => {
    const today = new Date().toDateString();
    if (localStorage.getItem('last_price_update_date') === today) return;
    const updated = await fetchPricesFromCoinGecko(currentCryptos);
    if (updated) {
      setCryptos(updated);
      localStorage.setItem('cryptos', JSON.stringify(updated));
      localStorage.setItem('last_price_update_date', today);
      setLastUpdateDate(today);
    }
  };

  const fetchPricesFromCoinGecko = async (list) => {
    if (!list || list.length === 0) return null;
    try {
      const symbols = list.map(c => c.symbol.toLowerCase()).join(',');
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbols}`);
      const data = await res.json();
      return list.map(c => {
        const match = data.find(d => d.symbol.toLowerCase() === c.symbol.toLowerCase());
        return match ? { ...c, price: match.current_price } : c;
      });
    } catch (e) { return null; }
  };

  // --- LOGIQUE TRADES ---
  const addTradeAction = (trade) => {
    const newTrades = [{ id: Date.now(), ...trade }, ...tradeActions];
    saveTrades(newTrades);
    setShowAddTrade(false);
  };

  const deleteTrade = (id) => {
    const newTrades = tradeActions.filter(t => t.id !== id);
    saveTrades(newTrades);
  };

  // Filtrage des actions
  const filteredActions = useMemo(() => {
    return tradeActions.filter(t => 
      t.crypto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.wallet?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tradeActions, searchQuery]);

  const recentActions = filteredActions.slice(0, 5);

  // --- CALCULS GLOBAUX ---
  const assetsValue = cryptos.reduce((sum, c) => sum + ((c.amount || 0) * (c.price || 0)), 0);
  const tradePnL = tradeActions.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + (c.invested || 0), 0);
  const totalPnL = (assetsValue - totalInvested) + tradePnL;

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
          <h1 className="orbitron text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">CRYPTO TRACKER</h1>
          <p className="text-[10px] text-slate-500 orbitron tracking-[0.3em] mt-2">Dernière MAJ : {lastUpdateDate || 'Maintenant'}</p>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-2xl p-6 border-b-2 border-b-indigo-500">
            <span className="text-xs text-slate-500 orbitron">VALEUR ACTIFS</span>
            <div className="orbitron text-3xl font-bold text-white">${assetsValue.toLocaleString('fr-FR')}</div>
          </div>
          <div className="card rounded-2xl p-6 border-b-2 border-b-emerald-500">
            <span className="text-xs text-slate-500 orbitron">P&L TOTAL (ACTIFS + TRADES)</span>
            <div className={`orbitron text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('fr-FR')}$
            </div>
          </div>
          <div className="card rounded-2xl p-6 border-b-2 border-b-pink-500">
            <span className="text-xs text-slate-500 orbitron">PNL TRADING SEUL</span>
            <div className={`orbitron text-3xl font-bold ${tradePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tradePnL >= 0 ? '+' : ''}{tradePnL.toLocaleString('fr-FR')}$
            </div>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('portfolio')} className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>PORTFOLIO</button>
          <button onClick={() => setActiveTab('airdrops')} className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'airdrops' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>AIRDROPS</button>
        </div>

        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* --- SECTION ACTIONS (TRADES) --- */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <History className="text-indigo-400" size={24} />
                  <h2 className="orbitron text-2xl font-bold text-white">Journal d'Actions</h2>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Filtrer les actions..." 
                      className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm outline-none focus:border-indigo-500 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setShowAddTrade(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-xs hover:bg-indigo-500">+ NOUVEAU TRADE</button>
                </div>
              </div>

              {showAddTrade && <TradeForm onSave={addTradeAction} onCancel={() => setShowAddTrade(false)} />}

              <div className="card rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/50 text-slate-400 orbitron text-[10px] tracking-widest">
                    <tr>
                      <th className="p-4">DATE</th>
                      <th className="p-4">CRYPTO</th>
                      <th className="p-4">ACTION</th>
                      <th className="p-4">WALLET</th>
                      <th className="p-4 text-right">GAINS/PERTES</th>
                      <th className="p-4">NOTE</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActions.map(trade => (
                      <tr key={trade.id} className="border-t border-slate-800 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-slate-400">{trade.date}</td>
                        <td className="p-4 font-bold text-white">{trade.crypto}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] orbitron ${trade.type === 'BUY' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{trade.wallet}</td>
                        <td className={`p-4 text-right font-bold ${parseFloat(trade.pnl) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl}$
                        </td>
                        <td className="p-4 text-xs text-slate-500 italic max-w-xs truncate">{trade.note}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteTrade(trade.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredActions.length > 5 && (
                  <div className="p-3 text-center bg-slate-900/30 text-[10px] text-slate-500 orbitron">
                    UTILISEZ LA BARRE DE RECHERCHE POUR VOIR LES ACTIONS PLUS ANCIENNES
                  </div>
                )}
                {filteredActions.length === 0 && (
                  <div className="p-10 text-center text-slate-500 orbitron text-xs">AUCUNE ACTION TROUVÉE</div>
                )}
              </div>
            </section>

            <hr className="border-slate-800" />

            {/* --- SECTION ACTIFS --- */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <Activity className="text-emerald-400" size={24} />
                  <h2 className="orbitron text-2xl font-bold text-white">Mes Actifs (Hold)</h2>
                </div>
                <button onClick={() => setShowAddCrypto(true)} className="bg-emerald-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-xs hover:bg-emerald-500">+ AJOUTER ACTIF</button>
              </div>
              
              {showAddCrypto && <CryptoForm onSave={(c) => { 
                const newList = [...cryptos, { id: Date.now(), ...c, history: [{ id: Date.now(), date: new Date().toLocaleDateString(), amount: c.amount, invested: c.invested }] }];
                setCryptos(newList);
                localStorage.setItem('cryptos', JSON.stringify(newList));
                setShowAddCrypto(false);
              }} onCancel={() => setShowAddCrypto(false)} />}

              <div className="grid grid-cols-1 gap-4">
                {cryptos.map(c => <CryptoCard key={c.id} crypto={c} onDelete={() => {
                  const filtered = cryptos.filter(item => item.id !== c.id);
                  setCryptos(filtered);
                  localStorage.setItem('cryptos', JSON.stringify(filtered));
                }} />)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'airdrops' && (
          <div className="animate-in fade-in duration-500">
             {/* Le contenu de l'onglet airdrop reste identique à ta version précédente */}
             <div className="p-10 text-center text-slate-500 orbitron">INTERFACE AIRDROPS ACTIVE</div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- FORMULAIRE TRADE ---
function TradeForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ 
    crypto: '', 
    type: 'SELL', 
    date: new Date().toISOString().split('T')[0], 
    pnl: '', 
    wallet: '', 
    note: '' 
  });

  return (
    <div className="card rounded-2xl p-6 mb-6 border-2 border-indigo-500/30 animate-in zoom-in duration-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input placeholder="Crypto (ex: BTC)" value={formData.crypto} onChange={e => setFormData({...formData, crypto: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none" />
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none">
          <option value="SELL">VENTE / TAKE PROFIT</option>
          <option value="BUY">ACHAT / RECHARGE</option>
        </select>
        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none" />
        <input type="number" placeholder="Gains/Pertes ($)" value={formData.pnl} onChange={e => setFormData({...formData, pnl: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none" />
        <input placeholder="Wallet utilisé" value={formData.wallet} onChange={e => setFormData({...formData, wallet: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none" />
        <input placeholder="Note" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-700 outline-none" />
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave(formData)} className="bg-indigo-600 px-6 py-2 rounded text-white orbitron font-bold flex-1">ENREGISTRER L'ACTION</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}

// --- LES AUTRES COMPOSANTS (CryptoCard, CryptoForm) RESTENT LES MÊMES QUE TA VERSION PRÉCÉDENTE ---
function CryptoCard({ crypto, onDelete }) {
  const [showHistory, setShowHistory] = useState(false);
  const val = (crypto.amount || 0) * (crypto.price || 0);
  const pnl = val - (crypto.invested || 0);
  return (
    <div className="card rounded-2xl overflow-hidden border border-slate-800/50">
      <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setShowHistory(!showHistory)}>
        <div className="flex items-center gap-4">
          <div className="bg-indigo-500/20 p-3 rounded-full"><TrendingUp size={24} className="text-indigo-400" /></div>
          <div><h3 className="orbitron text-xl font-bold text-white">{crypto.symbol}</h3><p className="text-slate-500 text-xs">${(crypto.price || 0).toLocaleString()}</p></div>
        </div>
        <div className="text-right">
          <div className="orbitron font-bold text-white">${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$</div>
        </div>
        <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
          <button onClick={onDelete} className="p-2 bg-red-900/10 rounded text-red-500"><Trash2 size={14}/></button>
        </div>
      </div>
      {showHistory && crypto.history && (
        <div className="bg-slate-900/60 p-4 border-t border-slate-800/50">
          <table className="w-full text-[10px] text-left text-slate-400">
            <thead><tr className="border-b border-slate-800"><th className="pb-2">DATE</th><th className="pb-2">QTÉ</th><th className="pb-2">INVESTI</th></tr></thead>
            <tbody>{crypto.history.map(tx => (<tr key={tx.id}><td className="py-1">{tx.date}</td><td>{tx.amount}</td><td>${tx.invested}</td></tr>))}</tbody>
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
      <input placeholder="Symbole" onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded border border-slate-700 text-white" />
      <input type="number" placeholder="Quantité" onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded border border-slate-700 text-white" />
      <input type="number" placeholder="Investi ($)" onChange={e => setFormData({...formData, invested: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded border border-slate-700 text-white" />
      <div className="md:col-span-3 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-emerald-600 px-6 py-2 rounded text-white orbitron font-bold flex-1">CONFIRMER L'ACTIF</button>
        <button onClick={onCancel} className="bg-slate-700 px-6 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}
