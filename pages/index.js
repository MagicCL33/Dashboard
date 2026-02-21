import React, { useState } from 'react';
import Layout from '../components/Layout';
import CryptoDashboard from '../components/CryptoDashboard'; // Ton composant crypto existant
import PokemonCollection from '../components/PokemonCollectionContent'; // On va renommer ton code pokemon

export default function Home() {
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
