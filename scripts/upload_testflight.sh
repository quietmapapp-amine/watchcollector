#!/bin/bash

# Script simple pour uploader l'IPA vers TestFlight

set -e

echo "🚀 Upload vers TestFlight..."

# Vérifier que l'IPA existe
IPA_PATH="build/WatchCollector.ipa"
if [ ! -f "$IPA_PATH" ]; then
    echo "🔴 IPA non trouvé: $IPA_PATH"
    echo "💡 Exécutez d'abord: ./scripts/build_ios.sh"
    exit 1
fi

echo "✅ IPA trouvé: $IPA_PATH"
echo "📊 Taille: $(ls -lh "$IPA_PATH" | awk '{print $5}')"

# Vérifier que la clé API existe
API_KEY_FILE=".private/appstoreconnect_api_key.p8"
if [ ! -f "$API_KEY_FILE" ]; then
    echo "🔴 Clé API non trouvée: $API_KEY_FILE"
    exit 1
fi

echo "✅ Clé API trouvée: $API_KEY_FILE"

# Charger les variables d'environnement
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Variables d'environnement chargées"
else
    echo "🔴 Fichier .env non trouvé"
    exit 1
fi

# Vérifier les variables critiques
if [ -z "$ASC_KEY_ID" ] || [ -z "$ASC_ISSUER_ID" ]; then
    echo "🔴 Variables ASC_KEY_ID ou ASC_ISSUER_ID manquantes dans .env"
    exit 1
fi

echo "✅ Variables ASC configurées:"
echo "   Key ID: $ASC_KEY_ID"
echo "   Issuer ID: $ASC_ISSUER_ID"

echo ""
echo "📤 Upload vers TestFlight avec xcrun altool..."

# Upload avec xcrun altool
xcrun altool --upload-app \
    --type ios \
    --file "$IPA_PATH" \
    --apiKey "$ASC_KEY_ID" \
    --apiIssuer "$ASC_ISSUER_ID"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Upload vers TestFlight réussi !"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifier dans App Store Connect que le build est visible"
    echo "   2. Attendre que le build soit traité (10-30 min)"
    echo "   3. Ajouter des notes de version si nécessaire"
    echo "   4. Distribuer aux testeurs internes"
    echo ""
    echo "🔗 App Store Connect: https://appstoreconnect.apple.com"
else
    echo "🔴 Erreur lors de l'upload vers TestFlight"
    exit 1
fi
