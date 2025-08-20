import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useEntitlementsStore } from "../../store/entitlements";

const Feature = ({label, included}:{label:string; included:boolean}) => (
  <View style={styles.feature}>
    <Text style={[styles.featureIcon, included ? styles.featureIconIncluded : styles.featureIconExcluded]}>
      {included ? "✔︎" : "✖︎"}
    </Text>
    <Text style={styles.featureText}>{label}</Text>
  </View>
);

export default function PaywallScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Passe en Premium</Text>
      <Text style={styles.subtitle}>Débloque la puissance de ta collection — alertes illimitées, exports, IA & plus.</Text>

      <View style={styles.tierCard}>
        <Text style={styles.tierTitle}>Gratuit</Text>
        <Feature label="Jusqu'à 5 montres" included />
        <Feature label="Tableau de bord basique" included />
        <Feature label="Alertes limitées" included />
        <Feature label="Exports PDF/CSV" included={false} />
        <Feature label="Analytics 6/12 mois" included={false} />
        <Feature label="OCR Factures & IA" included={false} />
      </View>

      <View style={[styles.tierCard, styles.standardCard]}>
        <Text style={styles.tierTitle}>Standard</Text>
        <Text style={styles.tierPrice}>10€/mois</Text>
        <Feature label="Montres illimitées" included />
        <Feature label="Exports PDF/CSV" included />
        <Feature label="Alertes illimitées" included />
        <Feature label="Analytics 6/12 mois" included />
        <Feature label="Partage avancé (masquage)" included />
        <TouchableOpacity
          style={styles.standardButton}
          onPress={() => useEntitlementsStore.setState({ tier: "standard", isPremium: true })}
        >
          <Text style={styles.buttonText}>Passer en Standard</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tierCard, styles.collectorCard]}>
        <Text style={styles.tierTitle}>Collector</Text>
        <Text style={styles.tierPrice}>15€/mois</Text>
        <Feature label="Tout Standard +" included />
        <Feature label="OCR Factures" included />
        <Feature label="Assistant horloger IA" included />
        <Feature label="Badges exclusifs" included />
        <TouchableOpacity
          style={styles.collectorButton}
          onPress={() => useEntitlementsStore.setState({ tier: "collector", isPremium: true })}
        >
          <Text style={styles.buttonText}>Passer en Collector</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>Annulable à tout moment. Essai gratuit possible via opérations marketing.</Text>
    </ScrollView>
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
    fontSize: 30,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    lineHeight: 24,
  },
  tierCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  standardCard: {
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  collectorCard: {
    borderColor: 'rgba(33, 150, 243, 0.2)',
    marginBottom: 32,
  },
  tierTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tierPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  featureIconIncluded: {
    color: '#4ADE80',
  },
  featureIconExcluded: {
    color: '#F87171',
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  standardButton: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  collectorButton: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 18,
  },
});
