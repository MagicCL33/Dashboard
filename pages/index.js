import React, { useState } from 'react';
import Layout from '../components/Layout';
import CryptoDashboard from '../components/CryptoDashboard';
import PokemonCollection from '../components/PokemonCollection';

export default function Home() {
  // Par défaut, on affiche la crypto
  const [activePage, setActivePage] = useState('crypto');

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {activePage === 'crypto' ? (
        <CryptoDashboard />
      ) : (
        <PokemonCollection />
      )}
    </Layout>
  );
}
