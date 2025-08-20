export interface User {
  id: string;
  email: string;
  pseudo: string;
  lang: 'fr' | 'en';
  is_public: boolean;
  is_premium: boolean;
  theme: 'atelier_horloger' | 'coffre_fort' | 'catalogue_vintage';
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Caliber {
  id: string;
  name: string;
  service_interval_months?: number;
  service_cost_low?: number;
  service_cost_high?: number;
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  reference?: string;
  caliber_id?: string;
  year_start?: number;
  year_end?: number;
  brand?: Brand;
  caliber?: Caliber;
}

export interface WatchInstance {
  id: string;
  user_id: string;
  model_id?: string;
  serial?: string;
  serial_hash?: string;
  encrypted_serial?: string;
  purchase_price?: number;
  purchase_currency: string;
  purchase_date?: string;
  box_papers?: boolean;
  condition: 'new' | 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  notes?: string;
  visibility: 'private' | 'friends' | 'public';
  created_at: string;
  model?: Model;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  watch_instance_id: string;
  url: string;
  is_cover: boolean;
  credits?: string;
  license?: string;
  created_at: string;
}

export interface ServiceRule {
  id: string;
  brand_id: string;
  caliber_id: string;
  interval_months?: number;
  cost_low?: number;
  cost_high?: number;
}

export interface ServiceEvent {
  id: string;
  watch_instance_id: string;
  date?: string;
  type?: string;
  cost?: number;
  workshop_name?: string;
  notes?: string;
  created_at: string;
}

export interface PriceSnapshot {
  id: string;
  model_id: string;
  captured_at: string;
  median?: number;
  p25?: number;
  p75?: number;
  sample_size?: number;
  source_breakdown?: Record<string, number>;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  model_id: string;
  direction: 'above' | 'below' | 'delta';
  threshold_numeric?: number;
  active: boolean;
  created_at: string;
  model?: Model;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  friend?: User;
}

export interface ShareToken {
  id: string;
  user_id: string;
  token: string;
  expires_at?: string;
}

// New extended types
export interface Badge {
  id: string;
  name: string;
  rule: string;
  icon_url?: string;
  description: string;
  category: 'collection' | 'social' | 'premium' | 'achievement';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
  badge?: Badge;
}

export interface ExportLog {
  id: string;
  user_id: string;
  export_type: 'csv' | 'pdf';
  file_hash: string;
  file_size?: number;
  exported_at: string;
  metadata?: Record<string, any>;
}

export interface InsightsNotification {
  id: string;
  user_id: string;
  type: 'price_change' | 'maintenance_due' | 'collection_insight' | 'badge_unlocked';
  title: string;
  message: string;
  data?: Record<string, any>;
  sent_at: string;
  read_at?: string;
}

export interface MarketMetrics {
  id: string;
  model_id: string;
  captured_at: string;
  liquidity_index?: number;
  rarity_index?: number;
  active_listings_count?: number;
  volume_sold_12m?: number;
  market_trend: 'rising' | 'stable' | 'declining';
}

export interface MarketBaseline {
  id: string;
  date: string;
  gold_price_eur?: number;
  sp500_price_eur?: number;
  created_at: string;
}

export interface PortfolioHealth {
  id: string;
  user_id: string;
  captured_at: string;
  sport_percentage?: number;
  dress_percentage?: number;
  vintage_percentage?: number;
  concentration_risk: 'low' | 'medium' | 'high';
  diversification_score?: number;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface CollectionState {
  watches: WatchInstance[];
  loading: boolean;
  error: string | null;
}

export interface DashboardState {
  totalValue: number;
  watchCount: number;
  brandBreakdown: Array<{ brand: string; count: number; value: number }>;
  recentActivity: Array<{ type: string; watch: string; date: string }>;
  portfolioHealth?: PortfolioHealth;
  marketPerformance?: {
    vsGold: number;
    vsSP500: number;
    period: string;
  };
}

export interface BadgeState {
  badges: UserBadge[];
  unlockedCount: number;
  loading: boolean;
  error: string | null;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

// Theme configuration types
export interface ThemeConfig {
  name: string;
  background: string;
  cardBackground: string;
  accentColor: string;
  iconStyle: string;
  border: string;
}

export interface ThemeConfigs {
  atelier_horloger: ThemeConfig;
  coffre_fort: ThemeConfig;
  catalogue_vintage: ThemeConfig;
}
