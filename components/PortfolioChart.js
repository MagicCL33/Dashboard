import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function PortfolioChart({ cryptos, portfolioHistory, onUpdateHistory }) {
  const [period, setPeriod] = useState('30'); // 7, 30, 90, 'all'
  const [chartType, setChartType] = useState('area'); // 'line' ou 'area'

  // Créer un snapshot quotidien si nécessaire
  useEffect(() => {
    const checkAndCreateSnapshot = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastSnapshot = portfolioHistory[portfolioHistory.length - 1];

      // Vérifier si on a déjà un snapshot aujourd'hui
      if (lastSnapshot?.date === today) {
        return;
      }

      // Calculer la valeur totale actuelle
      const totalValue = cryptos.reduce((sum, crypto) => {
        return sum + (parseFloat(crypto.amount) * parseFloat(crypto.price));
      }, 0);

      // Créer le nouveau snapshot
      const newSnapshot = {
        date: today,
        totalValue: totalValue,
        timestamp: new Date().toISOString()
      };

      // Mettre à jour l'historique
      const updatedHistory = [...portfolioHistory, newSnapshot];
      onUpdateHistory(updatedHistory);
    };

    checkAndCreateSnapshot();

    // Vérifier toutes les heures
    const interval = setInterval(checkAndCreateSnapshot, 3600000);
    return () => clearInterval(interval);
  }, [cryptos, portfolioHistory, onUpdateHistory]);

  // Filtrer les données selon la période
  const getFilteredData = () => {
    if (!portfolioHistory || portfolioHistory.length === 0) return [];

    const now = new Date();
    let startDate;

    switch (period) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        return portfolioHistory;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return portfolioHistory.filter(snapshot => {
      const snapshotDate = new Date(snapshot.date);
      return snapshotDate >= startDate;
    });
  };

  // Calculer les statistiques
  const calculateStats = () => {
    const data = getFilteredData();
    if (data.length === 0) {
      return {
        current: 0,
        change24h: 0,
        change7d: 0,
        change30d: 0,
        percentChange24h: 0,
        percentChange7d: 0,
        percentChange30d: 0,
        highest: 0,
        lowest: 0
      };
    }

    const current = data[data.length - 1].totalValue;
    const yesterday = data.length >= 2 ? data[data.length - 2].totalValue : current;
    const week = data.length >= 7 ? data[data.length - 7].totalValue : data[0].totalValue;
    const month = data.length >= 30 ? data[data.length - 30].totalValue : data[0].totalValue;

    const change24h = current - yesterday;
    const change7d = current - week;
    const change30d = current - month;

    const values = data.map(d => d.totalValue);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);

    return {
      current,
      change24h,
      change7d,
      change30d,
      percentChange24h: yesterday !== 0 ? (change24h / yesterday) * 100 : 0,
      percentChange7d: week !== 0 ? (change7d / week) * 100 : 0,
      percentChange30d: month !== 0 ? (change30d / month) * 100 : 0,
      highest,
      lowest
    };
  };

  const stats = calculateStats();
  const chartData = getFilteredData();

  // Formater les données pour le graphique
  const formattedData = chartData.map(snapshot => ({
    date: new Date(snapshot.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    value: snapshot.totalValue,
    fullDate: snapshot.date
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-400 text-xs mb-1">{payload[0].payload.fullDate}</p>
          <p className="text-white font-bold text-lg orbitron">
            ${payload[0].value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Si pas de données
  if (chartData.length === 0) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <div className="text-slate-400 mb-4">
          <Calendar size={48} className="mx-auto mb-2 opacity-50" />
          <p className="orbitron text-lg">Aucune donnée d'historique</p>
          <p className="text-sm mt-2">Les données commenceront à être collectées dès maintenant.</p>
          <p className="text-xs mt-2">Un snapshot quotidien sera créé automatiquement chaque jour.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiques */}
      <div className="card rounded-2xl p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="orbitron text-sm text-slate-400 mb-1">VALEUR TOTALE DU PORTFOLIO</h3>
            <div className="text-4xl font-bold text-white orbitron">
              ${stats.current.toFixed(2)}
            </div>
          </div>

          {/* Boutons de période */}
          <div className="flex gap-2">
            {['7', '30', '90', 'all'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p === 'all' ? 'Tout' : `${p}j`}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques de variation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-xs mb-1">Variation 24h</div>
            <div className={`flex items-center gap-2 ${stats.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-bold">
                {stats.change24h >= 0 ? '+' : ''}{stats.change24h.toFixed(2)}$
              </span>
              <span className="text-sm">
                ({stats.percentChange24h >= 0 ? '+' : ''}{stats.percentChange24h.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-xs mb-1">Variation 7j</div>
            <div className={`flex items-center gap-2 ${stats.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.change7d >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-bold">
                {stats.change7d >= 0 ? '+' : ''}{stats.change7d.toFixed(2)}$
              </span>
              <span className="text-sm">
                ({stats.percentChange7d >= 0 ? '+' : ''}{stats.percentChange7d.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="text-slate-400 text-xs mb-1">Variation 30j</div>
            <div className={`flex items-center gap-2 ${stats.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.change30d >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="font-bold">
                {stats.change30d >= 0 ? '+' : ''}{stats.change30d.toFixed(2)}$
              </span>
              <span className="text-sm">
                ({stats.percentChange30d >= 0 ? '+' : ''}{stats.percentChange30d.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Plus haut / Plus bas */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Plus haut</div>
            <div className="text-green-400 font-bold orbitron">${stats.highest.toFixed(2)}</div>
          </div>
          <div className="bg-red-600/10 border border-red-500/20 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">Plus bas</div>
            <div className="text-red-400 font-bold orbitron">${stats.lowest.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="card rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="orbitron font-bold text-white">
            📈 Évolution ({period === 'all' ? 'Tout' : `${period} derniers jours`})
          </h3>

          {/* Sélecteur de type de graphique */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'area' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Aires
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'line' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              Ligne
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area' ? (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          ) : (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>

        <div className="text-center text-slate-500 text-xs mt-4">
          {formattedData.length} point{formattedData.length > 1 ? 's' : ''} de données • 
          Mise à jour quotidienne automatique
        </div>
      </div>
    </div>
  );
}
