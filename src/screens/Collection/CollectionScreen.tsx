import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useCollectionStore } from '../../store/collectionStore';
import { useAuthStore } from '../../store/authStore';
import { useBadgeStore } from '../../store/badgeStore';
import { useEntitlements } from '../../hooks/useEntitlements';
import WatchCard from '../../components/WatchCard';
import EmptyState from '../../components/EmptyState';

export default function CollectionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { watches, loading, error, setError, loadWatches } = useCollectionStore();
  const { checkAndUnlockBadges } = useBadgeStore();
  const { canAddWatch, showPaywall } = useEntitlements();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWatches(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Check for badge unlocks when watches change
    if (user && watches.length > 0) {
      checkAndUnlockBadges(user.id, watches);
    }
  }, [watches, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadWatches(user.id);
    }
    setRefreshing(false);
  };

  const handleAddWatch = () => {
    if (!canAddWatch) {
      showPaywall();
      return;
    }
    navigation.navigate('AddWatch' as never);
  };

  const handleWatchPress = (watch: any) => {
    navigation.navigate('WatchDetail' as never);
  };

  const handleBadgesPress = () => {
    navigation.navigate('Badges' as never);
  };

  const handleTimelinePress = () => {
    navigation.navigate('Timeline' as never);
  };

  const handleLeaderboardPress = () => {
    navigation.navigate('Leaderboard' as never);
  };

  const renderWatch = ({ item }: { item: any }) => (
    <WatchCard watch={item} onPress={() => handleWatchPress(item)} />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="⌚"
      title={t('collection.empty')}
      subtitle="Commencez votre collection de montres"
      actionText="Ajouter ma première montre"
      onAction={handleAddWatch}
    />
  );

  const renderStats = () => {
    const totalValue = watches.reduce((sum, watch) => sum + (watch.purchase_price || 0), 0);
    const averageValue = watches.length > 0 ? totalValue / watches.length : 0;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{watches.length}</Text>
          <Text style={styles.statLabel}>Montres</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>€{totalValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Valeur totale</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>€{Math.round(averageValue).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Valeur moyenne</Text>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Actions rapides</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.quickActionButton} onPress={handleBadgesPress}>
          <Text style={styles.quickActionIcon}>🏆</Text>
          <Text style={styles.quickActionText}>Badges</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleTimelinePress}>
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionText}>Timeline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={handleLeaderboardPress}>
          <Text style={styles.quickActionIcon}>🏅</Text>
          <Text style={styles.quickActionText}>Classement</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Dashboard' as never)}>
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => user && loadWatches(user.id)}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('collection.title')}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddWatch}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {watches.length > 0 && renderStats()}
      {watches.length > 0 && renderQuickActions()}

      {watches.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Vos montres</Text>
            <Text style={styles.listSubtitle}>{watches.length} montre{watches.length > 1 ? 's' : ''}</Text>
          </View>
          
          <FlashList
            data={watches}
            renderItem={renderWatch}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E8D9B5',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCard: {
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A7B0B7',
    textAlign: 'center',
  },
  quickActionsContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8D9B5',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#A7B0B7',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#A7B0B7',
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A7B0B7',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
