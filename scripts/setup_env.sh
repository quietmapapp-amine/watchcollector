#!/bin/bash

# Script pour configurer le fichier .env avec les vraies valeurs pour TestFlight

ENV_FILE=".env"

# Vérifier si le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "🔴 Fichier .env non trouvé. Création..."
    touch "$ENV_FILE"
fi

# Fonction pour ajouter ou mettre à jour une variable
set_env_var() {
    local key="$1"
    local value="$2"
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Variable existe, la mettre à jour
        sed -i.bak "s/^${key}=.*/${key}=${value}/" "$ENV_FILE"
        echo "✅ Mise à jour: ${key}=${value}"
    else
        # Variable n'existe pas, l'ajouter
        echo "${key}=${value}" >> "$ENV_FILE"
        echo "✅ Ajout: ${key}=${value}"
    fi
}

echo "🔧 Configuration du fichier .env pour TestFlight..."

# Variables Expo (garder celles existantes)
set_env_var "EXPO_PUBLIC_SUPABASE_URL" "https://bdkmcauinpwvzbmgxzfl.supabase.co"
set_env_var "EXPO_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka21jYXVpbnB3dnpibWd4emZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDk2NzUsImV4cCI6MjA3MTI4NTY3NX0._8vSYhPiPf2V9Y8Ms4w_ScZ991WMYO8LXWIUNS9Uls0"
set_env_var "EXPO_PUBLIC_ONESIGNAL_APP_ID" "<TO_FILL>"
set_env_var "EXPO_PUBLIC_POSTHOG_KEY" "<TO_FILL>"

# Variables Fastlane
set_env_var "APP_IDENTIFIER" "com.unishopllc.watchcollector"
set_env_var "SCHEME" "watchcollector"
set_env_var "XCWORKSPACE_PATH" "ios/WatchCollector.xcworkspace"
set_env_var "XCODEPROJ_PATH" "ios/WatchCollector.xcodeproj"

# Variables Apple
set_env_var "APPLE_TEAM_ID" "36UJXYW4LH"
set_env_var "APPLE_ID" "laimene.amine@gmail.com"
set_env_var "ASC_KEY_ID" "AMLL88JSZ2"
set_env_var "ASC_ISSUER_ID" "e4a52e94-36ca-4faa-8824-06703796e27a"
set_env_var "ASC_KEY_FILE" ".private/appstoreconnect_api_key.p8"

# Variables optionnelles
set_env_var "TF_CHANGELOG" "WatchCollector internal build"

echo ""
echo "✅ Configuration terminée !"
echo "📁 Fichier .env mis à jour avec succès."
echo ""
echo "🔍 Vérification des variables critiques..."
echo "   Bundle ID: $(grep "^APP_IDENTIFIER=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Team ID: $(grep "^APPLE_TEAM_ID=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Apple ID: $(grep "^APPLE_ID=" "$ENV_FILE" | cut -d'=' -f2)"
echo ""
echo "⚠️  N'oubliez pas de:"
echo "   1. Remplir EXPO_PUBLIC_ONESIGNAL_APP_ID"
echo "   2. Remplir EXPO_PUBLIC_POSTHOG_KEY"
echo "   3. Vérifier que .private/appstoreconnect_api_key.p8 existe"
