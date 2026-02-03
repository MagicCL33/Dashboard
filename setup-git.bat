@echo off
echo ==========================================
echo Configuration Git pour PlanetHoster
echo Crypto Dashboard
echo ==========================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Git n'est pas installe
    echo.
    echo Telechargez Git depuis : https://git-scm.com/download/win
    echo Installez-le, puis relancez ce script
    pause
    exit /b 1
)

echo [OK] Git est installe
echo.

REM Configuration Git
echo Configuration de votre identite Git...
set /p git_name="Votre nom (ex: Jean Dupont): "
set /p git_email="Votre email (ex: jean@example.com): "

git config --global user.name "%git_name%"
git config --global user.email "%git_email%"

echo [OK] Configuration Git terminee
echo.

REM Initialiser le repository
echo Initialisation du repository Git...
git init

echo [OK] Repository Git initialise
echo.

REM Premier commit
echo Ajout des fichiers au repository...
git add .
git commit -m "Initial commit - Crypto Dashboard"

echo [OK] Premier commit cree
echo.

echo ==========================================
echo Configuration terminee !
echo ==========================================
echo.
echo PROCHAINES ETAPES :
echo.
echo 1. Connectez-vous a votre panel PlanetHoster
echo 2. Allez dans 'Git Version Control' ou 'Deploiement Git'
echo 3. Recuperez l'URL de votre repository Git
echo 4. Executez cette commande en remplacant URL par votre URL :
echo    git remote add planethoster URL
echo.
echo 5. Poussez votre code :
echo    git push -u planethoster main
echo.
echo Si vous avez des erreurs, consultez le fichier :
echo GUIDE_GIT_PLANETHOSTER.md
echo.
pause
