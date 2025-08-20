import { create } from "zustand";

type Tier = "free"|"standard"|"collector";
type Entitlements = { tier: Tier; maxFreeWatches: number; isPremium: boolean; };

export const useEntitlementsStore = create<Entitlements>(() => ({
  tier: "free", maxFreeWatches: 5, isPremium: false,
}));

export const setTier = (tier: Tier) => useEntitlementsStore.setState({ tier, isPremium: tier !== "free" });
