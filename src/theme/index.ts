import { ThemeConfig, ThemeConfigs } from '../types';

export const themeConfigs: ThemeConfigs = {
  atelier_horloger: {
    name: 'Atelier Horloger',
    background: '#0B1220',
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    accentColor: '#E8D9B5',
    iconStyle: 'classic',
    border: 'rgba(255, 255, 255, 0.1)'
  },
  coffre_fort: {
    name: 'Coffre-fort',
    background: '#1C1F26',
    cardBackground: 'rgba(0, 0, 0, 0.3)',
    accentColor: '#2E7D32',
    iconStyle: 'modern',
    border: 'rgba(255, 255, 255, 0.1)'
  },
  catalogue_vintage: {
    name: 'Catalogue Vintage',
    background: '#2D1810',
    cardBackground: 'rgba(139, 69, 19, 0.1)',
    accentColor: '#D4AF37',
    iconStyle: 'vintage',
    border: 'rgba(255, 255, 255, 0.1)'
  }
};

export const getThemeColors = (theme: keyof ThemeConfigs) => {
  const config = themeConfigs[theme];
  
  return {
    primary: config.accentColor,
    background: config.background,
    cardBackground: config.cardBackground,
    text: '#FFFFFF',
    textSecondary: '#A7B0B7',
    border: config.border,
    success: '#2E7D32',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3'
  };
};

export const getThemeIcons = (theme: keyof ThemeConfigs) => {
  const config = themeConfigs[theme];
  
  switch (config.iconStyle) {
    case 'classic':
      return {
        home: '🏠',
        collection: '⌚',
        dashboard: '📊',
        maintenance: '🔧',
        alerts: '🔔',
        social: '👥',
        settings: '⚙️',
        paywall: '💎'
      };
    
    case 'modern':
      return {
        home: '🏠',
        collection: '⌚',
        dashboard: '📊',
        maintenance: '🔧',
        alerts: '🔔',
        social: '👥',
        settings: '⚙️',
        paywall: '💎'
      };
    
    case 'vintage':
      return {
        home: '🏠',
        collection: '⌚',
        dashboard: '📊',
        maintenance: '🔧',
        alerts: '🔔',
        social: '👥',
        settings: '⚙️',
        paywall: '💎'
      };
    
    default:
      return {
        home: '🏠',
        collection: '⌚',
        dashboard: '📊',
        maintenance: '🔧',
        alerts: '🔔',
        social: '👥',
        settings: '⚙️',
        paywall: '💎'
      };
  }
};

export const getThemeStyles = (theme: keyof ThemeConfigs) => {
  const config = themeConfigs[theme];
  
  return {
    card: {
      backgroundColor: config.cardBackground,
      borderColor: config.border,
      borderRadius: 16,
      borderWidth: 1,
      shadowColor: config.accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4
    },
    button: {
      backgroundColor: config.accentColor,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const
    },
    input: {
      backgroundColor: config.cardBackground,
      borderColor: config.border,
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      color: '#FFFFFF',
      fontSize: 16
    }
  };
};
