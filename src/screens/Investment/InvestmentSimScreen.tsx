import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

export default function InvestmentSimScreen() {
  const [ref, setRef] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [out, setOut] = useState<any>(null);

  const run = async () => {
    const res = await fetch("/functions/v1/investment-sim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model_ref: ref, date_purchase: date, price_purchase: Number(price) })
    });
    setOut(await res.json());
  };

  return (
    <ScrollView className="flex-1 bg-[#0B1220] px-5 pt-8">
      <Text className="text-white text-2xl mb-4">Simulation d'investissement</Text>
      <TextInput value={ref} onChangeText={setRef} placeholder="Référence" placeholderTextColor="#9aa0a6" className="text-white bg-white/5 border border-white/10 rounded-xl p-3 mb-3"/>
      <TextInput value={date} onChangeText={setDate} placeholder="Date d'achat (YYYY-MM-DD)" placeholderTextColor="#9aa0a6" className="text-white bg-white/5 border border-white/10 rounded-xl p-3 mb-3"/>
      <TextInput value={price} onChangeText={setPrice} placeholder="Prix d'achat (EUR)" keyboardType="numeric" placeholderTextColor="#9aa0a6" className="text-white bg-white/5 border border-white/10 rounded-xl p-3 mb-3"/>
      <TouchableOpacity onPress={run} className="bg-blue-700 rounded-xl py-3 items-center mb-4"><Text className="text-white">Calculer</Text></TouchableOpacity>
      {out && (
        <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Text className="text-white/80">Valeur actuelle estimée: {out.model_current_value ?? "—"}</Text>
          <Text className="text-white/80">Perf montre: {out.model_growth_pct != null ? Math.round(out.model_growth_pct*100)+"%" : "—"}</Text>
          <Text className="text-white/80">Perf Or: {out.gold_growth_pct != null ? Math.round(out.gold_growth_pct*100)+"%" : "—"}</Text>
          <Text className="text-white/80">Perf S&P500: {out.sp500_growth_pct != null ? Math.round(out.sp500_growth_pct*100)+"%" : "—"}</Text>
        </View>
      )}
    </ScrollView>
  );
}
