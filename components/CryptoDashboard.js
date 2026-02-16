import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity, RefreshCw, Target, Search, History, Droplet } from 'lucide-react';
import PortfolioChart from './PortfolioChart';

export default function CryptoDashboard() {
  const [cryptos, setCryptos] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [tradeActions, setTradeActions] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [editingCrypto, setEditingCrypto] = useState(null);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);
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
        if (tradeData) setTradeActions(JSON.parse(tradeData));
        if (historyData) setPortfolioHistory(JSON.parse(historyData));
        if (lastUpdate) setLastUpdateDate(lastUpdate);
        
        if (airdropData) {
          const parsed = JSON.parse(airdropData);
          setAirdrops(parsed.map(a => ({ ...a, actions: a.actions || [], totalPnL: a.totalPnL || 0 })));
        }
        
        return cryptoData ? JSON.parse(cryptoData) : [];
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  };

  const saveCryptos = (newList) => {
    setCryptos(newList);
    localStorage.setItem('cryptos', JSON.stringify(newList));
  };

  const saveAirdrops = (newList) => {
    setAirdrops(newList);
    localStorage.setItem('airdrops', JSON.stringify(newList));
  };

  // --- PRIX ---
  const handlePriceAutoUpdate = async (list) => {
    const today = new Date().toDateString();
    if (localStorage.getItem('last_price_update_date') === today) return;
    const updated = await fetchPricesFromCoinGecko(list);
    if (updated) {
      saveCryptos(updated);
      localStorage.setItem('last_price_update_date', today);
      setLastUpdateDate(today);
    }
  };

  const fetchPricesFromCoinGecko = async (list) => {
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

  // --- ACTIONS PORTFOLIO ---
  const addTradeAction = (trade) => {
    const newTrades = [{ id: Date.now(), ...trade }, ...tradeActions];
    setTradeActions(newTrades);
    localStorage.setItem('trade-actions', JSON.stringify(newTrades));
    setShowAddTrade(false);
  };

  const addCrypto = async (newAsset) => {
    const existingIndex = cryptos.findIndex(c => c.symbol.toUpperCase() === newAsset.symbol.toUpperCase());
    let updatedList;
    const transaction = { id: Date.now(), date: new Date().toLocaleDateString(), amount: parseFloat(newAsset.amount) || 0, invested: parseFloat(newAsset.invested) || 0 };

    if (existingIndex !== -1) {
      updatedList = [...cryptos];
      updatedList[existingIndex] = { ...updatedList[existingIndex], amount: updatedList[existingIndex].amount + transaction.amount, invested: updatedList[existingIndex].invested + transaction.invested, history: [...(updatedList[existingIndex].history || []), transaction] };
    } else {
      updatedList = [...cryptos, { id: Date.now(), ...newAsset, history: [transaction], addedDate: new Date().toISOString() }];
    }
    saveCryptos(updatedList);
    setShowAddCrypto(false);
  };

  // --- ACTIONS AIRDROPS ---
  const addAirdropAction = (newAction) => {
    const existingIndex = airdrops.findIndex(a => a.project.toLowerCase() === newAction.project.toLowerCase());
    let updated;
    const entry = { id: Date.now(), date: newAction.date, wallet: newAction.wallet, profitLoss: parseFloat(newAction.profitLoss) || 0, note: newAction.note };

    if (existingIndex !== -1) {
      updated = [...airdrops];
      updated[existingIndex] = { ...updated[existingIndex], status: newAction.status, targetGain: parseFloat(newAction.targetGain) || updated[existingIndex].targetGain, totalPnL: updated[existingIndex].totalPnL + entry.profitLoss, actions: [entry, ...(updated[existingIndex].actions || [])] };
    } else {
      updated = [...airdrops, { id: Date.now(), project: newAction.project, status: newAction.status, targetGain: parseFloat(newAction.targetGain) || 0, totalPnL: entry.profitLoss, actions: [entry] }];
    }
    saveAirdrops(updated);
    setShowAddAirdrop(false);
  };

  // --- CALCULS ---
  const assetsValue = cryptos.reduce((sum, c) => sum + ((c.amount || 0) * (c.price || 0)), 0);
  const tradePnL = tradeActions.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + (c.invested || 0), 0);
  const totalPnL = (assetsValue - totalInvested) + tradePnL;

  const filteredTrades = tradeActions.filter(t => t.crypto?.toLowerCase().includes(searchQuery.toLowerCase()) || t.note?.toLowerCase().includes(searchQuery.toLowerCase()));

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
          <p className="text-[10px] text-slate-500 orbitron mt-2 tracking-[0.3em]">MAJ : {lastUpdateDate || 'EN ATTENTE'}</p>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-2xl p-6 border-b-2 border-b-indigo-500">
            <span className="text-xs text-slate-500 orbitron">PORTFOLIO VALUE</span>
            <div className="orbitron text-3xl font-bold text-white">${assetsValue.toLocaleString('fr-FR')}</div>
          </div>
          <div className="card rounded-2xl p-6 border-b-2 border-b-emerald-500">
            <span className="text-xs text-slate-500 orbitron">P&L GLOBAL</span>
            <div className={`orbitron text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('fr-FR')}$
            </div>
          </div>
          <div className="card rounded-2xl p-6 border-b-2 border-b-pink-500">
            <span className="text-xs text-slate-500 orbitron">TRADING PNL</span>
            <div className={`orbitron text-3xl font-bold ${tradePnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {tradePnL >= 0 ? '+' : ''}{tradePnL.toLocaleString('fr-FR')}$
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('portfolio')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>PORTFOLIO</button>
          <button onClick={() => setActiveTab('airdrops')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'airdrops' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>AIRDROPS</button>
        </div>

        {activeTab === 'portfolio' && (
          <div className="space-y-8 animate-in fade-in">
            {/* GRAPHIQUE */}
            <div className="card rounded-2xl p-6">
              <PortfolioChart cryptos={cryptos} portfolioHistory={portfolioHistory} onUpdateHistory={(h) => { setPortfolioHistory(h); localStorage.setItem('portfolio-history', JSON.stringify(h)); }} />
            </div>

            {/* JOURNAL TRADING */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 font-bold orbitron text-white"><History size={20}/> DERNIÈRES ACTIONS</div>
                <div className="flex gap-2">
                  <input placeholder="Rechercher..." className="p-2 bg-slate-900 rounded-lg text-xs border border-slate-800" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  <button onClick={() => setShowAddTrade(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-[10px]">+ TRADE</button>
                </div>
              </div>
              {showAddTrade && <TradeForm onSave={addTradeAction} onCancel={() => setShowAddTrade(false)} />}
              <div className="card rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-slate-500">
                    <tr><th className="p-4">DATE</th><th className="p-4">CRYPTO</th><th className="p-4">PNL</th><th className="p-4">NOTE</th></tr>
                  </thead>
                  <tbody>
                    {filteredTrades.slice(0, 5).map(t => (
                      <tr key={t.id} className="border-t border-slate-800/50">
                        <td className="p-4 text-slate-400">{t.date}</td><td className="p-4 font-bold">{t.crypto}</td>
                        <td className={`p-4 font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{t.pnl}$</td>
                        <td className="p-4 text-slate-500 italic">{t.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ACTIFS */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <div className="orbitron font-bold text-white">MES ACTIFS (HOLD)</div>
                <button onClick={() => setShowAddCrypto(true)} className="bg-emerald-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-[10px]">+ ACTIF</button>
              </div>
              {showAddCrypto && <CryptoForm onSave={addCrypto} onCancel={() => setShowAddCrypto(false)} />}
              <div className="grid grid-cols-1 gap-2">
                {cryptos.map(c => <CryptoCard key={c.id} crypto={c} onDelete={() => saveCryptos(cryptos.filter(i => i.id !== c.id))} />)}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'airdrops' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="orbitron text-2xl font-bold text-white">Journal Airdrops</h2>
              <button onClick={() => setShowAddAirdrop(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ ACTION</button>
            </div>
            {showAddAirdrop && <AirdropForm onSave={addAirdropAction} onCancel={() => setShowAddAirdrop(false)} />}
            {airdrops.map(a => (
              <AirdropCard key={a.id} airdrop={a} onDelete={() => saveAirdrops(airdrops.filter(i => i.id !== a.id))} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function CryptoCard({ crypto, onDelete }) {
  const [show, setShow] = useState(false);
  const val = (crypto.amount || 0) * (crypto.price || 0);
  const pnl = val - (crypto.invested || 0);
  return (
    <div className="card rounded-2xl overflow-hidden">
      <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setShow(!show)}>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-full text-indigo-400"><TrendingUp size={18}/></div>
          <div><h3 className="orbitron font-bold text-white">{crypto.symbol}</h3><p className="text-[10px] text-slate-500">${(crypto.price || 0).toLocaleString()}</p></div>
        </div>
        <div className="text-right">
          <div className="orbitron font-bold text-white">${val.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</div>
          <div className={`text-[10px] ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$</div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(); }} className="ml-4 p-2 text-red-500/50 hover:text-red-500"><Trash2 size={14}/></button>
      </div>
      {show && crypto.history && (
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 text-[10px]">
          <table className="w-full text-left">
            <thead className="text-slate-500 border-b border-slate-800"><tr><th className="pb-1">DATE</th><th className="pb-1">QTÉ</th><th className="pb-1">PRU</th></tr></thead>
            <tbody>{crypto.history.map(tx => (<tr key={tx.id}><td className="py-1">{tx.date}</td><td>{tx.amount}</td><td>${(tx.invested / tx.amount).toFixed(2)}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TradeForm({ onSave, onCancel }) {
  const [f, setF] = useState({ crypto: '', pnl: '', note: '', date: new Date().toISOString().split('T')[0] });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-2 gap-4 border-indigo-500/30">
      <input placeholder="Crypto" onChange={e => setF({...f, crypto: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input type="number" placeholder="PNL ($)" onChange={e => setF({...f, pnl: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input type="date" value={f.date} onChange={e => setF({...f, date: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input placeholder="Note" onChange={e => setF({...f, note: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <div className="col-span-2 flex gap-2"><button onClick={() => onSave(f)} className="bg-indigo-600 flex-1 p-2 rounded orbitron font-bold">AJOUTER LE TRADE</button><button onClick={onCancel} className="bg-slate-700 p-2 rounded">ANNULER</button></div>
    </div>
  );
}

function AirdropCard({ airdrop, onDelete }) {
  const [show, setShow] = useState(false);
  const statusColors = { 'En cours': 'text-blue-400 border-blue-400/30 bg-blue-400/10', 'À continuer': 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10', 'Terminé': 'text-green-400 border-green-400/30 bg-green-400/10' };
  return (
    <div className="card rounded-2xl overflow-hidden border-l-4 border-indigo-500">
      <div className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => setShow(!show)}>
        <div>
          <div className="flex items-center gap-2"><h3 className="orbitron font-bold text-white">{airdrop.project}</h3><span className={`text-[8px] px-2 py-0.5 rounded border orbitron ${statusColors[airdrop.status]}`}>{airdrop.status?.toUpperCase()}</span></div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500"><Target size={10} className="text-pink-400"/> OBJ: ${airdrop.targetGain}</div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div><div className="text-[10px] text-slate-500 orbitron uppercase">Bilan</div><div className={`orbitron font-bold ${airdrop.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>{airdrop.totalPnL.toFixed(2)}$</div></div>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="text-red-500/30 hover:text-red-500"><Trash2 size={16}/></button>
        </div>
      </div>
      {show && airdrop.actions && (
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 space-y-2">
          {airdrop.actions.map(a => (
            <div key={a.id} className="flex justify-between items-center text-[10px] bg-slate-800/30 p-2 rounded">
              <span className="text-slate-400">{a.date} — {a.note}</span><span className={a.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>{a.profitLoss}$</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AirdropForm({ onSave, onCancel }) {
  const [f, setF] = useState({ project: '', wallet: '', date: new Date().toISOString().split('T')[0], profitLoss: '', note: '', status: 'En cours', targetGain: '' });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-2 gap-4">
      <input placeholder="Projet" onChange={e => setF({...f, project: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input placeholder="Objectif ($)" type="number" onChange={e => setF({...f, targetGain: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <select onChange={e => setF({...f, status: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800"><option>En cours</option><option>À continuer</option><option>Terminé</option></select>
      <input type="number" placeholder="Frais/Gain ($)" onChange={e => setF({...f, profitLoss: e.target.value})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input placeholder="Note" className="col-span-2 p-2 bg-slate-900 rounded border border-slate-800" onChange={e => setF({...f, note: e.target.value})} />
      <button onClick={() => onSave(f)} className="col-span-2 bg-indigo-600 p-2 rounded orbitron font-bold">AJOUTER L'ACTION</button>
    </div>
  );
}

function CryptoForm({ onSave, onCancel }) {
  const [f, setF] = useState({ symbol: '', amount: '', invested: '' });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-3 gap-2">
      <input placeholder="BTC" onChange={e => setF({...f, symbol: e.target.value.toUpperCase()})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input placeholder="QTÉ" type="number" onChange={e => setF({...f, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <input placeholder="MONTANT ($)" type="number" onChange={e => setF({...f, invested: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded border border-slate-800" />
      <button onClick={() => onSave(f)} className="col-span-3 bg-emerald-600 p-2 rounded orbitron font-bold mt-2">CONFIRMER</button>
    </div>
  );
}
