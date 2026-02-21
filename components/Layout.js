import React, { useState } from 'react';
import { Menu, Wallet, Sparkles, X } from 'lucide-react';

export default function Layout({ children, activePage, onPageChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pages = [
    { id: 'crypto', name: 'Crypto Dashboard', icon: Wallet },
    { id: 'pokemon', name: 'Pokémon Collection', icon: Sparkles }
  ];

  const currentPage = pages.find(p => p.id === activePage) || pages[0];
  const CurrentIcon = currentPage.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Bouton Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-700/50 px-4 py-3 rounded-xl transition-all border border-slate-700 hover:border-indigo-500 shadow-lg"
              >
                {isMenuOpen ? <X size={20} className="text-indigo-400" /> : <Menu size={20} className="text-indigo-400" />}
                <CurrentIcon size={20} className="text-indigo-400" />
                <span className="orbitron font-bold text-sm md:text-lg tracking-wider">
                  {currentPage.name}
                </span>
              </button>

              {/* Contenu du Dropdown */}
              {isMenuOpen && (
                <>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-2">
                      {pages.map((page) => {
                        const PageIcon = page.icon;
                        const isActive = activePage === page.id;
                        
                        return (
                          <button
                            key={page.id}
                            onClick={() => {
                              onPageChange(page.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <PageIcon size={18} />
                            <span className="orbitron text-xs font-bold">{page.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Overlay invisible pour fermer en cliquant à côté */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                </>
              )}
            </div>

            {/* Titre Droite */}
            <div className="hidden sm:block text-right">
              <h1 className="orbitron text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tighter">
                MY DASHBOARD
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Zone de contenu dynamique */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
