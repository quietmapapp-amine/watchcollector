import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBadgeStore } from '../../store/badgeStore';
import { useAuthStore } from '../../store/authStore';
import { Badge, UserBadge } from '../../types';
import { getThemeColors } from '../../theme';

export default function BadgesScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { badges, unlockedCount, loading, error, loadUserBadges } = useBadgeStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserBadges(user.id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadUserBadges(user.id);
    }
    setRefreshing(false);
  };

  const renderBadge = ({ item }: { item: UserBadge }) => (
    <View style={styles.badgeCard}>
      <View style={styles.badgeIcon}>
        <Text style={styles.badgeIconText}>{item.badge?.icon_url || '🏆'}</Text>
      </View>
      <View style={styles.badgeContent}>
        <Text style={styles.badgeName}>{item.badge?.name}</Text>
        <Text style={styles.badgeDescription}>{item.badge?.description}</Text>
        <Text style={styles.badgeCategory}>{t(`badge.category.${item.badge?.category}`)}</Text>
        <Text style={styles.badgeDate}>
          {new Date(item.unlocked_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderCategorySection = (category: string, categoryBadges: UserBadge[]) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>
        {t(`badge.category.${category}`)} ({categoryBadges.length})
      </Text>
      {categoryBadges.map((badge) => (
        <View key={badge.id} style={styles.badgeCard}>
          <View style={styles.badgeIcon}>
            <Text style={styles.badgeIconText}>{badge.badge?.icon_url || '🏆'}</Text>
          </View>
          <View style={styles.badgeContent}>
            <Text style={styles.badgeName}>{badge.badge?.name}</Text>
            <Text style={styles.badgeDescription}>{badge.badge?.description}</Text>
            <Text style={styles.badgeDate}>
              {new Date(badge.unlocked_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const groupedBadges = badges.reduce((acc, badge) => {
    const category = badge.badge?.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, UserBadge[]>);

  const categories = ['achievement', 'collection', 'social', 'premium'];

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
          <TouchableOpacity style={styles.retryButton} onPress={() => user && loadUserBadges(user.id)}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('badges.title')}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>{t('badges.unlocked')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{badges.length > 0 ? Math.round((unlockedCount / 20) * 100) : 0}%</Text>
            <Text style={styles.statLabel}>{t('badges.completion')}</Text>
          </View>
        </View>
      </View>

      {badges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>{t('badges.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>{t('badges.empty.subtitle')}</Text>
        </View>
      ) : (
        <View style={styles.badgesContainer}>
          {categories.map((category) => {
            const categoryBadges = groupedBadges[category] || [];
            if (categoryBadges.length === 0) return null;
            
            return renderCategorySection(category, categoryBadges);
          })}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('badges.footer')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E8D9B5',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#A7B0B7',
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A7B0B7',
    textAlign: 'center',
    lineHeight: 24,
  },
  badgesContainer: {
    padding: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8D9B5',
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  badgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(232, 217, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  badgeIconText: {
    fontSize: 24,
  },
  badgeContent: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#A7B0B7',
    marginBottom: 8,
    lineHeight: 20,
  },
  badgeCategory: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  badgeDate: {
    fontSize: 12,
    color: '#A7B0B7',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#A7B0B7',
    textAlign: 'center',
    lineHeight: 20,
  },
});
