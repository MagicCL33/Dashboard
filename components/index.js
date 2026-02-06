import { useState } from 'react';
import Layout from '../components/Layout';
import CryptoDashboard from '../components/CryptoDashboard';
import PokemonDashboard from '../components/PokemonDashboard';

export default function Home() {
  const [activePage, setActivePage] = useState('crypto');

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {activePage === 'crypto' && <CryptoDashboard />}
      {activePage === 'pokemon' && <PokemonDashboard />}
    </Layout>
  );
}
