import React, { useState, useEffect } from 'react';
import { Wallet, Droplet, TrendingUp, TrendingDown, Plus, Edit2, Trash2, Save, X, Activity } from 'lucide-react';

export default function CryptoDashboard() {
  const [cryptos, setCryptos] = useState([]);
  const [airdrops, setAirdrops] = useState([]);
  const [editingCrypto, setEditingCrypto] = useState(null);
  const [editingAirdrop, setEditingAirdrop] = useState(null);
  const [showAddCrypto, setShowAddCrypto] = useState(false);
  const [showAddAirdrop, setShowAddAirdrop] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [walletAddress, setWalletAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Load data from persistent storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cryptoData = await window.storage.get('cryptos');
      const airdropData = await window.storage.get('airdrops');
      
      if (cryptoData?.value) {
        setCryptos(JSON.parse(cryptoData.value));
      }
      if (airdropData?.value) {
        setAirdrops(JSON.parse(airdropData.value));
      }
    } catch (error) {
      console.log('Initialisation des données', error);
    }
  };

  const saveCryptos = async (newCryptos) => {
    setCryptos(newCryptos);
    await window.storage.set('cryptos', JSON.stringify(newCryptos));
  };

  const saveAirdrops = async (newAirdrops) => {
    setAirdrops(newAirdrops);
    await window.storage.set('airdrops', JSON.stringify(newAirdrops));
  };

  const addCrypto = async (crypto) => {
    const newCrypto = {
      id: Date.now(),
      ...crypto,
      addedDate: new Date().toISOString()
    };
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
    // Vérifier si le projet existe déjà
    const existingAirdrop = airdrops.find(a => a.project.toLowerCase() === airdrop.project.toLowerCase());
    
    if (existingAirdrop) {
      // Ajouter l'action au projet existant
      const newAction = {
        id: Date.now(),
        description: airdrop.actions,
        date: airdrop.date,
        wallet: airdrop.wallet,
        timestamp: new Date().toISOString()
      };
      
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
      // Créer un nouveau projet
      const newAirdrop = {
        id: Date.now(),
        project: airdrop.project,
        status: airdrop.status,
        tasksCompleted: 1,
        tasksTotal: airdrop.tasksTotal,
        actionsList: [{
          id: Date.now(),
          description: airdrop.actions,
          date: airdrop.date,
          wallet: airdrop.wallet,
          timestamp: new Date().toISOString()
        }],
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
        return {
          ...a,
          actionsList: newActionsList,
          tasksCompleted: Math.max(0, a.tasksCompleted - 1)
        };
      }
      return a;
    });
    await saveAirdrops(updatedAirdrops);
  };

  const deleteAirdrop = async (id) => {
    await saveAirdrops(airdrops.filter(a => a.id !== id));
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
        setScanError('Aucun token trouvé ou erreur de connexion aux APIs');
        setIsScanning(false);
        return;
      }

      // Ajouter les tokens trouvés au portfolio
      const newCryptos = tokens.map(token => ({
        id: Date.now() + Math.random(),
        name: token.name,
        symbol: token.symbol,
        amount: token.balance,
        price: token.price,
        invested: 0, // À remplir manuellement
        notes: `Importé depuis ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        addedDate: new Date().toISOString()
      }));

      await saveCryptos([...cryptos, ...newCryptos]);
      setWalletAddress('');
      alert(`${tokens.length} cryptos importées avec succès !`);
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setScanError('Erreur lors du scan du wallet. Vérifiez l\'adresse et réessayez.');
    } finally {
      setIsScanning(false);
    }
  };

  // Fonction pour récupérer les balances depuis différentes blockchains
  const fetchWalletBalances = async (address) => {
    const allTokens = [];

    try {
      // 1. Ethereum Mainnet - Via Etherscan API
      const ethBalance = await fetchEthereumBalance(address);
      if (ethBalance) allTokens.push(...ethBalance);

      // 2. BSC - Via BscScan API
      const bscBalance = await fetchBSCBalance(address);
      if (bscBalance) allTokens.push(...bscBalance);

      // 3. Polygon - Via PolygonScan API
      const polygonBalance = await fetchPolygonBalance(address);
      if (polygonBalance) allTokens.push(...polygonBalance);

      // Note: Pour production, ajoutez vos clés API dans les variables d'environnement
      // NEXT_PUBLIC_ETHERSCAN_API_KEY, NEXT_PUBLIC_BSCSCAN_API_KEY, etc.

    } catch (error) {
      console.error('Erreur fetchWalletBalances:', error);
    }

    return allTokens;
  };

  const fetchEthereumBalance = async (address) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';
      
      // Récupérer le balance ETH natif
      const ethResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      );
      const ethData = await ethResponse.json();

      // Récupérer les prix actuels via CoinGecko
      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      const priceData = await priceResponse.json();

      const tokens = [];

      if (ethData.status === '1' && parseFloat(ethData.result) > 0) {
        tokens.push({
          name: 'Ethereum',
          symbol: 'ETH',
          balance: parseFloat(ethData.result) / 1e18,
          price: priceData.ethereum?.usd || 0
        });
      }

      // Récupérer les tokens ERC-20
      const tokenResponse = await fetch(
        `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`
      );
      const tokenData = await tokenResponse.json();

      if (tokenData.status === '1' && tokenData.result) {
        // Grouper par token pour obtenir les balances
        const tokenMap = new Map();
        
        tokenData.result.forEach(tx => {
          const symbol = tx.tokenSymbol;
          const name = tx.tokenName;
          const contractAddress = tx.contractAddress;
          
          if (!tokenMap.has(contractAddress)) {
            tokenMap.set(contractAddress, { name, symbol, contractAddress });
          }
        });

        // Pour chaque token unique, récupérer la balance actuelle
        for (const [contractAddress, tokenInfo] of tokenMap) {
          try {
            const balanceResponse = await fetch(
              `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${apiKey}`
            );
            const balanceData = await balanceResponse.json();

            if (balanceData.status === '1' && parseFloat(balanceData.result) > 0) {
              // Récupérer le prix depuis CoinGecko si possible
              let price = 0;
              try {
                const tokenPriceResponse = await fetch(
                  `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd`
                );
                const tokenPriceData = await tokenPriceResponse.json();
                price = tokenPriceData[contractAddress.toLowerCase()]?.usd || 0;
              } catch (e) {
                console.log('Prix non disponible pour', tokenInfo.symbol);
              }

              tokens.push({
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                balance: parseFloat(balanceData.result) / 1e18,
                price: price
              });
            }
          } catch (e) {
            console.error('Erreur récupération balance token:', e);
          }
        }
      }

      return tokens;
    } catch (error) {
      console.error('Erreur Ethereum:', error);
      return [];
    }
  };

  const fetchBSCBalance = async (address) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || 'YourApiKeyToken';
      
      const response = await fetch(
        `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey}`
      );
      const data = await response.json();

      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd'
      );
      const priceData = await priceResponse.json();

      const tokens = [];

      if (data.status === '1' && parseFloat(data.result) > 0) {
        tokens.push({
          name: 'BNB',
          symbol: 'BNB',
          balance: parseFloat(data.result) / 1e18,
          price: priceData.binancecoin?.usd || 0
        });
      }

      return tokens;
    } catch (error) {
      console.error('Erreur BSC:', error);
      return [];
    }
  };

  const fetchPolygonBalance = async (address) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || 'YourApiKeyToken';
      
      const response = await fetch(
        `https://api.polygonscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey}`
      );
      const data = await response.json();

      const priceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
      );
      const priceData = await priceResponse.json();

      const tokens = [];

      if (data.status === '1' && parseFloat(data.result) > 0) {
        tokens.push({
          name: 'Polygon',
          symbol: 'MATIC',
          balance: parseFloat(data.result) / 1e18,
          price: priceData['matic-network']?.usd || 0
        });
      }

      return tokens;
    } catch (error) {
      console.error('Erreur Polygon:', error);
      return [];
    }
  };

  const totalValue = cryptos.reduce((sum, c) => sum + (c.amount * c.price), 0);
  const totalInvested = cryptos.reduce((sum, c) => sum + c.invested, 0);
  const totalPnL = totalValue - totalInvested;
  const pnlPercent = totalInvested > 0 ? ((totalPnL / totalInvested) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Space+Mono:wght@400;700&display=swap');
        
        * {
          font-family: 'Space Mono', monospace;
        }
        
        .orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .card {
          animation: slideIn 0.5s ease-out;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
        
        .glow-button {
          animation: glow 2s infinite;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }
        
        .stat-card {
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
          animation: shimmer 3s infinite;
        }
        
        input, textarea, select {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #e2e8f0;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.6);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .progress-bar {
          height: 4px;
          background: rgba(99, 102, 241, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 8px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.3s ease;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="orbitron text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            CRYPTO TRACKER
          </h1>
          <p className="text-slate-400 text-sm tracking-widest">PORTFOLIO & AIRDROP FARMING</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card stat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="text-indigo-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">TOTAL VALUE</span>
            </div>
            <div className="orbitron text-3xl font-bold text-white mb-1">
              ${totalValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-slate-400">
              Investi: ${totalInvested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="card stat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="text-green-400" size={24} />
              ) : (
                <TrendingDown className="text-red-400" size={24} />
              )}
              <span className="text-xs text-slate-500 orbitron">P&L</span>
            </div>
            <div className={`orbitron text-3xl font-bold mb-1 ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$
            </div>
            <div className={`text-sm ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
            </div>
          </div>

          <div className="card stat-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-purple-400" size={24} />
              <span className="text-xs text-slate-500 orbitron">AIRDROPS</span>
            </div>
            <div className="orbitron text-3xl font-bold text-white mb-1">
              {airdrops.length}
            </div>
            <div className="text-sm text-slate-400">
              Actifs: {airdrops.filter(a => a.status === 'En cours').length}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white glow-button'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            PORTFOLIO
          </button>
          <button
            onClick={() => setActiveTab('airdrops')}
            className={`orbitron px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'airdrops'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white glow-button'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            AIRDROPS
          </button>
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div>
            {/* Wallet Scanner */}
            <div className="card rounded-2xl p-6 mb-6">
              <h3 className="orbitron text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Wallet size={24} className="text-indigo-400" />
                Scanner un Wallet
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Entrez l'adresse de votre wallet pour importer automatiquement vos cryptos (Ethereum, BSC, Polygon)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg font-mono text-sm"
                  disabled={isScanning}
                />
                <button
                  onClick={scanWallet}
                  disabled={isScanning}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all orbitron font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      SCAN...
                    </>
                  ) : (
                    <>
                      <Activity size={20} />
                      SCANNER
                    </>
                  )}
                </button>
              </div>
              {scanError && (
                <div className="mt-3 p-3 bg-red-600/20 border border-red-600/30 rounded-lg text-red-400 text-sm">
                  {scanError}
                </div>
              )}
              {isScanning && (
                <div className="mt-3 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg text-blue-400 text-sm">
                  Scan en cours... Récupération des données depuis Ethereum, BSC et Polygon...
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Mes Cryptos</h2>
              <button
                onClick={() => setShowAddCrypto(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all orbitron font-bold"
              >
                <Plus size={20} /> AJOUTER MANUELLEMENT
              </button>
            </div>

            {showAddCrypto && (
              <CryptoForm
                onSave={addCrypto}
                onCancel={() => setShowAddCrypto(false)}
              />
            )}

            <div className="grid grid-cols-1 gap-4">
              {cryptos.map(crypto => (
                <CryptoCard
                  key={crypto.id}
                  crypto={crypto}
                  isEditing={editingCrypto === crypto.id}
                  onEdit={() => setEditingCrypto(crypto.id)}
                  onSave={(updates) => updateCrypto(crypto.id, updates)}
                  onCancel={() => setEditingCrypto(null)}
                  onDelete={() => deleteCrypto(crypto.id)}
                />
              ))}
            </div>

            {cryptos.length === 0 && !showAddCrypto && (
              <div className="card rounded-2xl p-12 text-center">
                <Wallet className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400 orbitron">Aucune crypto ajoutée</p>
              </div>
            )}
          </div>
        )}

        {/* Airdrops Tab */}
        {activeTab === 'airdrops' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="orbitron text-2xl font-bold text-white">Farming Airdrops</h2>
              <button
                onClick={() => setShowAddAirdrop(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all orbitron font-bold"
              >
                <Plus size={20} /> AJOUTER
              </button>
            </div>

            {showAddAirdrop && (
              <AirdropForm
                onSave={addAirdrop}
                onCancel={() => setShowAddAirdrop(false)}
              />
            )}

            <div className="grid grid-cols-1 gap-4">
              {airdrops.map(airdrop => (
                <AirdropCard
                  key={airdrop.id}
                  airdrop={airdrop}
                  isEditing={editingAirdrop === airdrop.id}
                  onEdit={() => setEditingAirdrop(airdrop.id)}
                  onSave={(updates) => updateAirdrop(airdrop.id, updates)}
                  onCancel={() => setEditingAirdrop(null)}
                  onDelete={() => deleteAirdrop(airdrop.id)}
                  onDeleteAction={(actionId) => deleteAction(airdrop.id, actionId)}
                />
              ))}
            </div>

            {airdrops.length === 0 && !showAddAirdrop && (
              <div className="card rounded-2xl p-12 text-center">
                <Droplet className="mx-auto mb-4 text-slate-600" size={48} />
                <p className="text-slate-400 orbitron">Aucun airdrop en farming</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CryptoCard({ crypto, isEditing, onEdit, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState(crypto);
  
  const value = crypto.amount * crypto.price;
  const pnl = value - crypto.invested;
  const pnlPercent = crypto.invested > 0 ? ((pnl / crypto.invested) * 100) : 0;

  if (isEditing) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom (ex: Bitcoin)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="px-4 py-2 rounded-lg"
          />
          <input
            type="text"
            placeholder="Symbole (ex: BTC)"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            className="px-4 py-2 rounded-lg"
          />
          <input
            type="number"
            step="0.00000001"
            placeholder="Quantité"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 rounded-lg"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Prix actuel ($)"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 rounded-lg"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Montant investi ($)"
            value={formData.invested}
            onChange={(e) => setFormData({ ...formData, invested: parseFloat(e.target.value) || 0 })}
            className="px-4 py-2 rounded-lg"
          />
          <textarea
            placeholder="Notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="px-4 py-2 rounded-lg md:col-span-2"
            rows="2"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all orbitron font-bold"
          >
            <Save size={16} /> SAUVEGARDER
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all orbitron font-bold"
          >
            <X size={16} /> ANNULER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="orbitron text-2xl font-bold text-white">{crypto.name}</h3>
            <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-xs orbitron font-bold">
              {crypto.symbol}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            {crypto.amount} × ${crypto.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 orbitron">VALEUR</div>
          <div className="orbitron text-xl font-bold text-white">
            ${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1 orbitron">INVESTI</div>
          <div className="orbitron text-xl font-bold text-slate-300">
            ${crypto.invested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1 orbitron">P&L</div>
          <div className={`orbitron text-xl font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{pnl.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$
          </div>
          <div className={`text-xs ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {crypto.notes && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
          <div className="text-xs text-slate-500 mb-1 orbitron">NOTES</div>
          <div className="text-sm text-slate-300">{crypto.notes}</div>
        </div>
      )}
    </div>
  );
}

function CryptoForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    amount: 0,
    price: 0,
    invested: 0,
    notes: ''
  });

  return (
    <div className="card rounded-2xl p-6 mb-4">
      <h3 className="orbitron text-xl font-bold text-white mb-4">Ajouter une Crypto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nom (ex: Bitcoin)"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Symbole (ex: BTC)"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="number"
          step="0.00000001"
          placeholder="Quantité"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Prix actuel ($)"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Montant investi ($)"
          value={formData.invested}
          onChange={(e) => setFormData({ ...formData, invested: parseFloat(e.target.value) || 0 })}
          className="px-4 py-2 rounded-lg md:col-span-2"
        />
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="px-4 py-2 rounded-lg md:col-span-2"
          rows="2"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSave(formData)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all orbitron font-bold"
        >
          <Save size={16} /> SAUVEGARDER
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all orbitron font-bold"
        >
          <X size={16} /> ANNULER
        </button>
      </div>
    </div>
  );
}

function AirdropCard({ airdrop, isEditing, onEdit, onSave, onCancel, onDelete, onDeleteAction }) {
  const [formData, setFormData] = useState(airdrop);

  const completionPercent = airdrop.tasksTotal > 0 ? (airdrop.tasksCompleted / airdrop.tasksTotal) * 100 : 0;

  if (isEditing) {
    return (
      <div className="card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom du projet"
            value={formData.project}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            className="px-4 py-2 rounded-lg"
          />
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="px-4 py-2 rounded-lg"
          >
            <option>En cours</option>
            <option>Terminé</option>
            <option>En attente</option>
          </select>
          <input
            type="number"
            placeholder="Total tâches"
            value={formData.tasksTotal}
            onChange={(e) => setFormData({ ...formData, tasksTotal: parseInt(e.target.value) || 0 })}
            className="px-4 py-2 rounded-lg md:col-span-2"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(formData)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all orbitron font-bold"
          >
            <Save size={16} /> SAUVEGARDER
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all orbitron font-bold"
          >
            <X size={16} /> ANNULER
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    'En cours': 'bg-blue-600/30 text-blue-300',
    'Terminé': 'bg-green-600/30 text-green-300',
    'En attente': 'bg-yellow-600/30 text-yellow-300'
  };

  return (
    <div className="card rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="orbitron text-2xl font-bold text-white">{airdrop.project}</h3>
            <span className={`px-3 py-1 rounded-full text-xs orbitron font-bold ${statusColors[airdrop.status]}`}>
              {airdrop.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-1 orbitron">PROGRESSION</div>
        <div className="orbitron text-xl font-bold text-white">
          {airdrop.tasksCompleted} / {airdrop.tasksTotal}
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      {airdrop.actionsList && airdrop.actionsList.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-3 orbitron">ACTIONS EFFECTUÉES</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 orbitron text-xs">DATE</th>
                  <th className="text-left py-2 px-3 text-slate-400 orbitron text-xs">WALLET</th>
                  <th className="text-left py-2 px-3 text-slate-400 orbitron text-xs">DESCRIPTION</th>
                  <th className="text-right py-2 px-3 text-slate-400 orbitron text-xs">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {airdrop.actionsList.map((action, index) => (
                  <tr key={action.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-300">{action.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded text-xs font-mono">
                        {action.wallet}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{action.description}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteAction(action.id)}
                        className="p-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    actions: ''
  });

  return (
    <div className="card rounded-2xl p-6 mb-4">
      <h3 className="orbitron text-xl font-bold text-white mb-4">Ajouter une Action</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nom du projet"
          value={formData.project}
          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
          className="px-4 py-2 rounded-lg"
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="px-4 py-2 rounded-lg"
        >
          <option>En cours</option>
          <option>Terminé</option>
          <option>En attente</option>
        </select>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Wallet (ex: 0x1234...abcd)"
          value={formData.wallet}
          onChange={(e) => setFormData({ ...formData, wallet: e.target.value })}
          className="px-4 py-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Total tâches à effectuer"
          value={formData.tasksTotal}
          onChange={(e) => setFormData({ ...formData, tasksTotal: parseInt(e.target.value) || 0 })}
          className="px-4 py-2 rounded-lg md:col-span-2"
        />
        <textarea
          placeholder="Description de l'action effectuée"
          value={formData.actions}
          onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
          className="px-4 py-2 rounded-lg md:col-span-2"
          rows="3"
        />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onSave(formData)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all orbitron font-bold"
        >
          <Save size={16} /> SAUVEGARDER
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all orbitron font-bold"
        >
          <X size={16} /> ANNULER
        </button>
      </div>
    </div>
  );
}