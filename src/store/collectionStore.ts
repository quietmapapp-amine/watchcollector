import { create } from 'zustand';
import { WatchInstance } from '../types';
import { supabase } from '../services/supabase';

interface CollectionState {
  watches: WatchInstance[];
  loading: boolean;
  error: string | null;
  setWatches: (watches: WatchInstance[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadWatches: (userId: string) => Promise<void>;
  reset: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  watches: [],
  loading: false,
  error: null,
  
  setWatches: (watches) => set({ watches }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  loadWatches: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('watch_instance')
        .select(`
          *,
          model:model_id (
            name,
            reference,
            brand:brand_id (name)
          ),
          photos:photo (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      set({ watches: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  
  reset: () => set({ watches: [], loading: false, error: null }),
}));
