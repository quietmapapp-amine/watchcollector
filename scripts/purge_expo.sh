#!/usr/bin/env bash
set -euo pipefail

echo "🧹 Purging Expo dependencies (safe backup)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "🔴 package.json not found"
    exit 1
fi

# Create backup
BACKUP_FILE="package.json.backup-expo"
if [ -f "$BACKUP_FILE" ]; then
    echo "⚠️  Backup already exists: $BACKUP_FILE"
    echo "   Renaming existing backup..."
    mv "$BACKUP_FILE" "${BACKUP_FILE}.$(date +%Y%m%d_%H%M%S)"
fi

cp package.json "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Remove Expo dependencies
echo "🗑️  Removing Expo dependencies..."

# Remove expo-related deps
npm uninstall expo expo-constants expo-file-system expo-image expo-keep-awake expo-modules-core expo-secure-store expo-sharing expo-status-bar expo-updates || true

# Remove EAS dependencies
npm uninstall @expo/cli eas-cli || true

# Remove Expo dev dependencies
npm uninstall @expo/config @expo/dev-server @expo/metro-config @expo/prebuild-config || true

# Remove Expo scripts
echo "📝 Updating package.json scripts..."

# Create temporary package.json without Expo scripts
node -e "
const pkg = require('./package.json');

// Remove Expo-related scripts
const expoScripts = ['start', 'android', 'ios', 'web', 'eject', 'prebuild', 'build:android', 'build:ios', 'eas'];
expoScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
        console.log(\`Removing script: \${script}\`);
        delete pkg.scripts[script];
    }
});

// Keep only essential scripts
const keepScripts = ['lint', 'lint:fix', 'format', 'type-check', 'test', 'test:watch'];
const newScripts = {};
keepScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
        newScripts[script] = pkg.scripts[script];
    }
});

// Add native iOS scripts
newScripts['ios:pods'] = 'cd ios && bundle exec pod install';
newScripts['ios:bump'] = 'bundle exec fastlane ios bump_build';
newScripts['ios:build'] = 'bundle exec fastlane ios build';
newScripts['ios:upload'] = 'bundle exec fastlane ios upload_testflight';
newScripts['ios:release'] = 'bundle exec fastlane ios release';

pkg.scripts = newScripts;

// Write updated package.json
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

echo "✅ Expo dependencies and scripts removed"
echo "📋 Summary of changes:"
echo "   - Removed all expo/* packages"
echo "   - Removed EAS CLI"
echo "   - Removed Expo scripts (start, android, ios, web, prebuild)"
echo "   - Added native iOS scripts (ios:pods, ios:build, ios:release)"
echo "   - Backup saved to: $BACKUP_FILE"
echo ""
echo "💡 Next steps:"
echo "   1) npm install (to clean up node_modules)"
echo "   2) bash scripts/bootstrap_native_ios.sh"
echo "   3) gem install bundler && bundle install"
echo "   4) make setup-ios"
