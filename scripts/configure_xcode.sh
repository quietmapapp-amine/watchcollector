#!/bin/bash

# Script pour configurer automatiquement le projet Xcode

set -e

echo "🔧 Configuration automatique du projet Xcode..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "ios" ]; then
    echo "🔴 Répertoire ios/ non trouvé. Exécutez ce script depuis la racine du projet."
    exit 1
fi

cd ios

# Vérifier que le projet existe
if [ ! -d "WatchCollector.xcodeproj" ]; then
    echo "🔴 Projet WatchCollector.xcodeproj non trouvé."
    exit 1
fi

echo "✅ Projet Xcode trouvé: WatchCollector.xcodeproj"

# Charger les variables d'environnement
if [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
    echo "✅ Variables d'environnement chargées"
else
    echo "🔴 Fichier .env non trouvé"
    exit 1
fi

# Vérifier les variables critiques
if [ -z "$APPLE_TEAM_ID" ] || [ -z "$APP_IDENTIFIER" ]; then
    echo "🔴 Variables APPLE_TEAM_ID ou APP_IDENTIFIER manquantes dans .env"
    exit 1
fi

echo "✅ Variables configurées:"
echo "   Team ID: $APPLE_TEAM_ID"
echo "   Bundle ID: $APP_IDENTIFIER"

echo ""
echo "🔧 Configuration du projet avec xcodeproj..."

# Utiliser xcodeproj pour configurer automatiquement le projet
# Note: Cette approche nécessite l'outil xcodeproj Ruby gem
# Si pas disponible, on utilise une approche manuelle

if command -v xcodeproj &> /dev/null; then
    echo "📱 Configuration automatique avec xcodeproj..."
    
    # Configurer le bundle identifier
    xcodeproj set_build_setting "PRODUCT_BUNDLE_IDENTIFIER" "$APP_IDENTIFIER" --target "WatchCollector"
    
    # Configurer le team ID
    xcodeproj set_build_setting "DEVELOPMENT_TEAM" "$APPLE_TEAM_ID" --target "WatchCollector"
    
    # Activer la signature automatique
    xcodeproj set_build_setting "CODE_SIGN_STYLE" "Automatic" --target "WatchCollector"
    
    echo "✅ Configuration automatique terminée"
else
    echo "⚠️  xcodeproj non disponible. Configuration manuelle requise."
    echo ""
    echo "📋 Instructions de configuration manuelle:"
    echo "   1. Ouvrir ios/WatchCollector.xcworkspace dans Xcode"
    echo "   2. Sélectionner le target 'WatchCollector'"
    echo "   3. Aller dans 'Signing & Capabilities'"
    echo "   4. Cocher 'Automatically manage signing'"
    echo "   5. Sélectionner Team: $APPLE_TEAM_ID"
    echo "   6. Vérifier Bundle Identifier: $APP_IDENTIFIER"
    echo ""
    echo "💡 Après configuration, relancez: ./scripts/build_ios.sh"
    exit 0
fi

echo ""
echo "🎉 Configuration Xcode terminée !"
echo "📱 Le projet est maintenant configuré pour:"
echo "   - Team ID: $APPLE_TEAM_ID"
echo "   - Bundle ID: $APP_IDENTIFIER"
echo "   - Signature automatique: Activée"
echo ""
echo "🚀 Vous pouvez maintenant lancer: ./scripts/build_ios.sh"
