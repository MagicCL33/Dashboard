import React, { useState, useEffect } from 'react';
import { Wallet, Droplet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity } from 'lucide-react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (typeof window !== 'undefined' && window.storage) {
        const cryptoData = await window.storage.get('cryptos');
        const airdropData = await window.storage.get('airdrops');
        const historyData = await window.storage.get('portfolio-history');
        
        if (cryptoData?.value) setCryptos(JSON.parse(cryptoData.value));
        if (airdropData?.value) setAirdrops(JSON.parse(airdropData.value));
        if (historyData?.value) setPortfolioHistory(JSON.parse(historyData.value));
      } else if (typeof window !== 'undefined' && localStorage) {
        const cryptoData = localStorage.getItem('cryptos');
        const airdropData = localStorage.getItem('airdrops');
        const historyData = localStorage.getItem('portfolio-history');
        
        if (cryptoData) setCryptos(JSON.parse(cryptoData));
        if (airdropData) setAirdrops(JSON.parse(airdropData));
        if (historyData) setPortfolioHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.log('Initialisation des données', error);
    }
  };

  const saveCryptos = async (newCryptos) => {
    setCryptos(newCryptos);
    try {
      if (typeof window !== 'undefined' && window.storage) await window.storage.set('cryptos', JSON.stringify(newCryptos));
      if (typeof window !== 'undefined' && localStorage) localStorage.setItem('cryptos', JSON.stringify(newCryptos));
    } catch (error) { console.error(error); }
  };

  const saveAirdrops = async (newAirdrops) => {
    setAirdrops(newAirdrops);
    try {
      if (typeof window !== 'undefined' && window.storage) await window.storage.set('airdrops', JSON.stringify(newAirdrops));
      if (typeof window !== 'undefined' && localStorage) localStorage.setItem('airdrops', JSON.stringify(newAirdrops));
    } catch (error) { console.error(error); }
  };

  const savePortfolioHistory = async (newHistory) => {
    setPortfolioHistory(newHistory);
    try {
      if (typeof window !== 'undefined' && window.storage) await window.storage.set('portfolio-history', JSON.stringify(newHistory));
      if (typeof window !== 'undefined' && localStorage) localStorage.setItem('portfolio-history', JSON.stringify(newHistory));
    } catch (error) { console.error(error); }
  };

  const addCrypto = async (crypto) => {
    const newCrypto = { id: Date.now(), ...crypto, addedDate: new Date().toISOString() };
    await saveCryptos([...cryptos, newCrypto]);
    setShowAddCrypto(false);
  };

  const updateCrypto = async (id, updates) => {
    await saveCryptos(cryptos.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingCrypto(null);
  };

  const deleteCrypto = async (id) => {
    await saveCryptos(cryptos.filter(c => c.id !== id));
  };

  const addAirdrop = async (airdrop) => {
    const existingAirdrop = airdrops.find(a => a.project.toLowerCase() === airdrop.project.toLowerCase());
    const actionAmount = parseFloat(airdrop.profitLoss) || 0;
    
    const newAction = {
      id: Date.now(),
      description: airdrop.actions,
      date: airdrop.date,
      wallet: airdrop.wallet,
      profitLoss: airdrop.type === 'expense' ? -Math.abs(actionAmount) : Math.abs(actionAmount),
      type: airdrop.type || 'expense',
      timestamp: new Date().toISOString()
    };

    if (existingAirdrop) {
      const updatedAirdrops = airdrops.map(a => {
        if (a.id === existingAirdrop.id) {
          return {
            ...a,
            actionsList: [...(a.actionsList || []), newAction],
            tasksCompleted: a.tasksCompleted + 1
          };
        }
        return a;
      });
      await saveAirdrops(updatedAirdrops);
    } else {
      const newAirdrop = {
        id: Date.now(),
        project: airdrop.project,
        status: airdrop.status,
        tasksCompleted: 1,
        tasksTotal: airdrop.tasksTotal,
        actionsList: [newAction],
        createdDate: new Date().toISOString()
      };
      await saveAirdrops([...airdrops, newAirdrop]);
    }
    setShowAddAirdrop(false);
  };

  const updateAirdrop = async (id, updates) => {
    await saveAirdrops(airdrops.map(a => a.id === id ? { ...a, ...updates } : a));
    setEditingAirdrop(null);
  };

  const deleteAction = async (airdropId, actionId) => {
    const updatedAirdrops = airdrops.map(a => {
      if (a.id === airdropId) {
        const newActionsList = a.actionsList.filter(action => action.id !== actionId);
        return { ...a, actionsList: newActionsList, tasksCompleted: Math.max(0, a.tasksCompleted - 1) };
      }
      return a;
    });
    await saveAirdrops(updatedAirdrops);
  };

  const deleteAirdrop = async (id) => {
    await saveAirdrops(airdrops.filter(a => a.id !== id));
  };

  const calculateAirdropBalance = (airdrop) => {
    if (!airdrop.actionsList || airdrop.actionsList.length === 0) return { total: 0, expenses: 0, income: 0 };
    const expenses = airdrop.actionsList.filter(a => a.profitLoss < 0).reduce((sum, a) => sum + Math.abs(a.profitLoss), 0);
    const income = airdrop.actionsList.filter(a => a.profitLoss > 0).reduce((sum, a) => sum + a.profitLoss, 0);
    return { total: income - expenses, expenses, income };
  };

  const scanWallet = async () => {
    if (!walletAddress || walletAddress.length < 10) {
      setScanError('Adresse de wallet invalide');
      return;
    }
    setIsScanning(true);
    setScanError(null);
    try {
      const tokens = await fetchWalletBalances(walletAddress);
      if (tokens.length === 0) {
        setScanError('Aucun token trouvé');
        setIsScanning(false);
        return;
      }
      const newCryptos = tokens.map(token => ({
        id: Date.now() + Math.random(),
        name: token.name,
        symbol: token.symbol,
        amount: token.balance,
        price: token.price,
        invested: 0,
        notes: `Importé de ${walletAddress.slice(0, 6)}...`,
        addedDate: new Date().toISOString()
      }));
      await saveCryptos([...cryptos, ...newCryptos]);
      setWalletAddress('');
    } catch (error) {
      setScanError('Erreur lors du scan');
    } finally {
      setIsScanning(false);
    }
  };

  const fetchWalletBalances = async (address) => {
    const allTokens = [];
    try {
      const eth = await fetchChainBalance(address, 'etherscan', 'ethereum');
      if (eth) allTokens.push(...eth);
    } catch (e) { console.error(e); }
    return allTokens;
  };

  const fetchChainBalance = async (address, apiType, chainName) => {
    // Logique simplifiée pour l'exemple
    return [];
  };

  const totalValue = cryptos.reduce((sum, c) => sum + (c.amount * c.price), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + c.invested, 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:wght@400;700&display=swap');
        * { font-family: 'Space Mono', monospace; }
        .orbitron { font-family: 'Orbitron', sans-serif; }
        .card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(99, 102, 241, 0.2); transition: all 0.3s ease; }
        .progress-bar { height: 4px; background: rgba(99, 102, 241, 0.2); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="orbitron text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">
            CRYPTO TRACKER
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              <Wallet className="text-indigo-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">TOTAL VALUE</span>
            </div>
            <div className="orbitron text-3xl font-bold text-white">${totalValue.toLocaleString()}</div>
          </div>
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              {totalPnL >= 0 ? <TrendingUp className="text-green-400" size={24} /> : <TrendingDown className="text-red-400" size={24} />}
              <span className="text-xs text-slate-500 orbitron">P&L</span>
            </div>
            <div className={`orbitron text-3xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()}$
            </div>
          </div>
          <div className="card rounded-2xl p-6">
            <div className="flex justify-between mb-2">
              <Activity className="text-purple-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">AIRDROPS</span>
            </div>
            <div className="orbitron text-3xl font-bold text-white">{airdrops.length}</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('portfolio')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>PORTFOLIO</button>
          <button onClick={() => setActiveTab('airdrops')} className={`orbitron px-6 py-3 rounded-xl font-bold ${activeTab === 'airdrops' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>AIRDROPS</button>
        </div>

        {activeTab === 'portfolio' && (
          <div>
            <div className="card rounded-2xl p-6 mb-6">
              <h3 className="orbitron text-xl font-bold text-white mb-4 flex items-center gap-2"><Wallet size={24}/> Scanner Wallet</h3>
              <PortfolioChart cryptos={cryptos} portfolioHistory={portfolioHistory} onUpdateHistory={savePortfolioHistory} />
              <div className="flex gap-2 mt-4">
                <input type="text" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} placeholder="0x..." className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                <button onClick={scanWallet} className="bg-indigo-600 px-6 py-2 rounded-lg text-white orbitron font-bold">SCANNER</button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Mes Cryptos</h2>
              <button onClick={() => setShowAddCrypto(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ AJOUTER</button>
            </div>
            {showAddCrypto && <CryptoForm onSave={addCrypto} onCancel={() => setShowAddCrypto(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {cryptos.map(c => <CryptoCard key={c.id} crypto={c} isEditing={editingCrypto === c.id} onEdit={() => setEditingCrypto(c.id)} onSave={(u) => updateCrypto(c.id, u)} onCancel={() => setEditingCrypto(null)} onDelete={() => deleteCrypto(c.id)} />)}
            </div>
          </div>
        )}

        {activeTab === 'airdrops' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Farming Airdrops</h2>
              <button onClick={() => setShowAddAirdrop(true)} className="bg-indigo-600 px-4 py-2 rounded-lg text-white orbitron font-bold text-sm">+ AJOUTER ACTION</button>
            </div>
            {showAddAirdrop && <AirdropForm onSave={addAirdrop} onCancel={() => setShowAddAirdrop(false)} />}
            <div className="grid grid-cols-1 gap-4">
              {airdrops.map(a => (
                <AirdropCard 
                  key={a.id} 
                  airdrop={a} 
                  isEditing={editingAirdrop === a.id} 
                  onEdit={() => setEditingAirdrop(a.id)} 
                  onSave={(u) => updateAirdrop(a.id, u)} 
                  onCancel={() => setEditingAirdrop(null)} 
                  onDelete={() => deleteAirdrop(a.id)} 
                  onDeleteAction={(aid) => deleteAction(a.id, aid)}
                  calculateBalance={calculateAirdropBalance}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function CryptoCard({ crypto, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState(crypto);
  const val = crypto.amount * crypto.price;
  const pnl = val - crypto.invested;

  if (isEditing) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="p-2 bg-slate-900 rounded" />
          <input value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} className="p-2 bg-slate-900 rounded" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={() => onSave(formData)} className="bg-green-600 p-2 rounded text-white"><Save size={16}/></button>
          <button onClick={onCancel} className="bg-slate-600 p-2 rounded text-white"><X size={16}/></button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="orbitron text-xl font-bold text-white">{crypto.name} <span className="text-indigo-400 text-sm">({crypto.symbol})</span></h3>
          <p className="text-slate-400 text-sm">{crypto.amount} @ ${crypto.price}</p>
        </div>
        <div className="text-right">
          <div className="orbitron font-bold text-white">${val.toLocaleString()}</div>
          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}$</div>
        </div>
        <div className="flex gap-2 ml-4">
          <button onClick={onEdit} className="p-2 bg-slate-800 rounded"><Edit2 size={14}/></button>
          <button onClick={onDelete} className="p-2 bg-red-900/30 rounded text-red-400"><Trash2 size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function CryptoForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({ name: '', symbol: '', amount: 0, price: 0, invested: 0, notes: '' });
  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-2 gap-4">
      <input placeholder="Nom" onChange={e => setFormData({...formData, name: e.target.value})} className="p-2 bg-slate-900 rounded text-white" />
      <input placeholder="Symbole" onChange={e => setFormData({...formData, symbol: e.target.value})} className="p-2 bg-slate-900 rounded text-white" />
      <input type="number" placeholder="Quantité" onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white" />
      <input type="number" placeholder="Prix" onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="p-2 bg-slate-900 rounded text-white" />
      <div className="col-span-2 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-green-600 px-4 py-2 rounded text-white orbitron font-bold">SAUVEGARDER</button>
        <button onClick={onCancel} className="bg-slate-700 px-4 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}

function AirdropCard({ airdrop, isEditing, onEdit, onSave, onCancel, onDelete, onDeleteAction, calculateBalance }) {
  const completionPercent = airdrop.tasksTotal > 0 ? (airdrop.tasksCompleted / airdrop.tasksTotal) * 100 : 0;
  const balance = calculateBalance(airdrop);

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="orbitron text-2xl font-bold text-white">{airdrop.project}</h3>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 bg-slate-800 rounded"><Edit2 size={16}/></button>
          <button onClick={onDelete} className="p-2 bg-red-900/20 text-red-400 rounded"><Trash2 size={16}/></button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-slate-800/50 rounded-lg">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><div className="text-xs text-slate-500">INVESTI</div><div className="text-red-400">-${balance.expenses.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-500">REÇU</div><div className="text-green-400">+${balance.income.toFixed(2)}</div></div>
          <div><div className="text-xs text-slate-500">TOTAL</div><div className={balance.total >= 0 ? 'text-green-400' : 'text-red-400'}>{balance.total.toFixed(2)}$</div></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs orbitron text-slate-400 mb-1">
          <span>PROGRESSION</span>
          <span>{airdrop.tasksCompleted} / {airdrop.tasksTotal}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionPercent}%` }} /></div>
      </div>

      {airdrop.actionsList?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 orbitron border-b border-slate-800">
              <tr>
                <th className="p-2">DATE</th>
                <th className="p-2">DESCRIPTION</th>
                <th className="p-2 text-right">MONTANT</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {airdrop.actionsList.map(action => (
                <tr key={action.id} className="border-b border-slate-800/50">
                  <td className="p-2 text-slate-400">{action.date}</td>
                  <td className="p-2 text-white">{action.description}</td>
                  <td className={`p-2 text-right font-bold ${action.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {action.profitLoss >= 0 ? '+' : ''}{action.profitLoss.toFixed(2)}$
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => onDeleteAction(action.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AirdropForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    project: '',
    status: 'En cours',
    tasksTotal: 10,
    date: new Date().toISOString().split('T')[0],
    wallet: '',
    actions: '',
    profitLoss: '',
    type: 'expense'
  });

  return (
    <div className="card rounded-2xl p-6 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input placeholder="Projet" value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="p-2 bg-slate-900 rounded text-white" />
      <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="p-2 bg-slate-900 rounded text-white" />
      <textarea placeholder="Description de l'action" value={formData.actions} onChange={e => setFormData({...formData, actions: e.target.value})} className="md:col-span-2 p-2 bg-slate-900 rounded text-white" />
      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="p-2 bg-slate-900 rounded text-white">
        <option value="expense">Frais (Dépense)</option>
        <option value="income">Gain (Profit)</option>
      </select>
      <input type="number" placeholder="Montant $" value={formData.profitLoss} onChange={e => setFormData({...formData, profitLoss: e.target.value})} className="p-2 bg-slate-900 rounded text-white" />
      <div className="md:col-span-2 flex gap-2">
        <button onClick={() => onSave(formData)} className="bg-green-600 px-4 py-2 rounded text-white orbitron font-bold">SAUVEGARDER</button>
        <button onClick={onCancel} className="bg-slate-700 px-4 py-2 rounded text-white orbitron font-bold">ANNULER</button>
      </div>
    </div>
  );
}
