# 🚀 Guide de Déploiement Rapide

## Étape 1️⃣ : Télécharger le projet

Téléchargez tous les fichiers du dashboard et extrayez-les dans un dossier sur votre ordinateur.

## Étape 2️⃣ : Obtenir les clés API (GRATUIT)

### Etherscan
1. Allez sur https://etherscan.io/register
2. Créez un compte gratuit
3. Allez dans votre profil → API Keys
4. Créez une nouvelle clé API
5. Copiez la clé

### BscScan
1. Allez sur https://bscscan.com/register
2. Créez un compte gratuit
3. Allez dans votre profil → API Keys
4. Créez une nouvelle clé API
5. Copiez la clé

### PolygonScan
1. Allez sur https://polygonscan.com/register
2. Créez un compte gratuit
3. Allez dans votre profil → API Keys
4. Créez une nouvelle clé API
5. Copiez la clé

## Étape 3️⃣ : Déployer sur Vercel (GRATUIT)

### Méthode recommandée (via GitHub)

1. **Créer un repository GitHub**
   - Allez sur https://github.com/new
   - Créez un nouveau repository (public ou privé)
   - Uploadez tous les fichiers du dashboard

2. **Déployer sur Vercel**
   - Allez sur https://vercel.com/signup
   - Inscrivez-vous avec GitHub (gratuit)
   - Cliquez sur "Add New Project"
   - Sélectionnez votre repository
   - Ajoutez les variables d'environnement :
     * Cliquez sur "Environment Variables"
     * Ajoutez : `NEXT_PUBLIC_ETHERSCAN_API_KEY` = votre clé Etherscan
     * Ajoutez : `NEXT_PUBLIC_BSCSCAN_API_KEY` = votre clé BscScan
     * Ajoutez : `NEXT_PUBLIC_POLYGONSCAN_API_KEY` = votre clé PolygonScan
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes

3. **C'est prêt ! 🎉**
   - Vercel vous donnera une URL (ex: crypto-dashboard.vercel.app)
   - Votre dashboard est maintenant en ligne !

### Méthode alternative (via CLI)

```bash
# Dans le dossier du projet
npm install -g vercel
vercel login
vercel

# Suivez les instructions et ajoutez vos clés API quand demandé
```

## Étape 4️⃣ : Déployer sur Netlify (Alternative GRATUITE)

1. Allez sur https://netlify.com
2. Cliquez sur "Add new site" → "Import an existing project"
3. Connectez votre GitHub et sélectionnez le repository
4. Configuration :
   - Build command : `npm run build`
   - Publish directory : `.next`
5. Ajoutez les variables d'environnement dans "Site settings" → "Environment variables"
6. Déployez !

## ⚠️ Important

- Les clés API sont GRATUITES (pas besoin de carte bancaire)
- Vos données sont stockées dans votre navigateur (pas de base de données nécessaire)
- Le déploiement Vercel/Netlify est GRATUIT pour toujours
- Pas besoin de connaissances techniques avancées

## 💡 Conseils

- Gardez vos clés API secrètes
- Ne les partagez jamais publiquement
- Vous pouvez régénérer les clés à tout moment
- Le plan gratuit Vercel permet des milliers de visites par mois

## 📱 Utilisation après déploiement

1. Ouvrez l'URL de votre dashboard
2. Entrez une adresse de wallet dans "Scanner un Wallet"
3. Cliquez sur "Scanner"
4. Vos cryptos s'affichent automatiquement !

## 🆘 Besoin d'aide ?

- Vérifiez que vos clés API sont correctes
- Assurez-vous d'avoir bien ajouté les 3 variables d'environnement
- L'adresse du wallet doit commencer par "0x"
- Redéployez le site après avoir ajouté les variables d'environnement

Bon farming ! 🚀💰
