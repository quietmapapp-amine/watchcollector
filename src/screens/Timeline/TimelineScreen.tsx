import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function TimelineScreen() {
  const [items, setItems] = useState<any[]>([]);
  
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("watch_instance")
        .select("id,purchase_date,model:model_id(name,reference),brand:model_id!inner(brand_id)")
        .order("purchase_date", { ascending: false });
      setItems(data ?? []);
    })();
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Timeline</Text>
      {items.map((w, idx) => (
        <View key={w.id} style={styles.timelineItem}>
          <View style={styles.timelineConnector}>
            <View style={styles.timelineLine} />
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.watchName}>{w.model?.name ?? "Modèle"} ({w.model?.reference ?? "-"})</Text>
            <Text style={styles.watchDate}>Achetée le {w.purchase_date ?? "—"}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineConnector: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineLine: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
  },
  timelineContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  watchName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  watchDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
