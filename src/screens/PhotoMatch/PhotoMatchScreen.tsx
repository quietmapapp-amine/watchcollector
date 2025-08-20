import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { callPhotoMatch } from "../../services/functions";
import { supabase } from "../../services/supabase";

export default function PhotoMatchScreen({ navigation }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cands, setCands] = useState<any[]>([]);

  const pick = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const img = await ImagePicker.launchCameraAsync({ 
      quality: 0.7, 
      base64: true 
    });
    if (img.canceled) return;
    const asset = img.assets?.[0];
    if (!asset?.base64) return;
    
    setPreview(asset.uri ?? null);
    setLoading(true);
    try {
      const resp = await callPhotoMatch({ image_base64: asset.base64 });
      setCands(resp?.candidates ?? []);
    } catch (e:any) {
      setCands([]);
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  const select = async (c: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Insert a watch with suggested model_id (if found)
    const payload: any = { 
      user_id: user.id, 
      model_id: c.model_id ?? null, 
      notes: `AI match: ${c.brand} ${c.model} ${c.reference ?? ""}` 
    };
    
    const { error } = await supabase.from("watch_instance").insert(payload);
    if (error) {
      if (error.message?.includes("FREE_TIER_LIMIT_REACHED")) {
        Alert.alert(
          "Limite atteinte", 
          "Vous avez atteint la limite de 5 montres gratuites. Passez en Premium pour ajouter plus de montres.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Voir Premium", onPress: () => navigation.navigate("Paywall") }
          ]
        );
      } else {
        Alert.alert("Erreur", error.message);
      }
      return;
    }
    
    Alert.alert("Succès", "Montre ajoutée d'après la photo.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reconnaissance par photo</Text>
      <Text style={styles.subtitle}>Prends ta montre en photo — l'IA propose jusqu'à 3 modèles probables.</Text>

      {preview && (
        <Image source={{ uri: preview }} style={styles.previewImage} />
      )}
      
      {!preview && (
        <TouchableOpacity onPress={pick} style={styles.cameraButton}>
          <Text style={styles.cameraButtonText}>Prendre une photo</Text>
        </TouchableOpacity>
      )}
      
      {loading && (
        <Text style={styles.loadingText}>Analyse en cours…</Text>
      )}
      
      {!loading && cands.map((c, i) => (
        <View key={i} style={styles.candidateContainer}>
          <Text style={styles.candidateTitle}>
            {c.brand} — {c.model} {c.reference ? `(${c.reference})` : ""}
          </Text>
          <Text style={styles.confidenceText}>
            Confiance: {(c.confidence*100).toFixed(0)}%
          </Text>
          <TouchableOpacity onPress={() => select(c)} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Sélectionner ce modèle</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  candidateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  candidateTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 12,
  },
  selectButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
