#!/bin/bash

# Script pour nettoyer et recréer le fichier .env

ENV_FILE=".env"

echo "🧹 Nettoyage du fichier .env..."

# Sauvegarder l'ancien fichier
if [ -f "$ENV_FILE" ]; then
    mv "$ENV_FILE" "${ENV_FILE}.backup"
    echo "✅ Ancien fichier sauvegardé dans ${ENV_FILE}.backup"
fi

# Créer un nouveau fichier .env propre
cat > "$ENV_FILE" << 'EOF'
# === EXPO PUBLIC VARIABLES ===
EXPO_PUBLIC_SUPABASE_URL=https://bdkmcauinpwvzbmgxzfl.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka21jYXVpbnB3dnpibWd4emZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MDk2NzUsImV4cCI6MjA3MTI4NTY3NX0._8vSYhPiPf2V9Y8Ms4w_ScZ991WMYO8LXWIUNS9Uls0
EXPO_PUBLIC_ONESIGNAL_APP_ID=<TO_FILL>
EXPO_PUBLIC_POSTHOG_KEY=<TO_FILL>

# === IDENTIFIERS ===
APP_IDENTIFIER=com.unishopllc.watchcollector
SCHEME=WatchCollector
XCWORKSPACE_PATH=ios/WatchCollector.xcworkspace
XCODEPROJ_PATH=ios/WatchCollector.xcodeproj

# === APPLE / ASC (App Store Connect) ===
APPLE_TEAM_ID=36UJXYW4LH
APPLE_ID=laimene.amine@gmail.com
ASC_KEY_ID=AMLL88JSZ2
ASC_ISSUER_ID=e4a52e94-36ca-4faa-8824-06703796e27a
ASC_KEY_FILE=.private/appstoreconnect_api_key.p8

# === OPTIONAL ===
TF_CHANGELOG=WatchCollector internal build
EOF

echo "✅ Nouveau fichier .env créé avec succès !"
echo ""
echo "🔍 Contenu du fichier .env :"
echo "================================"
cat "$ENV_FILE"
echo "================================"
echo ""
echo "📋 Variables critiques configurées :"
echo "   Bundle ID: $(grep "^APP_IDENTIFIER=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Team ID: $(grep "^APPLE_TEAM_ID=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Apple ID: $(grep "^APPLE_ID=" "$ENV_FILE" | cut -d'=' -f2)"
echo "   Scheme: $(grep "^SCHEME=" "$ENV_FILE" | cut -d'=' -f2)"
echo ""
echo "⚠️  N'oubliez pas de :"
echo "   1. Remplir EXPO_PUBLIC_ONESIGNAL_APP_ID"
echo "   2. Remplir EXPO_PUBLIC_POSTHOG_KEY"
echo "   3. Vérifier que .private/appstoreconnect_api_key.p8 existe"
