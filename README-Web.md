# WatchCollector – Web Preview (react-native-web)

Ce projet ajoute un preview Web dev-only utilisant react-native-web + webpack (pas d'Expo).

## 🚀 **Prérequis**

- **Node.js** : Version 18+ recommandée
- **npm** : Gestionnaire de paquets
- **Projet React Native** : Déjà configuré avec App.tsx/App.js

## 📦 **Installation**

```bash
cd /Users/amine/Projects/WatchCollector
npm install
```

## 🌐 **Lancement du Preview Web**

```bash
# Démarrer le serveur de développement (avec fallback)
npm run web

# Démarrer avec la vraie UI (sans mock data)
npm run web:clean

# Démarrer avec la vraie UI + mock data activé
npm run web:full

# Le navigateur s'ouvrira automatiquement sur http://localhost:5173
```

## 🏗️ **Build de Production**

```bash
# Construire pour la production
npm run web:build

# Les fichiers seront générés dans web/dist/
```

## 📁 **Structure des Fichiers**

```
web/
├── index.html              # Template HTML
├── index.web.tsx           # Point d'entrée Web
├── global.css              # Styles globaux
├── webpack.config.js       # Configuration Webpack
└── dist/                   # Build de production (généré)
```

## ⚙️ **Configuration**

### **Webpack**
- **Mode** : Development avec hot reload
- **Port** : 5173
- **Alias** : `react-native` → `react-native-web`
- **Extensions** : Support .tsx, .ts, .jsx, .js
- **Shims** : Modules natifs mappés vers des stubs sécurisés

### **Shims et Stubs**
- **AsyncStorage** : Store en mémoire pour le web
- **Maps** : Composant stub pour les cartes
- **Modules natifs** : Proxies no-op pour éviter les crashes
- **Configuration** : Alias automatiques dans webpack

### **Babel**
- **Presets** : Expo, Env, React, TypeScript
- **Plugins** : NativeWind, Transform Runtime

## 🔍 **Détection Automatique**

Le système détecte automatiquement :
- **TypeScript** : Si `tsconfig.json` existe
- **App Component** : Dans `./App.tsx` ou `./src/App.tsx`
- **Configuration** : Babel et Webpack adaptés

## 🚨 **Limitations et Notes**

### **Modules Natifs**
- ❌ **Pas de support** pour les modules natifs iOS/Android
- ❌ **Pas de support** pour les APIs spécifiques aux plateformes
- ✅ **Support** pour react-native-web équivalents
- ✅ **Shims** : Stubs sécurisés pour éviter les crashes

### **Scripts Disponibles**
- **`npm run web`** : Mode fallback (App.web.tsx si App.tsx échoue)
- **`npm run web:clean`** : Vraie UI sans mock data (peut échouer si APIs non disponibles)
- **`npm run web:full`** : Vraie UI avec mock data activé (recommandé pour le développement)
- **`npm run web:build`** : Build de production

### **Validation UI**
- ✅ **Composants React Native** : Rendu en HTML/CSS
- ✅ **Navigation** : Via react-navigation
- ✅ **Styling** : NativeWind/Tailwind CSS
- ✅ **État** : Zustand stores

### **Pipeline iOS/Android**
- ✅ **Non affecté** : Configuration iOS/Android intacte
- ✅ **Développement parallèle** : Web preview + builds natifs
- ✅ **Expo** : Compatible avec `expo start`

## 🐛 **Dépannage**

### **Erreur: "App component not found"**
```bash
# Vérifier que App.tsx existe à la racine
ls -la App.tsx

# Ou créer le composant App
touch App.tsx
```

### **Erreur: "Module not found"**
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### **Erreur: "Port already in use"**
```bash
# Changer le port dans web/webpack.config.js
port: 3000  # au lieu de 5173
```

### **Erreur: "Babel preset not found"**
```bash
# Vérifier la configuration Babel
cat babel.config.js

# Réinstaller les presets Babel
npm install --save-dev @babel/preset-env @babel/preset-react @babel/preset-typescript
```

## 🔧 **Personnalisation**

### **Changer le Port**
```javascript
// web/webpack.config.js
devServer: {
  port: 3000,  // Nouveau port
  // ...
}
```

### **Ajouter des Variables d'Environnement**
```javascript
// web/webpack.config.js
const webpack = require('webpack');

plugins: [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
]
```

### **Modifier le Template HTML**
```html
<!-- web/index.html -->
<title>Mon App – Web Preview</title>
<meta name="description" content="Description de l'app" />
```

## 📚 **Ressources**

- [react-native-web](https://github.com/necolas/react-native-web)
- [Webpack Documentation](https://webpack.js.org/)
- [Babel Documentation](https://babeljs.io/)
- [React Native Web Guide](https://necolas.github.io/react-native-web/docs/)

## 🆘 **Support**

En cas de problème :
1. Vérifier la console du navigateur
2. Vérifier les logs du serveur webpack
3. Vérifier la configuration Babel
4. Vérifier que tous les fichiers web/ existent

---

**Note** : Ce preview Web est destiné au développement et à la validation UI. Pour la production, utilisez les builds iOS/Android natifs.
