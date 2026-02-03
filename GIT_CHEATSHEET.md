# 📝 Aide-Mémoire Git - Crypto Dashboard

## 🚀 Configuration Initiale (À faire une seule fois)

```bash
# 1. Configurer votre identité
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"

# 2. Initialiser Git dans le projet
cd crypto-dashboard
git init

# 3. Premier commit
git add .
git commit -m "Initial commit"

# 4. Ajouter PlanetHoster (remplacez URL)
git remote add planethoster <URL-PLANETHOSTER>

# 5. Pousser le code
git push -u planethoster main
```

---

## 🔄 Workflow Quotidien (À chaque modification)

```bash
# 1. Voir les fichiers modifiés
git status

# 2. Ajouter les modifications
git add .
# OU ajouter un fichier spécifique :
git add components/CryptoDashboard.js

# 3. Créer un commit
git commit -m "Description de vos modifications"

# 4. Envoyer vers PlanetHoster
git push planethoster main
```

**🎯 Exemple complet :**
```bash
git status
git add .
git commit -m "Ajout du mode sombre"
git push planethoster main
```

---

## 📋 Commandes Utiles

### Voir l'historique
```bash
git log --oneline
git log --graph --oneline --all
```

### Annuler des modifications
```bash
# Annuler les modifications d'un fichier (non commité)
git checkout -- fichier.js

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Voir les différences
git diff
```

### Gérer les branches
```bash
# Créer une nouvelle branche
git checkout -b nom-branche

# Lister les branches
git branch

# Changer de branche
git checkout main

# Fusionner une branche
git merge nom-branche
```

### Remote (PlanetHoster)
```bash
# Voir les remotes
git remote -v

# Modifier l'URL du remote
git remote set-url planethoster <NOUVELLE-URL>

# Supprimer un remote
git remote remove planethoster
```

---

## 🆘 En Cas de Problème

### "Updates were rejected"
```bash
# Récupérer d'abord les changements du serveur
git pull planethoster main --rebase
git push planethoster main
```

### "Permission denied"
```bash
# Vérifier votre clé SSH
ssh -T git@planethoster.net

# Ou utiliser HTTPS au lieu de SSH
git remote set-url planethoster https://...
```

### Fichier oublié dans .gitignore
```bash
# Retirer un fichier déjà commité
git rm --cached fichier.txt
git commit -m "Retrait du fichier sensible"
git push planethoster main
```

---

## 🎯 Messages de Commit Suggérés

Utilisez des messages clairs :

```bash
# ✅ Bon
git commit -m "Ajout scan wallet Solana"
git commit -m "Correction bug affichage prix"
git commit -m "Amélioration UI mobile"

# ❌ Mauvais
git commit -m "update"
git commit -m "fix"
git commit -m "changes"
```

---

## 🔐 Variables d'Environnement

**Ne JAMAIS commit le fichier .env !**

```bash
# Vérifier que .env est ignoré
cat .gitignore | grep .env

# Si absent, ajouter à .gitignore :
echo ".env" >> .gitignore
```

---

## 📱 Commandes Rapides du Quotidien

**Modifier et déployer rapidement :**
```bash
# 1 ligne pour tout faire :
git add . && git commit -m "Mise à jour" && git push planethoster main
```

**Voir ce qui a changé avant de commit :**
```bash
git status
git diff
```

**Revenir en arrière :**
```bash
# Annuler les dernières modifications (ATTENTION: perte de données)
git reset --hard HEAD
```

---

## ✅ Checklist Avant Chaque Push

- [ ] `git status` - Vérifier les fichiers modifiés
- [ ] `npm run dev` - Tester en local
- [ ] Pas de fichiers sensibles (.env, clés API)
- [ ] Message de commit descriptif
- [ ] Push vers PlanetHoster

---

**Gardez ce fichier à portée de main ! 📌**
