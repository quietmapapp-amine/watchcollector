import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";

export default function AuctionsScreen() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      await fetch("/functions/v1/auction-calendar", { method: "POST" });
      const res = await fetch("/rest/v1/auction_events?select=*&order=event_date.asc");
      setRows(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  return (
    <ScrollView className="flex-1 bg-[#0B1220] px-5 pt-8">
      <Text className="text-white text-2xl mb-4">Calendrier des enchères</Text>
      <TouchableOpacity onPress={refresh} className="bg-blue-700 rounded-xl py-3 items-center mb-4"><Text className="text-white">{loading?"Mise à jour...":"Actualiser"}</Text></TouchableOpacity>
      {rows.map((r) => (
        <View key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
          <Text className="text-white font-semibold">{r.house} — {r.brand ?? ""} {r.model ?? ""} {r.model_ref ?? ""}</Text>
          <Text className="text-white/70">Date: {r.event_date}</Text>
          {!!r.lot_url && <Text onPress={() => Linking.openURL(r.lot_url)} className="text-blue-400 mt-2">Voir le lot</Text>}
        </View>
      ))}
    </ScrollView>
  );
}
