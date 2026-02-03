#!/bin/bash

# Script de configuration Git pour PlanetHoster
# Crypto Dashboard

echo "=========================================="
echo "Configuration Git pour PlanetHoster"
echo "=========================================="
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null
then
    echo "❌ Git n'est pas installé"
    echo ""
    echo "Pour installer Git :"
    echo "  - Windows: Téléchargez depuis https://git-scm.com/download/win"
    echo "  - Mac: brew install git"
    echo "  - Linux: sudo apt-get install git"
    exit 1
fi

echo "✅ Git est installé (version: $(git --version))"
echo ""

# Configuration initiale Git
echo "Configuration de votre identité Git..."
read -p "Votre nom (ex: Jean Dupont): " git_name
read -p "Votre email (ex: jean@example.com): " git_email

git config --global user.name "$git_name"
git config --global user.email "$git_email"

echo "✅ Configuration Git terminée"
echo ""

# Initialiser le repository
echo "Initialisation du repository Git..."
git init

echo "✅ Repository Git initialisé"
echo ""

# Créer .gitignore si absent
if [ ! -f .gitignore ]; then
    echo "Création du fichier .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF
    echo "✅ Fichier .gitignore créé"
fi

echo ""
echo "=========================================="
echo "Configuration terminée !"
echo "=========================================="
echo ""
echo "Prochaines étapes :"
echo "1. Connectez-vous à votre panel PlanetHoster"
echo "2. Allez dans 'Git Version Control'"
echo "3. Récupérez l'URL de votre repository Git"
echo "4. Exécutez : git remote add planethoster <URL>"
echo "5. Exécutez : git add ."
echo "6. Exécutez : git commit -m 'Initial commit'"
echo "7. Exécutez : git push planethoster main"
echo ""
