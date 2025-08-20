#!/bin/bash

# Watch Collector Setup Script
# This script sets up the development environment for the Watch Collector app

set -e

echo "🚀 Setting up Watch Collector development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📥 Installing Supabase CLI..."
    npm install -g supabase
else
    echo "✅ Supabase CLI is already installed"
fi

# Create necessary directories if they don't exist
echo "📁 Creating project structure..."
mkdir -p assets
mkdir -p src/{components,screens,hooks,store,services,i18n,theme,utils}

# Set up environment files
echo "🔧 Setting up environment files..."

# Create .env.example if it doesn't exist
if [ ! -f .env.example ]; then
    cat > .env.example << EOF
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id_here
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key_here
EOF
    echo "✅ Created .env.example"
fi

# Create supabase/.env.example if it doesn't exist
if [ ! -f supabase/.env.example ]; then
    cat > supabase/.env.example << EOF
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
RESEND_API_KEY=your_resend_api_key_here
ONESIGNAL_API_KEY=your_onesignal_api_key_here
EOF
    echo "✅ Created supabase/.env.example"
fi

# Set up Git hooks
echo "🔗 Setting up Git hooks..."
npx husky install

# Create basic assets
echo "🎨 Setting up basic assets..."
if [ ! -f assets/icon.png ]; then
    echo "⚠️  Please add your app icon to assets/icon.png"
fi

if [ ! -f assets/splash.png ]; then
    echo "⚠️  Please add your splash screen to assets/splash.png"
fi

if [ ! -f assets/adaptive-icon.png ]; then
    echo "⚠️  Please add your adaptive icon to assets/adaptive-icon.png"
fi

# Run initial checks
echo "🔍 Running initial checks..."
npm run type-check

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Configure your environment variables:"
echo "   - Copy .env.example to .env and fill in your values"
echo "   - Copy supabase/.env.example to supabase/.env and fill in your values"
echo ""
echo "2. Start Supabase locally:"
echo "   npm run supabase:start"
echo ""
echo "3. Apply database migrations:"
echo "   npm run db:migrate"
echo ""
echo "4. Seed initial data:"
echo "   npm run db:seed"
echo ""
echo "5. Start the development server:"
echo "   npm start"
echo ""
echo "Happy coding! ⌚"
