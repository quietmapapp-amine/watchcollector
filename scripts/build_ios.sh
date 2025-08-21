#!/bin/bash

# Script simple pour construire l'IPA iOS

set -e

echo "🏗️  Construction de l'IPA iOS..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "ios" ]; then
    echo "🔴 Répertoire ios/ non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

cd ios

# Vérifier que le workspace existe
if [ ! -d "WatchCollector.xcworkspace" ]; then
    echo "🔴 Workspace WatchCollector.xcworkspace non trouvé."
    exit 1
fi

echo "✅ Workspace trouvé: WatchCollector.xcworkspace"

# Créer le répertoire de build
mkdir -p ../build

echo "🔨 Construction de l'IPA avec xcodebuild..."

# Construire l'IPA
xcodebuild -workspace WatchCollector.xcworkspace \
           -scheme WatchCollector \
           -configuration Release \
           -destination generic/platform=iOS \
           -archivePath ../build/WatchCollector.xcarchive \
           archive

if [ $? -eq 0 ]; then
    echo "✅ Archive créée avec succès !"
else
    echo "🔴 Erreur lors de la création de l'archive."
    exit 1
fi

echo "📦 Export de l'IPA..."

# Exporter l'IPA
xcodebuild -exportArchive \
           -archivePath ../build/WatchCollector.xcarchive \
           -exportPath ../build \
           -exportOptionsPlist exportOptions.plist

if [ $? -eq 0 ]; then
    echo "✅ IPA exporté avec succès !"
    echo "📱 IPA disponible dans: ../build/WatchCollector.ipa"
    
    # Afficher les informations sur l'IPA
    if [ -f "../build/WatchCollector.ipa" ]; then
        echo ""
        echo "📊 Informations sur l'IPA:"
        echo "   Taille: $(ls -lh ../build/WatchCollector.ipa | awk '{print $5}')"
        echo "   Chemin: $(realpath ../build/WatchCollector.ipa)"
    fi
else
    echo "🔴 Erreur lors de l'export de l'IPA."
    exit 1
fi

echo ""
echo "🎉 Build iOS terminé avec succès !"
echo "📱 L'IPA est prêt pour TestFlight dans le dossier build/"
