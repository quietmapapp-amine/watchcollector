import { useEffect, useMemo } from "react";
import { useEntitlementsStore, setTier } from "../store/entitlements";
import { useCollectionStore } from "../store/collectionStore";
// Fetch profile.tier from Supabase and keep in sync
import { supabase } from "../services/supabase"; // assume exists

export function useEntitlements() {
  const { tier, isPremium, maxFreeWatches } = useEntitlementsStore();
  const { watches } = useCollectionStore();
  
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profile").select("tier").eq("id", user.id).maybeSingle();
      if (data?.tier) {
        // @ts-ignore
        setTier(data.tier);
      }
    })();
  }, []);
  
  const canAddWatch = useMemo(() => {
    if (isPremium) return true;
    return watches.length < maxFreeWatches;
  }, [isPremium, watches.length, maxFreeWatches]);
  
  const showPaywall = () => {
    // This would typically navigate to the paywall screen
    console.log('Show paywall - user at free limit');
  };
  
  return useMemo(() => ({ 
    tier, 
    isPremium, 
    maxFreeWatches,
    canAddWatch,
    showPaywall
  }), [tier, isPremium, maxFreeWatches, canAddWatch, showPaywall]);
}
