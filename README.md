# Mon Dashboard Multi-Fonctions

Dashboard moderne avec deux sections principales :
- **Crypto Dashboard** : Gestion de portfolio crypto et airdrops
- **Pokémon Collection** : Gestion de collection de cartes Pokémon

## 🚀 Fonctionnalités

### Dashboard Crypto
- Gestion de portefeuille crypto
- Suivi des airdrops
- Scan de wallet automatique (Ethereum, BSC, Polygon)
- Stockage persistant des données

### Dashboard Pokémon
- ✨ **Recherche automatique** de cartes via l'API Pokémon TCG
- 📸 Affichage des images de cartes en haute qualité
- 💰 Prix estimés (intégration CardMarket à venir)
- 🏷️ Statuts : "Je veux" / "Je possède"
- ⭐ Système de priorités (1-3)
- 🌍 Support multi-langues (FR, EN, JP, DE, ES, IT)
- 📊 Statistiques de collection
- 🔍 Filtres par statut et priorité
- ✏️ Ajout manuel ou automatique de cartes

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
npm start
```

## 🌐 Déploiement sur Vercel

1. **Connectez votre repository GitHub** à Vercel
2. Vercel détectera automatiquement Next.js
3. **Ajoutez les variables d'environnement** (optionnel) :
   - `NEXT_PUBLIC_ETHERSCAN_API_KEY`
   - `NEXT_PUBLIC_BSCSCAN_API_KEY`
   - `NEXT_PUBLIC_POLYGONSCAN_API_KEY`
4. Déployez !

## 🎮 Utilisation

### Navigation
- Utilisez le **menu déroulant en haut à gauche** pour basculer entre :
  - 🪙 Crypto Dashboard
  - ⭐ Pokémon Collection

### Ajouter une carte Pokémon

**Méthode 1 : Recherche automatique**
1. Cliquez sur "AJOUTER UNE CARTE"
2. Tapez le nom du Pokémon dans la barre de recherche
3. Sélectionnez la carte parmi les suggestions
4. La carte est ajoutée avec toutes les informations (image, série, numéro, etc.)

**Méthode 2 : Ajout manuel**
1. Cliquez sur "AJOUTER UNE CARTE"
2. Basculez sur "Ajout manuel"
3. Remplissez les informations manuellement
4. Sauvegardez

### Modifier une carte
1. Survolez une carte avec la souris
2. Cliquez sur "Modifier"
3. Changez les informations
4. Cliquez sur "OK"

### Filtrer les cartes
Utilisez les menus déroulants en haut pour filtrer par :
- **Statut** : Toutes / Possédées / Recherchées
- **Priorité** : Toutes / P1 / P2 / P3

## 🔧 Configuration API

### API Pokémon TCG
L'API Pokémon TCG est utilisée pour la recherche automatique de cartes.
- **Gratuite** et sans clé API requise
- Documentation : https://docs.pokemontcg.io/

### API CardMarket (À implémenter)
Pour obtenir les prix réels via CardMarket :
1. Créez un compte sur https://www.cardmarket.com/
2. Obtenez vos credentials OAuth
3. Implémentez l'authentification dans `fetchCardMarketPrice()`

Actuellement, les prix sont simulés aléatoirement.

## 💾 Stockage des données

Les données sont stockées de manière persistante avec `window.storage` :
- **Crypto** : clé `cryptos` et `airdrops`
- **Pokémon** : clé `pokemon-cards`

Les données persistent entre les sessions et sont synchronisées automatiquement.

## 🎨 Design

- Design sombre moderne avec gradients
- Animations fluides
- Interface responsive (mobile, tablette, desktop)
- Police Orbitron pour un look futuriste
- Icônes Lucide React

## 📝 Structure du projet

```
/
├── components/
│   ├── CryptoDashboard.js    # Dashboard crypto
│   ├── PokemonDashboard.js   # Dashboard Pokémon
│   └── Layout.js             # Layout avec navigation
├── pages/
│   ├── _app.js               # App wrapper
│   └── index.js              # Page principale
├── styles/
│   └── globals.css           # Styles globaux
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Prochaines améliorations

- [ ] Intégration réelle de l'API CardMarket pour les prix
- [ ] Export de la collection en CSV/PDF
- [ ] Graphiques de statistiques avancées
- [ ] Mode clair/sombre
- [ ] Recherche et tri avancés
- [ ] Import de collection depuis un fichier
- [ ] Partage de collection

## 📄 Licence

MIT

---

Créé avec ❤️ par Claude
