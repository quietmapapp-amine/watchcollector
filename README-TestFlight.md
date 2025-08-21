# WatchCollector iOS TestFlight Deployment

Ce guide détaille la configuration et l'utilisation de la chaîne de release iOS avec Fastlane pour déployer WatchCollector sur TestFlight.

## 🚀 **Prérequis**

### **Xcode & Apple Developer**
- ✅ **Xcode** installé et à jour (dernière version stable)
- ✅ **Apple Developer Program** actif (99$/an)
- ✅ **Compte Apple ID** connecté dans Xcode (Preferences > Accounts)
- ✅ **App record** créé dans App Store Connect avec le même Bundle ID que `APP_IDENTIFIER`

### **Outils de Build**
- ✅ **Ruby** (version 2.7+ recommandée)
- ✅ **Bundler** (`gem install bundler`)
- ✅ **CocoaPods** (`gem install cocoapods`)

## 🔧 **Installation de la Toolchain**

### **1. Installation des dépendances Ruby**
```bash
cd /Users/amine/Projects/WatchCollector
gem install bundler
bundle install
```

### **2. Configuration des variables d'environnement**
```bash
# Copier le fichier de configuration par défaut
cp .env.default .env

# Éditer .env avec vos vraies valeurs
nano .env  # ou vim .env, ou ouvrir dans votre éditeur préféré
```

### **3. Configuration des clés App Store Connect**
```bash
# Éditer le fichier de clé API
nano .private/appstoreconnect_api_key.p8

# Coller le contenu de votre clé .p8 téléchargée depuis App Store Connect
# Format attendu: contenu brut du fichier .p8
```

## 📱 **Variables d'Environnement Requises**

### **Identifiants de l'App**
```bash
APP_IDENTIFIER=com.votreentreprise.watchcollector  # Bundle ID de votre app
SCHEME=WatchCollector                              # Nom du scheme Xcode
```

### **Apple Developer**
```bash
APPLE_TEAM_ID=XXXXXXXXXX                           # Team ID (10 chiffres)
APPLE_ID=votre-email@example.com                   # Email de votre compte Apple Developer
```

### **App Store Connect API Key**
```bash
ASC_KEY_ID=AAAAAAAAAA                              # Key ID (10 caractères)
ASC_ISSUER_ID=00000000-0000-0000-0000-000000000000 # Issuer ID (UUID)
ASC_KEY_FILE=.private/appstoreconnect_api_key.p8    # Chemin vers votre clé .p8
```

## 🏗️ **Génération du Projet iOS Natif**

### **Option 1: Expo Prebuild (Recommandé)**
```bash
# Générer le projet iOS natif
npx expo prebuild --platform ios

# Vérifier que le dossier ios/ a été créé
ls -la ios/
```

### **Option 2: Expo Run (Alternative)**
```bash
# Lancer sur iOS (génère automatiquement le projet natif)
npx expo run:ios
```

## 📦 **Installation des CocoaPods**

```bash
# Installer les dépendances iOS
cd ios
bundle exec pod install

# Vérifier que le workspace a été créé
ls -la *.xcworkspace
```

## 🚀 **Commandes de Build et Deploy**

### **Scripts NPM (Recommandés)**
```bash
# Installation des pods
npm run ios:pods

# Incrémentation du numéro de build
npm run ios:bump

# Build de l'IPA
npm run ios:build

# Upload vers TestFlight
npm run ios:upload

# Pipeline complet
npm run ios:release
```

### **Makefile (Alternatif)**
```bash
# Aide
make help

# Setup initial
make setup-ios

# Pipeline complet
make release
```

### **Fastlane Direct**
```bash
# Lanes individuelles
bundle exec fastlane ios pods
bundle exec fastlane ios bump_build
bundle exec fastlane ios build
bundle exec fastlane ios upload_testflight

# Pipeline complet
bundle exec fastlane ios release
```

## 🔍 **Vérification et Debug**

### **Structure des Fichiers Attendue**
```
ios/
├── WatchCollector.xcworkspace     # Workspace CocoaPods
├── WatchCollector.xcodeproj/      # Projet Xcode
├── WatchCollector/                 # Code source natif
├── Podfile                        # Dépendances CocoaPods
├── exportOptions.plist            # Options d'export
└── Pods/                          # Dépendances installées
```

### **Vérification du Build**
```bash
# Vérifier que l'IPA a été créé
ls -la build/WatchCollector.ipa

# Vérifier la taille et les métadonnées
file build/WatchCollector.ipa
```

### **Logs et Rapports**
```bash
# Logs Fastlane
tail -f fastlane/report.xml

# Logs de build
tail -f fastlane/test_output/*.log
```

## 🚨 **Dépannage Commun**

### **Erreur: "No such file or directory: ios/"**
```bash
# Le projet iOS natif n'existe pas encore
npx expo prebuild --platform ios
```

### **Erreur: "Could not find a valid iOS project"**
```bash
# Vérifier les chemins dans .env
cat .env | grep XCODE

# Corriger les chemins si nécessaire
# Exemple: XCWORKSPACE_PATH=ios/WatchCollector.xcworkspace
```

### **Erreur: "No provisioning profile found"**
```bash
# Vérifier la signature automatique dans Xcode
# Ouvrir ios/WatchCollector.xcworkspace
# Sélectionner le target WatchCollector
# Signing & Capabilities > Automatically manage signing
```

### **Erreur: "Invalid API key"**
```bash
# Vérifier le contenu de la clé .p8
cat .private/appstoreconnect_api_key.p8

# Vérifier les variables ASC_* dans .env
cat .env | grep ASC_
```

## 📋 **Checklist de Déploiement**

### **Avant le Build**
- [ ] Variables d'environnement configurées dans `.env`
- [ ] Clé API App Store Connect dans `.private/appstoreconnect_api_key.p8`
- [ ] Projet iOS natif généré (`ios/` folder exists)
- [ ] CocoaPods installés (`ios/Pods/` folder exists)
- [ ] Workspace Xcode créé (`*.xcworkspace` exists)

### **Avant l'Upload**
- [ ] IPA buildé avec succès (`build/WatchCollector.ipa` exists)
- [ ] Numéro de build incrémenté
- [ ] Configuration Release sélectionnée
- [ ] Signing automatique activé dans Xcode

### **Après l'Upload**
- [ ] Build visible dans App Store Connect
- [ ] Build traité avec succès (pas d'erreurs de validation)
- [ ] TestFlight accessible aux testeurs internes
- [ ] Notifications envoyées aux testeurs

## 🔐 **Sécurité**

### **Fichiers à ne JAMAIS commiter**
- ✅ `.env` (contient vos vraies clés)
- ✅ `.private/appstoreconnect_api_key.p8` (clé API privée)
- ✅ `ios/Pods/` (dépendances CocoaPods)
- ✅ `build/` (artefacts de build)
- ✅ `*.ipa`, `*.xcarchive` (builds)

### **Fichiers sécurisés par .gitignore**
- ✅ `.env*` (sauf `.env.default`)
- ✅ `.private/`
- ✅ `ios/Pods/`
- ✅ `build/`
- ✅ `*.ipa`, `*.xcarchive`

## 📚 **Ressources Additionnelles**

- [Documentation Fastlane](https://docs.fastlane.tools/)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [CocoaPods](https://cocoapods.org/)

## 🆘 **Support**

En cas de problème :
1. Vérifier les logs Fastlane dans `fastlane/`
2. Vérifier la configuration dans `.env`
3. Vérifier la structure du projet iOS
4. Consulter la documentation des outils utilisés

---

**Note**: Ce guide suppose que vous avez déjà un projet Expo configuré. Si ce n'est pas le cas, commencez par `npx create-expo-app@latest WatchCollector --template`.
