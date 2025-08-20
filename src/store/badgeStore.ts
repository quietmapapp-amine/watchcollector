import { create } from 'zustand';
import { Badge, UserBadge } from '../types';
import { supabase } from '../services/supabase';

interface BadgeState {
  badges: UserBadge[];
  unlockedCount: number;
  loading: boolean;
  error: string | null;
  setBadges: (badges: UserBadge[]) => void;
  addBadge: (badge: UserBadge) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadUserBadges: (userId: string) => Promise<void>;
  checkAndUnlockBadges: (userId: string, watches: any[]) => Promise<void>;
  reset: () => void;
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  badges: [],
  unlockedCount: 0,
  loading: false,
  error: null,
  
  setBadges: (badges) => set({ badges, unlockedCount: badges.length }),
  
  addBadge: (badge) => set((state) => ({
    badges: [...state.badges, badge],
    unlockedCount: state.unlockedCount + 1
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  loadUserBadges: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('user_badge')
        .select(`
          *,
          badge:badge_id (*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      
      set({ badges: data || [], unlockedCount: (data || []).length });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  checkAndUnlockBadges: async (userId: string, watches: any[]) => {
    try {
      // Get all available badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badge')
        .select('*');
      
      if (badgesError) throw badgesError;
      
      // Get user's current badges
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badge')
        .select('badge_id')
        .eq('user_id', userId);
      
      if (userBadgesError) throw userBadgesError;
      
      const unlockedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
      const newBadges: Badge[] = [];
      
      // Check each badge rule
      for (const badge of allBadges || []) {
        if (unlockedBadgeIds.has(badge.id)) continue;
        
        if (checkBadgeRule(badge, watches)) {
          newBadges.push(badge);
        }
      }
      
      // Unlock new badges
      for (const badge of newBadges) {
        const { error: unlockError } = await supabase
          .from('user_badge')
          .insert({
            user_id: userId,
            badge_id: badge.id
          });
        
        if (!unlockError) {
          // Add to local state
          get().addBadge({
            id: crypto.randomUUID(),
            user_id: userId,
            badge_id: badge.id,
            unlocked_at: new Date().toISOString(),
            badge
          });
          
          // Send notification
          await sendBadgeNotification(userId, badge);
        }
      }
    } catch (error: any) {
      console.error('Error checking badges:', error);
    }
  },
  
  reset: () => set({ badges: [], unlockedCount: 0, loading: false, error: null }),
}));

// Badge rule checking logic
function checkBadgeRule(badge: Badge, watches: any[]): boolean {
  const watchCount = watches.length;
  const brandCounts = new Map<string, number>();
  const styleCounts = new Map<string, number>();
  
  // Count brands and styles
  watches.forEach(watch => {
    if (watch.model?.brand?.name) {
      const brand = watch.model.brand.name;
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    }
    
    // Determine style (simplified logic)
    const style = determineWatchStyle(watch);
    if (style) {
      styleCounts.set(style, (styleCounts.get(style) || 0) + 1);
    }
  });
  
  // Check rules
  switch (badge.name) {
    case 'Premier Pas':
      return watchCount >= 1;
    
    case 'Collectionneur':
      return watchCount >= 5;
    
    case 'Passionné':
      return watchCount >= 10;
    
    case 'Expert':
      return watchCount >= 20;
    
    case 'Rolex Addict':
      return (brandCounts.get('Rolex') || 0) >= 5;
    
    case 'Omega Enthusiast':
      return (brandCounts.get('Omega') || 0) >= 3;
    
    case 'Patek Collector':
      return (brandCounts.get('Patek Philippe') || 0) >= 2;
    
    case 'Swiss Made':
      return watchCount >= 10; // Simplified - assume all are Swiss
    
    case 'Sportif':
      return (styleCounts.get('sport') || 0) >= 5;
    
    case 'Élégant':
      return (styleCounts.get('dress') || 0) >= 5;
    
    case 'Vintage Lover':
      return (styleCounts.get('vintage') || 0) >= 5;
    
    case 'Diver King':
      return (styleCounts.get('dive') || 0) >= 3;
    
    default:
      return false;
  }
}

// Determine watch style based on model characteristics
function determineWatchStyle(watch: any): string | null {
  const modelName = watch.model?.name?.toLowerCase() || '';
  const reference = watch.model?.reference || '';
  
  // Sport watches
  if (modelName.includes('submariner') || modelName.includes('seamaster') || 
      modelName.includes('speedmaster') || modelName.includes('diver') ||
      modelName.includes('gmt') || modelName.includes('chronograph')) {
    return 'sport';
  }
  
  // Dress watches
  if (modelName.includes('datejust') || modelName.includes('calatrava') ||
      modelName.includes('tank') || modelName.includes('constellation')) {
    return 'dress';
  }
  
  // Vintage watches (pre-1990)
  if (watch.model?.year_start && watch.model.year_start < 1990) {
    return 'vintage';
  }
  
  // Dive watches (specific models)
  if (modelName.includes('submariner') || modelName.includes('seamaster') ||
      modelName.includes('diver') || reference.includes('300M')) {
    return 'dive';
  }
  
  return null;
}

// Send badge notification
async function sendBadgeNotification(userId: string, badge: Badge) {
  try {
    // Create insights notification
    await supabase
      .from('insights_notification')
      .insert({
        user_id: userId,
        type: 'badge_unlocked',
        title: 'Nouveau badge débloqué !',
        message: `Félicitations ! Vous avez débloqué le badge "${badge.name}" : ${badge.description}`,
        data: { badge_id: badge.id, badge_name: badge.name }
      });
    
    // TODO: Send push notification via OneSignal
    console.log(`Badge unlocked: ${badge.name} for user ${userId}`);
  } catch (error) {
    console.error('Error sending badge notification:', error);
  }
}
