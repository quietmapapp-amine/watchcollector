import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase";

export default function LeaderboardScreen() {
  const [rows, setRows] = useState<any[]>([]);
  
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("fn_friend_leaderboard");
      if (!error) setRows(data ?? []);
    })();
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Classement (amis)</Text>
      {rows.map((r, i) => (
        <View key={r.friend_id} style={styles.leaderboardItem}>
          <Text style={styles.rankText}>#{i+1} — {r.friend_id}</Text>
          <Text style={styles.statsText}>Montres: {r.total_watches}</Text>
          <Text style={styles.statsText}>Vintage/Sport/Dress: {r.vintage_count}/{r.sport_count}/{r.dress_count}</Text>
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
  leaderboardItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
});
