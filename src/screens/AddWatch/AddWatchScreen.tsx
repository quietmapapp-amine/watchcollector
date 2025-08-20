import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function AddWatchScreen({ navigation }: any) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('collection.addWatch')}</Text>
      <Text style={styles.subtitle}>Choisis comment ajouter ta montre</Text>
      
      <View style={styles.ctaContainer}>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('OCRUpload')}
        >
          <Text style={styles.ctaIcon}>📄</Text>
          <Text style={styles.ctaTitle}>Scanner une facture (OCR)</Text>
          <Text style={styles.ctaSubtitle}>Extrait automatiquement les informations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('PhotoMatch')}
        >
          <Text style={styles.ctaIcon}>📸</Text>
          <Text style={styles.ctaTitle}>Identifier par photo (IA)</Text>
          <Text style={styles.ctaSubtitle}>L'IA reconnaît le modèle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.manualButton}>
          <Text style={styles.manualButtonText}>Saisie manuelle</Text>
          <Text style={styles.manualButtonSubtitle}>Coming soon...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A7B0B7',
    textAlign: 'center',
    marginBottom: 40,
  },
  ctaContainer: {
    gap: 20,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  ctaIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  manualButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    opacity: 0.5,
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  manualButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
