# Watch Collector

A premium horological collection management app built with Expo React Native and Supabase.

## Features

- **Collection Management**: Track your watch collection with detailed information
- **Price Monitoring**: Real-time price alerts and market value tracking
- **Maintenance Tracking**: Service history and maintenance reminders
- **Social Features**: Share collections and connect with other collectors
- **Premium Features**: Advanced analytics, unlimited watches, and export options
- **Multi-language**: French and English support
- **Dark Theme**: Premium horological design aesthetic

## Tech Stack

- **Frontend**: Expo React Native, TypeScript, NativeWind (Tailwind CSS)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: Zustand
- **Navigation**: React Navigation v6
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: i18next
- **Notifications**: OneSignal (push), Resend/Postmark (email)

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- Supabase CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WatchCollector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy and configure environment files
   cp .env.example .env
   cp supabase/.env.example supabase/.env
   ```

4. **Configure Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start Supabase locally
   npm run supabase:start
   
   # Apply database migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

## Environment Variables

### Client (.env)
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
```

### Supabase Functions (supabase/.env)
```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
ONESIGNAL_API_KEY=your_onesignal_api_key
```

## Database Schema

The app uses a comprehensive database schema with the following main tables:

- **brand**: Watch brands (Rolex, Omega, etc.)
- **model**: Watch models with references
- **watch_instance**: User's watch collection
- **price_snapshot**: Market price data
- **price_alert**: User-configured price alerts
- **service_event**: Maintenance history
- **profile**: User profiles and preferences
- **friendship**: Social connections

## Edge Functions

### prices-snapshot
Fetches price data from multiple sources (eBay, WatchCharts) and stores snapshots.

### send-alerts
Processes price alerts and sends notifications via push and email.

### generate-pdf
Generates PDF inventory reports for users.

## Development

### Available Scripts

```bash
# Development
npm start                    # Start Expo development server
npm run ios                 # Run on iOS simulator
npm run android             # Run on Android emulator

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix ESLint issues
npm run format              # Format code with Prettier
npm run type-check          # TypeScript type checking

# Testing
npm test                    # Run tests
npm run test:watch          # Run tests in watch mode

# Database
npm run db:migrate          # Apply database migrations
npm run db:seed             # Seed database with initial data

# Supabase
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase
npm run functions:deploy    # Deploy edge functions
```

### Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # App screens
│   ├── Auth/          # Authentication
│   ├── Onboarding/    # User onboarding
│   ├── Collection/    # Watch collection
│   ├── AddWatch/      # Add new watch
│   ├── WatchDetail/   # Watch details
│   ├── Maintenance/   # Service tracking
│   ├── Dashboard/     # Analytics dashboard
│   ├── Alerts/        # Price alerts
│   ├── Social/        # Social features
│   ├── Settings/      # App settings
│   └── Paywall/       # Premium upgrade
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── services/           # API and external services
├── i18n/               # Internationalization
├── types/              # TypeScript type definitions
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions
├── migrations/         # Database migrations
└── seed/               # Seed data
```

## Freemium Model

- **Free Tier**: Up to 5 watches, basic features
- **Premium Tier**: €10/month, unlimited watches, advanced features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.

---

**Watch Collector v0.1** - MVP Release
