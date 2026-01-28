import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { gameService } from '../services/game';
import { Game } from '../types/game';
import { formatDate } from '../utils/date';
import { useFocusEffect } from '@react-navigation/native';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGame = async () => {
    try {
      const data = await gameService.getNextOrActiveGame();
      setGame(data);
    } catch (error) {
      console.error('Failed to fetch game', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, []);

  // Reload when gaining focus
  useFocusEffect(
    useCallback(() => {
      fetchGame();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGame();
  };

  const isGameActive = () => {
    if (!game) return false;
    const now = new Date();
    const start = new Date(game.start_time);
    const end = new Date(game.end_time);
    return now >= start && now <= end;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >

        <View style={styles.header}>
          {/* HAMBURGER MENU (CUSTOM SIDE MENU) */}
          <TouchableOpacity
            style={{ marginRight: 15, padding: 5 }}
            onPress={() => navigation.navigate('SideMenu' as any)}
          >
            <Text style={{ fontSize: 24, color: theme.colors.text }}>☰</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Olá, torcedor!</Text>
            <Text style={styles.username}>{user?.full_name?.split(' ')[0] || 'Usuário'}</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            ) : (
              <Text style={styles.profileButtonText}>
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'P'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.card}>
            <Text style={styles.cardContent}>Carregando jogos...</Text>
          </View>
        ) : game ? (
          <View style={[styles.card, isGameActive() && styles.activeCard]}>
            <View style={styles.gameHeader}>
              <Text style={styles.league}>Brasileirão Série A</Text>
              <View style={[styles.statusBadge, isGameActive() ? styles.activeBadge : styles.nextBadge]}>
                <Text style={styles.statusText}>
                  {isGameActive() ? 'EM ANDAMENTO' : 'PRÓXIMO JOGO'}
                </Text>
              </View>
            </View>

            <View style={styles.teamsContainer}>
              <View style={styles.team}>
                <View style={styles.teamLogoPlaceholder}><Text style={styles.teamEmoji}>🦁</Text></View>
                <Text style={styles.teamName}>{game.home_team}</Text>
              </View>
              <Text style={styles.versus}>X</Text>
              <View style={styles.team}>
                <View style={styles.teamLogoPlaceholder}><Text style={styles.teamEmoji}>🦊</Text></View>
                <Text style={styles.teamName}>{game.away_team}</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>🏟️ {game.stadium?.name}</Text>
              <Text style={styles.infoText}>📅 {formatDate(game.start_time)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkInButton, !isGameActive() && styles.disabledButton]}
              disabled={!isGameActive()}
              onPress={() => navigation.navigate('CheckIn', { game })}
            >
              <Text style={styles.checkInButtonText}>
                {isGameActive() ? 'FAZER CHECK-IN AGORA' : 'AGUARDE O INÍCIO'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardContent}>Nenhum jogo agendado.</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.total_points || 0}</Text>
            <Text style={styles.statLabel}>Meus Pontos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>#{user?.current_ranking || '-'}</Text>
            <Text style={styles.statLabel}>Ranking Geral</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  greeting: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  username: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  profileButtonText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    marginBottom: theme.spacing.l,
  },
  activeCard: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  cardContent: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  league: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadge: {
    backgroundColor: theme.colors.primary,
  },
  nextBadge: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    paddingHorizontal: theme.spacing.m,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  teamEmoji: {
    fontSize: 32,
  },
  teamName: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  versus: {
    color: theme.colors.textSecondary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
    gap: 4,
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
    opacity: 0.5,
  },
  checkInButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  }
});
