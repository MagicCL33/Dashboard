import React, { useState } from 'react';
import { Menu, Wallet, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const pages = [
    { id: 'crypto', name: 'Crypto Dashboard', icon: Wallet, path: '/' },
    { id: 'pokemon', name: 'Pokémon Collection', icon: Sparkles, path: '/pokemon-collection' }
  ];

  const currentPage = pages.find(p => p.path === router.pathname) || pages[0];
  const CurrentIcon = currentPage?.icon || Wallet;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
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
                <span className="orbitron font-bold text-white text-lg lowercase first-letter:uppercase">
                  {currentPage?.name}
                </span>
              </button>

              {isMenuOpen && (
                <>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    {pages.map((page) => {
                      const PageIcon = page.icon;
                      const isActive = router.pathname === page.path;
                      
                      return (
                        <Link key={page.id} href={page.path} shadow-none>
                          {/* Note: Dans Next.js 14, on n'a plus besoin de la balise <a> dans <Link> */}
                          <div
                            onClick={() => setIsMenuOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer ${
                              isActive
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <PageIcon size={20} />
                            <span className="orbitron font-semibold">{page.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {/* Overlay pour fermer le menu en cliquant ailleurs */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                </>
              )}
            </div>

            <div className="text-right">
              <h1 className="orbitron text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                MY DASHBOARD
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
