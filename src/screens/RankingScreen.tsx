import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { rankingService, LeaderboardEntry } from '../services/ranking';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export const RankingScreen = () => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRanking = async () => {
    try {
      const data = await rankingService.getGlobalRanking(50);
      setRanking(data);
    } catch (error) {
      // Silent error or toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRanking();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRanking();
  };

  const renderItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.id === user?.id;
    let rankColor = theme.colors.textSecondary;
    let rankIcon = null;

    if (item.rank_position === 1) {
      rankColor = '#FFD700'; // Gold
      rankIcon = '👑';
    } else if (item.rank_position === 2) {
      rankColor = '#C0C0C0'; // Silver
      rankIcon = '🥈';
    } else if (item.rank_position === 3) {
      rankColor = '#CD7F32'; // Bronze
      rankIcon = '🥉';
    }

    return (
      <View style={[styles.itemContainer, isCurrentUser && styles.currentUserItem]}>
        <View style={styles.rankContainer}>
          {rankIcon ? <Text style={styles.rankIcon}>{rankIcon}</Text> : <Text style={[styles.rankText, { color: rankColor }]}>#{item.rank_position}</Text>}
        </View>

        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{item.full_name?.charAt(0) || '?'}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.name, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
            {item.full_name || 'Torcedor Anônimo'}
          </Text>
          {isCurrentUser && <Text style={styles.youBadge}>(Você)</Text>}
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{item.total_points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ranking Geral</Text>
        <Text style={styles.headerSubtitle}>Os maiores torcedores da temporada</Text>
      </View>

      <FlatList
        data={ranking}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum torcedor pontuou ainda.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.l,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },
  headerTitle: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  listContent: {
    padding: theme.spacing.m,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  currentUserItem: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  rankIcon: {
    fontSize: 24,
  },
  avatarContainer: {
    marginLeft: theme.spacing.s,
    marginRight: theme.spacing.m,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  avatarInitial: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 20,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontSize: 16,
  },
  currentUserName: {
    color: theme.colors.primary,
  },
  youBadge: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  pointsContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  pointsValue: {
    ...theme.typography.h2,
    color: theme.colors.white,
  },
  pointsLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  },
});
