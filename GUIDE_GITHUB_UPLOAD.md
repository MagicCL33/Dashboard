# 📤 Guide : Uploader votre Crypto Dashboard sur GitHub

## 📋 **Liste des Fichiers à Uploader**

### ✅ **FICHIERS À UPLOADER (Obligatoires)**

Uploadez ces fichiers/dossiers à la racine de votre repository :

```
crypto-dashboard/
├── components/
│   └── CryptoDashboard.js          ✅ UPLOADER
├── pages/
│   ├── _app.js                      ✅ UPLOADER
│   └── index.js                     ✅ UPLOADER
├── public/                          ✅ UPLOADER (même si vide)
├── styles/
│   └── globals.css                  ✅ UPLOADER
├── .gitignore                       ✅ UPLOADER
├── .env.example                     ✅ UPLOADER
├── next.config.js                   ✅ UPLOADER
├── package.json                     ✅ UPLOADER
├── postcss.config.js                ✅ UPLOADER
├── tailwind.config.js               ✅ UPLOADER
├── README.md                        ✅ UPLOADER
└── GUIDE_DEPLOIEMENT.md            ✅ UPLOADER (optionnel)
```

---

### ❌ **FICHIERS À NE PAS UPLOADER**

**NE JAMAIS uploader ces fichiers/dossiers :**

```
❌ node_modules/        (Trop lourd, se régénère avec npm install)
❌ .next/               (Fichiers compilés, se régénèrent)
❌ .env                 (CONTIENT VOS CLÉS API SECRÈTES !)
❌ .env.local           (Fichiers secrets)
❌ .DS_Store            (Fichiers système Mac)
❌ *.log                (Logs)
```

**⚠️ CRITIQUE :** Ne uploadez JAMAIS le fichier `.env` car il contient vos clés API !

---

## 🚀 **Méthode 1 : Upload via Interface GitHub (Plus Simple)**

### **Étape 1 : Créer le Repository**

1. Allez sur https://github.com
2. Connectez-vous (ou créez un compte gratuit)
3. Cliquez sur le **"+"** en haut à droite → **"New repository"**
4. Remplissez :
   - **Repository name** : `crypto-dashboard` (ou autre nom)
   - **Description** : `Dashboard pour suivre mes cryptos et airdrops`
   - ✅ **Public** (ou Private si vous préférez)
   - ✅ Cochez **"Add a README file"** (ou non, vous avez déjà le vôtre)
   - ✅ Cochez **"Add .gitignore"** → Choisissez **"Node"**
5. Cliquez sur **"Create repository"**

### **Étape 2 : Uploader les Fichiers**

1. Dans votre nouveau repository, cliquez sur **"Add file"** → **"Upload files"**
2. **Glissez-déposez** tous les fichiers/dossiers de la liste ✅ ci-dessus
3. En bas, écrivez un message : `Initial commit - Crypto Dashboard`
4. Cliquez sur **"Commit changes"**

**✅ TERMINÉ !** Vos fichiers sont sur GitHub !

---

## 💻 **Méthode 2 : Upload via Git (Ligne de Commande)**

### **Prérequis**
- Git installé sur votre ordinateur
- Terminal/CMD ouvert dans le dossier du projet

### **Commandes à exécuter**

```bash
# 1. Initialiser Git
git init

# 2. Configurer votre identité (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# 3. Ajouter tous les fichiers (sauf ceux dans .gitignore)
git add .

# 4. Créer le premier commit
git commit -m "Initial commit - Crypto Dashboard"

# 5. Créer le repository sur GitHub (via leur interface)
# Ensuite, connecter votre projet local au repository GitHub :

# 6. Ajouter le remote GitHub (remplacez USERNAME et REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Exemple :
# git remote add origin https://github.com/jeandupont/crypto-dashboard.git

# 7. Pousser le code vers GitHub
git branch -M main
git push -u origin main
```

**✅ TERMINÉ !** Votre code est sur GitHub !

---

## 📝 **Structure Finale sur GitHub**

Votre repository GitHub devrait ressembler à ça :

```
crypto-dashboard/
│
├── 📁 components/
│   └── CryptoDashboard.js
│
├── 📁 pages/
│   ├── _app.js
│   └── index.js
│
├── 📁 public/
│   (vide pour l'instant)
│
├── 📁 styles/
│   └── globals.css
│
├── 📄 .gitignore
├── 📄 .env.example
├── 📄 next.config.js
├── 📄 package.json
├── 📄 postcss.config.js
├── 📄 tailwind.config.js
├── 📄 README.md
└── 📄 GUIDE_DEPLOIEMENT.md
```

---

## 🔐 **Vérification de Sécurité**

### Avant d'uploader, vérifiez :

✅ Le fichier `.gitignore` contient bien :
```
node_modules
.next
.env
.env*.local
```

✅ Vous n'avez PAS de fichier `.env` dans vos fichiers à uploader

✅ Le fichier `.env.example` ne contient PAS vos vraies clés :
```
# ✅ BON (exemple)
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here

# ❌ MAUVAIS (vraie clé)
NEXT_PUBLIC_ETHERSCAN_API_KEY=ABC123XYZ789REALKEY
```

---

## 🎯 **Après l'Upload sur GitHub**

Une fois vos fichiers sur GitHub, vous êtes prêt pour Vercel !

### **Prochaines étapes :**

1. ✅ Fichiers uploadés sur GitHub
2. 🚀 Déployer sur Vercel :
   - Allez sur https://vercel.com/signup
   - Connectez-vous avec GitHub
   - "New Project" → Sélectionnez votre repository
   - Ajoutez les variables d'environnement (vos vraies clés API)
   - Deploy !

---

## ❓ **Questions Fréquentes**

### **Q : Dois-je créer un compte GitHub Pro ?**
❌ Non ! Le compte gratuit suffit largement.

### **Q : Mon repository doit être Public ou Private ?**
- **Public** : Tout le monde peut voir votre code (mais pas vos clés API)
- **Private** : Seulement vous pouvez le voir
- Les deux fonctionnent avec Vercel !

### **Q : Que se passe-t-il avec node_modules/ ?**
Il est ignoré par .gitignore. Vercel installera automatiquement les dépendances en lisant package.json.

### **Q : Et si j'ai déjà uploadé .env par erreur ?**
```bash
# Supprimez-le immédiatement :
git rm .env
git commit -m "Remove sensitive .env file"
git push origin main

# Puis régénérez vos clés API sur Etherscan/BscScan/PolygonScan
```

---

## 🆘 **Besoin d'Aide ?**

Si vous avez des erreurs :
1. Vérifiez que .gitignore existe
2. Assurez-vous de ne pas avoir uploadé node_modules/
3. Vérifiez qu'aucun fichier .env n'est visible sur GitHub

---

## ✅ **Checklist Finale**

Avant de passer à Vercel, vérifiez :

- [ ] Repository créé sur GitHub
- [ ] Tous les fichiers ✅ uploadés
- [ ] Aucun fichier ❌ uploadé
- [ ] .gitignore présent
- [ ] .env.example présent (avec des exemples, pas vos vraies clés)
- [ ] README.md présent
- [ ] Code visible sur github.com/VOTRE-USERNAME/VOTRE-REPO

**🎉 Vous êtes prêt pour déployer sur Vercel !**

---

**Prochaine étape : Guide Vercel** 👉
