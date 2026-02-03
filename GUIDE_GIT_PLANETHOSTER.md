# 🔧 Guide de Configuration Git pour PlanetHoster

## 📋 Prérequis

### 1. Installer Git sur votre ordinateur

**Windows :**
- Téléchargez : https://git-scm.com/download/win
- Installez avec les options par défaut
- Vérifiez : Ouvrez CMD et tapez `git --version`

**Mac :**
```bash
# Via Homebrew
brew install git

# Ou téléchargez depuis
# https://git-scm.com/download/mac
```

**Linux :**
```bash
sudo apt-get update
sudo apt-get install git
```

---

## 🚀 Configuration Étape par Étape

### **Étape 1 : Récupérer l'URL Git de PlanetHoster**

1. Connectez-vous à votre **panel PlanetHoster** (World Lite)
2. Allez dans : **Domaines** → Sélectionnez votre domaine
3. Cherchez l'option **"Git Version Control"** ou **"Déploiement Git"**
4. Activez Git si ce n'est pas déjà fait
5. **Copiez l'URL Git** qui ressemble à :
   ```
   ssh://username@hostname.planethoster.net:port/~/repository.git
   ```
   OU
   ```
   https://git.planethoster.net/username/repository.git
   ```

> 💡 **Note :** Si vous ne trouvez pas cette option, contactez le support PlanetHoster ou utilisez le déploiement FTP (voir section alternative)

---

### **Étape 2 : Configurer Git localement**

Ouvrez un terminal (CMD sur Windows, Terminal sur Mac/Linux) dans le dossier de votre projet :

```bash
# Naviguez vers votre dossier projet
cd /chemin/vers/crypto-dashboard

# Configuration de votre identité
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérifiez la configuration
git config --list
```

---

### **Étape 3 : Initialiser le Repository Git**

```bash
# Initialisez Git dans votre dossier
git init

# Ajoutez tous les fichiers
git add .

# Créez votre premier commit
git commit -m "Initial commit - Crypto Dashboard"
```

---

### **Étape 4 : Connecter à PlanetHoster**

```bash
# Remplacez <URL-PLANETHOSTER> par l'URL que vous avez copiée à l'étape 1
git remote add planethoster <URL-PLANETHOSTER>

# Exemple :
# git remote add planethoster ssh://username@server.planethoster.net:2222/~/crypto-dashboard.git

# Vérifiez que le remote est bien ajouté
git remote -v
```

---

### **Étape 5 : Pousser votre code**

```bash
# Poussez votre code vers PlanetHoster
git push -u planethoster main

# Si vous avez une erreur "main n'existe pas", essayez :
git branch -M main
git push -u planethoster main
```

**Si vous avez une erreur d'authentification SSH :**
```bash
# Générez une clé SSH
ssh-keygen -t rsa -b 4096 -C "votre.email@example.com"

# Copiez votre clé publique
cat ~/.ssh/id_rsa.pub

# Ajoutez cette clé dans votre panel PlanetHoster :
# Panel → SSH Keys → Add SSH Key
```

---

## 🔄 Workflow de Développement

Une fois configuré, voici comment travailler :

### **1. Faire des modifications**
```bash
# Modifiez vos fichiers localement
# Testez en local avec :
npm run dev
```

### **2. Enregistrer les modifications**
```bash
# Ajoutez les fichiers modifiés
git add .

# Créez un commit avec un message descriptif
git commit -m "Ajout de la fonctionnalité X"
```

### **3. Déployer sur PlanetHoster**
```bash
# Poussez vers PlanetHoster
git push planethoster main

# Le site se mettra à jour automatiquement !
```

---

## 📝 Commandes Git Utiles

```bash
# Voir l'état de vos fichiers
git status

# Voir l'historique des commits
git log --oneline

# Annuler des modifications non commitées
git checkout -- fichier.js

# Créer une branche pour tester
git checkout -b nouvelle-fonctionnalite

# Revenir à la branche principale
git checkout main

# Fusionner une branche
git merge nouvelle-fonctionnalite
```

---

## 🔧 Configuration des Variables d'Environnement sur PlanetHoster

Après le déploiement, vous devez configurer vos clés API :

### **Méthode 1 : Via le Panel (Recommandé)**
1. Panel PlanetHoster → Votre domaine
2. Cherchez "Variables d'environnement" ou "Environment Variables"
3. Ajoutez :
   - `NEXT_PUBLIC_ETHERSCAN_API_KEY` = votre_clé
   - `NEXT_PUBLIC_BSCSCAN_API_KEY` = votre_clé
   - `NEXT_PUBLIC_POLYGONSCAN_API_KEY` = votre_clé

### **Méthode 2 : Via fichier .env**
Si PlanetHoster ne supporte pas les variables d'environnement dans le panel :

```bash
# Créez un fichier .env à la racine du projet
NEXT_PUBLIC_ETHERSCAN_API_KEY=votre_clé_etherscan
NEXT_PUBLIC_BSCSCAN_API_KEY=votre_clé_bscscan
NEXT_PUBLIC_POLYGONSCAN_API_KEY=votre_clé_polygonscan
```

**⚠️ IMPORTANT :** 
- N'ajoutez JAMAIS le fichier .env à Git
- Il est déjà dans .gitignore
- Uploadez-le manuellement via FTP si nécessaire

---

## 🆘 Problèmes Courants

### **Problème : PlanetHoster ne supporte pas Git**

Si PlanetHoster World Lite ne propose pas Git, utilisez le **déploiement FTP** :

1. Installez FileZilla : https://filezilla-project.org/
2. Connectez-vous avec vos identifiants FTP (depuis le panel PlanetHoster)
3. Uploadez tous les fichiers du projet
4. Pour mettre à jour : re-uploadez les fichiers modifiés

### **Problème : Erreur d'authentification SSH**

```bash
# Vérifiez que votre clé SSH est ajoutée
ssh-add -l

# Si vide, ajoutez votre clé
ssh-add ~/.ssh/id_rsa
```

### **Problème : "Permission denied"**

```bash
# Vérifiez les permissions du dossier
chmod 755 votre-dossier

# Ou utilisez HTTPS au lieu de SSH
git remote set-url planethoster https://git.planethoster.net/username/repo.git
```

---

## ✅ Checklist de Déploiement

- [ ] Git installé et configuré
- [ ] Repository initialisé (`git init`)
- [ ] URL PlanetHoster récupérée
- [ ] Remote ajouté (`git remote add`)
- [ ] Premier commit créé
- [ ] Code poussé vers PlanetHoster
- [ ] Variables d'environnement configurées
- [ ] Clés API obtenues (Etherscan, BscScan, PolygonScan)
- [ ] Site testé et fonctionnel

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la documentation PlanetHoster : https://my.planethoster.com/en/support
2. Contactez le support PlanetHoster (ils sont généralement très réactifs)
3. Assurez-vous que votre plan supporte Node.js et Next.js

---

## 🎯 Prochaines Étapes

Une fois déployé :
1. Testez le scan de wallet avec une vraie adresse
2. Ajoutez vos cryptos manuellement
3. Commencez à tracker vos airdrops
4. Profitez de votre dashboard ! 🚀

---

**Bon déploiement ! 💪**
