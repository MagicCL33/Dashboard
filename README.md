# 🚀 Crypto Portfolio & Airdrop Tracker

Dashboard interactif pour suivre vos investissements crypto et vos activités de farming d'airdrops.

## ✨ Fonctionnalités

### 📊 Portfolio Crypto
- **Scan automatique de wallet** : Importez vos cryptos depuis Ethereum, BSC et Polygon
- Suivi en temps réel des prix
- Calcul automatique P&L et pourcentage de gain/perte
- Ajout manuel de cryptos
- Stockage persistant des données

### 💧 Farming Airdrops
- Suivi de vos projets d'airdrops
- Actions groupées par projet dans un tableau
- Historique complet avec date et wallet utilisé
- Progression des tâches avec barre visuelle
- Suppression d'actions individuelles

## 🛠️ Installation Locale

```bash
# Cloner le projet
git clone <votre-repo>
cd crypto-dashboard

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# Ajouter vos clés API dans .env
# Obtenez vos clés gratuites sur :
# - Etherscan: https://etherscan.io/apis
# - BscScan: https://bscscan.com/apis
# - PolygonScan: https://polygonscan.com/apis

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🌐 Déploiement sur Vercel

### Option 1 : Via l'interface Vercel (Recommandé)

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository GitHub
4. Ajoutez vos variables d'environnement dans les paramètres :
   - `NEXT_PUBLIC_ETHERSCAN_API_KEY`
   - `NEXT_PUBLIC_BSCSCAN_API_KEY`
   - `NEXT_PUBLIC_POLYGONSCAN_API_KEY`
5. Cliquez sur "Deploy"

### Option 2 : Via CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Ajouter les variables d'environnement
vercel env add NEXT_PUBLIC_ETHERSCAN_API_KEY
vercel env add NEXT_PUBLIC_BSCSCAN_API_KEY
vercel env add NEXT_PUBLIC_POLYGONSCAN_API_KEY

# Redéployer avec les variables
vercel --prod
```

## 🌐 Déploiement sur Netlify

1. Créez un compte sur [netlify.com](https://netlify.com)
2. Cliquez sur "Add new site" → "Import an existing project"
3. Connectez votre repository GitHub
4. Configurez le build :
   - Build command : `npm run build`
   - Publish directory : `.next`
5. Ajoutez vos variables d'environnement dans "Site settings" → "Environment variables"
6. Cliquez sur "Deploy site"

## 🔑 Obtenir les Clés API

### Etherscan (Gratuit)
1. Créez un compte sur [etherscan.io](https://etherscan.io)
2. Allez dans "API Keys" dans votre profil
3. Créez une nouvelle clé API

### BscScan (Gratuit)
1. Créez un compte sur [bscscan.com](https://bscscan.com)
2. Allez dans "API Keys" dans votre profil
3. Créez une nouvelle clé API

### PolygonScan (Gratuit)
1. Créez un compte sur [polygonscan.com](https://polygonscan.com)
2. Allez dans "API Keys" dans votre profil
3. Créez une nouvelle clé API

## 📝 Utilisation

### Scanner un Wallet
1. Allez dans l'onglet "Portfolio"
2. Entrez l'adresse de votre wallet (Ethereum, BSC ou Polygon)
3. Cliquez sur "Scanner"
4. Vos cryptos seront automatiquement importées

### Ajouter un Airdrop
1. Allez dans l'onglet "Airdrops"
2. Cliquez sur "Ajouter"
3. Remplissez les informations (projet, date, wallet, description)
4. Si vous ajoutez une action pour un projet existant, elle sera automatiquement ajoutée au même projet

## 🎨 Technologies Utilisées

- **Next.js 14** : Framework React
- **React 18** : Bibliothèque UI
- **Tailwind CSS** : Styling
- **Lucide React** : Icônes
- **Etherscan API** : Données blockchain Ethereum
- **BscScan API** : Données blockchain BSC
- **PolygonScan API** : Données blockchain Polygon
- **CoinGecko API** : Prix des cryptos

## 🔒 Sécurité

- Vos données sont stockées localement dans votre navigateur
- Les clés API sont côté serveur (variables d'environnement)
- Aucune donnée sensible n'est envoyée à des serveurs tiers
- Le code est open source et vérifiable

## 📱 Responsive

Le dashboard est entièrement responsive et fonctionne sur :
- 💻 Desktop
- 📱 Mobile
- 📱 Tablette

## 🤝 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Vérifiez que vos clés API sont valides
- Assurez-vous que les adresses de wallet sont correctes

## 📄 Licence

MIT
