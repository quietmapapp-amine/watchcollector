import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { WatchInstance } from '../types';

interface WatchCardProps {
  watch: WatchInstance;
  onPress: () => void;
}

export default function WatchCard({ watch, onPress }: WatchCardProps) {
  const { t } = useTranslation();
  
  const coverPhoto = watch.photos?.find(photo => photo.is_cover);
  const brandName = watch.model?.brand?.name || 'Unknown Brand';
  const modelName = watch.model?.name || 'Unknown Model';
  const reference = watch.model?.reference || 'N/A';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {coverPhoto ? (
          <Image source={{ uri: coverPhoto.url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>⌚</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.brand}>{brandName}</Text>
        <Text style={styles.model}>{modelName}</Text>
        <Text style={styles.reference}>Ref: {reference}</Text>
        
        {watch.purchase_price && (
          <Text style={styles.price}>
            €{watch.purchase_price.toLocaleString()}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              {t(`watch.${watch.condition}`)}
            </Text>
          </View>
          
          <View style={styles.visibilityBadge}>
            <Text style={styles.visibilityText}>
              {t(`watch.${watch.visibility}`)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  placeholderText: {
    fontSize: 48,
    color: '#A7B0B7',
  },
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    marginBottom: 4,
  },
  model: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  reference: {
    fontSize: 12,
    color: '#A7B0B7',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conditionBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  visibilityBadge: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  visibilityText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '500',
  },
});
