import React, { useState } from 'react';
import { Menu, Wallet, Sparkles } from 'lucide-react';

export default function Layout({ children, activePage, onPageChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pages = [
    { id: 'crypto', name: 'Crypto Dashboard', icon: Wallet },
    { id: 'pokemon', name: 'Pokémon Collection', icon: Sparkles }
  ];

  const currentPage = pages.find(p => p.id === activePage);
  const CurrentIcon = currentPage?.icon || Wallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header with Navigation */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 px-4 py-3 rounded-xl transition-all border border-slate-700 hover:border-indigo-500"
              >
                <Menu size={20} className="text-indigo-400" />
                <CurrentIcon size={20} className="text-indigo-400" />
                <span className="orbitron font-bold text-white text-lg">
                  {currentPage?.name}
                </span>
              </button>

              {/* Dropdown Content */}
              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  {pages.map((page) => {
                    const PageIcon = page.icon;
                    const isActive = page.id === activePage;
                    
                    return (
                      <button
                        key={page.id}
                        onClick={() => {
                          onPageChange(page.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <PageIcon size={20} />
                        <span className="orbitron font-semibold">{page.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Logo/Title */}
            <div className="text-right">
              <h1 className="orbitron text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                MY DASHBOARD
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
