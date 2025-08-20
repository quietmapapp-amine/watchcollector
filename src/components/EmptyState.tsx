import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  actionText: string;
  onAction: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionText, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.actionButton} onPress={onAction}>
        <Text style={styles.actionButtonText}>{actionText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#A7B0B7',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
