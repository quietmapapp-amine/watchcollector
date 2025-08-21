import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WatchCollector</Text>
      <Text style={styles.subtitle}>Web Preview</Text>
      <Text style={styles.description}>
        Cette version Web est en cours de développement.
        {'\n'}Utilisez l'app native pour toutes les fonctionnalités.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E8D9B5',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A7B0B7',
    marginBottom: 30,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#A7B0B7',
    textAlign: 'center',
    lineHeight: 24,
  },
});
