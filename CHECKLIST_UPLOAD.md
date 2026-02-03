# ✅ CHECKLIST - Fichiers à Uploader sur GitHub

## 📦 Fichiers du Projet Crypto Dashboard

### ✅ **À UPLOADER (Cochez au fur et à mesure)**

```
📁 Dossiers :
□ components/
  □ CryptoDashboard.js
□ pages/
  □ _app.js
  □ index.js
□ public/
□ styles/
  □ globals.css

📄 Fichiers de configuration :
□ .gitignore
□ .env.example
□ next.config.js
□ package.json
□ postcss.config.js
□ tailwind.config.js

📖 Documentation :
□ README.md
□ GUIDE_DEPLOIEMENT.md (optionnel)
□ GUIDE_GITHUB_UPLOAD.md (optionnel)
```

---

### ❌ **NE PAS UPLOADER (Vérifiez qu'ils ne sont pas là !)**

```
❌ node_modules/
❌ .next/
❌ .env (CONTIENT VOS CLÉS SECRÈTES !)
❌ .env.local
❌ .DS_Store
❌ *.log
❌ build/
❌ dist/
```

---

## 🔍 **Vérification Rapide**

### Avant d'uploader, ouvrez le fichier `.env.example` :

✅ **CORRECT :**
```
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_etherscan_api_key_here
NEXT_PUBLIC_BSCSCAN_API_KEY=your_bscscan_api_key_here
NEXT_PUBLIC_POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

❌ **INCORRECT (ne pas uploader si c'est comme ça) :**
```
NEXT_PUBLIC_ETHERSCAN_API_KEY=ABC123XYZ789REALKEY
NEXT_PUBLIC_BSCSCAN_API_KEY=DEF456UVW012REALKEY
NEXT_PUBLIC_POLYGONSCAN_API_KEY=GHI789RST345REALKEY
```

---

## 📊 **Résumé**

**Total à uploader :** ~15 fichiers
**Taille totale :** ~100 Ko (sans node_modules)
**Temps d'upload :** 1-2 minutes

---

## 🎯 **Méthode la Plus Simple**

1. Allez sur https://github.com/new
2. Créez un nouveau repository
3. Cliquez sur "Add file" → "Upload files"
4. Glissez TOUS les fichiers ✅ (pas les ❌)
5. Cliquez "Commit changes"

**TERMINÉ !** 🎉

---

## ⚠️ **Points Critiques**

1. **NE JAMAIS** uploader le fichier `.env`
2. **TOUJOURS** vérifier que `.gitignore` est présent
3. **NE PAS** uploader `node_modules/`

Si vous uploadez `.env` par erreur → Supprimez-le immédiatement et régénérez vos clés API !

---

**Prêt ? Cochez la liste et uploadez ! 🚀**
