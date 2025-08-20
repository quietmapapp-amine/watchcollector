import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

export default function ComparePricesScreen() {
  const [brand, setBrand] = useState("");
  const [ref, setRef] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/functions/v1/price-comparator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brand, model_ref: ref })
      });
      setData(await res.json());
    } finally { setLoading(false); }
  };

  return (
    <ScrollView className="flex-1 bg-[#0B1220] px-5 pt-8">
      <Text className="text-white text-2xl mb-4">Comparateur de prix</Text>
      <TextInput value={brand} onChangeText={setBrand} placeholder="Marque" placeholderTextColor="#9aa0a6" className="text-white bg-white/5 border border-white/10 rounded-xl p-3 mb-3"/>
      <TextInput value={ref} onChangeText={setRef} placeholder="Référence (ex: 116610LN)" placeholderTextColor="#9aa0a6" className="text-white bg-white/5 border border-white/10 rounded-xl p-3 mb-3"/>
      <TouchableOpacity onPress={run} className="bg-blue-700 rounded-xl py-3 items-center mb-4">
        <Text className="text-white">{loading ? "Analyse..." : "Comparer"}</Text>
      </TouchableOpacity>
      {data && (
        <View className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <Text className="text-white mb-2">Médiane: {data.summary?.median ?? "-"}</Text>
          {Object.entries(data.by_source ?? {}).map(([k,v]: any) => (
            <Text className="text-white/80" key={k}>{k}: {v.count} annonces, min {v.min}, max {v.max}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
