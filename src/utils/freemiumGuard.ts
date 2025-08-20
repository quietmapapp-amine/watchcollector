import { Alert } from "react-native";
import { useEntitlements } from "../hooks/useEntitlements";
import { supabase } from "../services/supabase";

export async function createWatch(payload: any, navigateToPaywall: () => void) {
  const { data, error } = await supabase.from("watch_instance").insert(payload).select().maybeSingle();
  if (error?.message?.includes("FREE_TIER_LIMIT_REACHED")) {
    navigateToPaywall(); 
    return;
  }
  if (error) Alert.alert("Erreur", error.message);
  return data;
}

// Example usage in AddWatch flow:
// import { createWatch } from '../utils/freemiumGuard';
// 
// const handleSubmit = async (watchData: any) => {
//   const result = await createWatch(watchData, () => {
//     navigation.navigate('Paywall');
//   });
//   if (result) {
//     // Success - watch created
//     navigation.goBack();
//   }
// };
