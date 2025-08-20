import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { callOCRInvoice } from "../../services/functions";
import { supabase } from "../../services/supabase";

export default function OCRUploadScreen({ navigation }: any) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const img = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      quality: 0.8, 
      base64: true 
    });
    if (img.canceled) return;
    const asset = img.assets?.[0];
    if (!asset?.base64) return;
    
    setPreview(asset.uri ?? null);
    setLoading(true);
    try {
      const resp = await callOCRInvoice({ image_base64: asset.base64 });
      setResult(resp?.result);
    } catch (e:any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!result) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Create a watch_instance draft from OCR heuristics (best effort)
    const { brand, model, reference, serial, purchase_price, purchase_currency, purchase_date } = result;
    
    // Find or create model by reference/name (simple demo: only reference lookup)
    let model_id: string | null = null;
    if (reference) {
      const { data: m } = await supabase.from("model").select("id").eq("reference", reference).maybeSingle();
      model_id = m?.id ?? null;
    }
    
    const payload: any = {
      user_id: user.id,
      model_id,
      serial,
      purchase_price,
      purchase_currency,
      purchase_date,
      notes: `Imported from OCR: brand=${brand ?? ""} model=${model ?? ""} ref=${reference ?? ""}`
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
    } else {
      Alert.alert("Succès", "Montre créée depuis la facture !");
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Importer facture (OCR)</Text>
      <Text style={styles.subtitle}>Scanne ta facture pour pré-remplir la montre (prix, date, réf…).</Text>

      {preview && (
        <Image source={{ uri: preview }} style={styles.previewImage} />
      )}
      
      {!preview && (
        <TouchableOpacity onPress={pick} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Choisir une image</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <Text style={styles.loadingText}>Analyse en cours…</Text>
      )}

      {result && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Résultat OCR</Text>
          <Text style={styles.resultText}>Brand: {result.brand ?? "—"}</Text>
          <Text style={styles.resultText}>Model: {result.model ?? "—"}</Text>
          <Text style={styles.resultText}>Ref: {result.reference ?? "—"}</Text>
          <Text style={styles.resultText}>Serial: {result.serial ?? "—"}</Text>
          <Text style={styles.resultText}>Prix: {result.purchase_price ?? "—"} {result.purchase_currency ?? ""}</Text>
          <Text style={styles.resultText}>Date: {result.purchase_date ?? "—"}</Text>
          
          <TouchableOpacity onPress={confirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Créer la montre</Text>
          </TouchableOpacity>
        </View>
      )}
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
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  resultText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  confirmButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
