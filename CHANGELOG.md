# Changelog

All notable changes to the Watch Collector project will be documented in this file.

## [0.1.0] - 2024-01-XX

### Added
- Initial MVP release of Watch Collector
- Complete authentication flow with email/password and OAuth
- User onboarding with language selection and profile setup
- Watch collection management with CRUD operations
- Premium horological design system with dark theme
- Multi-language support (French/English)
- Supabase backend with comprehensive database schema
- Edge functions for pricing, alerts, and PDF generation
- Freemium model with 5-watch limit for free users
- Responsive UI components with NativeWind styling
- TypeScript throughout the codebase
- ESLint and Prettier configuration
- Comprehensive testing setup

### Features
- **Authentication**: Sign up, sign in, OAuth (Google/Apple)
- **Onboarding**: Language selection, unique username, profile visibility
- **Collection**: Add, edit, delete watches with photos
- **Dashboard**: Collection overview and value tracking
- **Maintenance**: Service history and reminders
- **Alerts**: Price monitoring and notifications
- **Social**: Public profiles and friend connections
- **Settings**: App preferences and data export
- **Paywall**: Premium upgrade flow

### Technical
- Expo React Native with latest SDK
- Supabase PostgreSQL database with RLS
- Edge functions for backend logic
- Zustand for state management
- React Navigation v6
- NativeWind for styling
- i18next for internationalization
- React Hook Form + Zod validation

### Known Limitations
- PDF generation currently returns mock URLs
- OneSignal and PostHog integration requires API keys
- eBay and WatchCharts integration uses mock data
- Payment processing not yet implemented
- Limited test coverage in initial release

---

## [Unreleased]

### Planned Features
- Advanced analytics and reporting
- Watch market value tracking
- Social sharing and discovery
- Advanced search and filtering
- Watch condition assessment tools
- Insurance and documentation features
- Community features and forums
