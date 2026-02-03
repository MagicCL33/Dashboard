# 📤 Guide de Déploiement FTP pour PlanetHoster World Lite

## ⚠️ Information Importante

**World Lite ne supporte PAS Git/SSH**. Vous devez utiliser FTP pour uploader vos fichiers.

---

## 🛠️ Étape 1 : Installer FileZilla

1. Téléchargez FileZilla : https://filezilla-project.org/
2. Installez-le sur votre ordinateur

---

## 🔑 Étape 2 : Récupérer vos identifiants FTP

1. Connectez-vous à https://my.planethoster.com
2. Allez dans votre compte **World Lite**
3. Cherchez la section **"FTP Accounts"** ou **"Comptes FTP"**
4. Notez ces informations :
   - **Hôte/Host** : (ex: ftp.votresite.planethoster.world)
   - **Nom d'utilisateur/Username** : (ex: user@votresite)
   - **Mot de passe/Password** : (celui de votre compte)
   - **Port** : 21 (FTP) ou 22 (SFTP si disponible)

---

## 🚀 Étape 3 : Se connecter avec FileZilla

1. Ouvrez FileZilla
2. En haut, remplissez :
   ```
   Hôte : ftp.votresite.planethoster.world
   Identifiant : votre_username
   Mot de passe : votre_password
   Port : 21
   ```
3. Cliquez sur **"Connexion rapide"**

---

## 📁 Étape 4 : Préparer votre projet Next.js

**IMPORTANT :** Next.js nécessite Node.js. Vérifiez d'abord si World Lite supporte Node.js !

### Si World Lite supporte Node.js :

```bash
# Dans votre dossier projet local
npm run build

# Uploadez ces dossiers via FTP :
- .next/
- public/
- node_modules/ (optionnel, très lourd)
- package.json
- next.config.js
```

### Si World Lite NE supporte PAS Node.js :

❌ **Vous NE POUVEZ PAS héberger un site Next.js sur World Lite**

Next.js nécessite :
- Node.js runtime
- npm/yarn pour installer les dépendances
- Un serveur qui peut exécuter du JavaScript côté serveur

**World Lite est principalement pour :**
- Sites HTML/CSS/JS statiques
- PHP
- WordPress

---

## 🎯 **SOLUTION RECOMMANDÉE : Utilisez Vercel (GRATUIT)**

Vercel est fait POUR Next.js et est **100% gratuit** :

### Pourquoi Vercel ?
✅ Gratuit pour toujours
✅ Optimisé pour Next.js
✅ Déploiement Git automatique
✅ SSL/HTTPS gratuit
✅ CDN mondial
✅ Variables d'environnement incluses
✅ Aucune limite pour les projets personnels

### Comment déployer sur Vercel en 2 minutes :

1. Allez sur https://vercel.com/signup
2. Inscrivez-vous avec GitHub (gratuit)
3. Créez un repository GitHub avec vos fichiers
4. Sur Vercel : "New Project" → Importez votre repo
5. Ajoutez vos variables d'environnement :
   - `NEXT_PUBLIC_ETHERSCAN_API_KEY`
   - `NEXT_PUBLIC_BSCSCAN_API_KEY`
   - `NEXT_PUBLIC_POLYGONSCAN_API_KEY`
6. Cliquez sur "Deploy"
7. **TERMINÉ !** Votre site est en ligne sur `votreprojet.vercel.app`

### Pour les mises à jour :
Chaque fois que vous faites un `git push` vers GitHub, Vercel redéploie automatiquement !

---

## 📊 Comparaison

| Fonctionnalité | World Lite (FTP) | Vercel (Git) |
|----------------|------------------|--------------|
| Prix | Gratuit | Gratuit |
| Next.js | ❌ Pas supporté* | ✅ Optimisé |
| Déploiement | Manuel (FTP) | Automatique (Git) |
| Variables env | Difficile | ✅ Facile |
| SSL/HTTPS | ✅ Oui | ✅ Oui |
| APIs blockchain | ⚠️ Peut marcher | ✅ Fonctionne |
| Git | ❌ Non | ✅ Oui |
| Mises à jour | Upload manuel | Push automatique |

*À vérifier dans votre panel World Lite

---

## 🔍 Vérifier si World Lite supporte Node.js

1. Connectez-vous à votre cPanel World Lite
2. Cherchez "Node.js" ou "Node.js Selector" ou "Application Manager"
3. Si vous le trouvez → Node.js est supporté ✅
4. Si vous ne le trouvez pas → Node.js n'est PAS supporté ❌

---

## 💬 Ma Recommandation Finale

**UTILISEZ VERCEL** pour ce projet car :
1. World Lite ne supporte probablement pas Next.js
2. Même si ça marchait, FTP manuel à chaque modification serait pénible
3. Vercel est gratuit et fait exactement pour Next.js
4. Déploiement en 1 clic, mises à jour automatiques
5. Meilleure performance avec leur CDN

**Gardez PlanetHoster World Lite pour :**
- Un site WordPress
- Un portfolio HTML/CSS/JS statique
- Un projet PHP

---

## 🚀 Prochaines Étapes

Voulez-vous que je vous aide à :
1. ✅ Déployer sur Vercel (RECOMMANDÉ - 5 minutes)
2. Vérifier si World Lite supporte Node.js
3. Créer une version HTML statique du dashboard (sans scan wallet)

Qu'en pensez-vous ? 😊
