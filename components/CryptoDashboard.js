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

  const fetchPricesFromCoinGecko
