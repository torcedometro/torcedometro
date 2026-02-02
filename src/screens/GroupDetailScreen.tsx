import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Clipboard, Share, RefreshControl, Dimensions, StatusBar, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupService, GroupMember } from '../services/group';
import { gameService, Game } from '../services/game';
import { useAuth } from '../contexts/AuthContext';
import { checkinService } from '../services/checkin';
import { formatDate } from '../utils/date';

type GroupDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

type GameWithStatus = Game & { checkedIn?: boolean };

export const GroupDetailScreen = ({ route, navigation }: GroupDetailScreenProps) => {
  // @ts-ignore
  const { group } = route.params;
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'ranking' | 'games'>('ranking');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [games, setGames] = useState<GameWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Timer para atualizar UI a cada 10 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Trigger refresh when component comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ranking') {
        const data = await groupService.getGroupRanking(group.id);
        setMembers(data);
      } else {
        if (group.club_id) {
          const gamesData = await gameService.getGamesByClub(group.club_id);

          // Check check-in status for each game if user is logged in
          if (user) {
            const gamesWithStatus = await Promise.all(gamesData.map(async (g) => {
              const checkedIn = await checkinService.hasCheckedIn(user.id, g.id);
              return { ...g, checkedIn };
            }));
            setGames(gamesWithStatus);
          } else {
            setGames(gamesData);
          }
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    Clipboard.setString(group.invite_code);
    Alert.alert('Copiado!', `Código ${group.invite_code} copiado.`);
  };

  const shareGroup = async () => {
    try {
      await Share.share({
        message: `Entre no meu grupo "${group.name}" no Torcedorismo! Código: ${group.invite_code}`,
      });
    } catch (error) {
      // ignore
    }
  };

  const handleCheckIn = (game: Game) => {
    navigation.navigate('CheckIn', { game });
  };

  // --- RENDERERS ---

  const renderMember = ({ item, index }: { item: GroupMember, index: number }) => {
    const isMe = item.user_id === user?.id;
    return (
      <View style={[styles.memberRow, isMe && styles.meRow]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, index < 3 && styles.topRank]}>{index + 1}</Text>
        </View>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>{item.full_name?.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, isMe && styles.meText]} numberOfLines={1}>
            {item.full_name} {isMe && '(Você)'}
          </Text>
          <Text style={styles.memberSince}>Desde {formatDate(item.joined_at)}</Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.memberPoints}>{item.total_points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
        {index === 0 && <Text style={styles.crown}>👑</Text>}
      </View>
    );
  };

  const renderGame = ({ item }: { item: GameWithStatus }) => {
    // Check Available logic + checked status
    // Usamos apenas isCheckInAvailable (Tempo)
    const isAvailable = gameService.isCheckInAvailable(item) && !item.checkedIn;
    const isFinished = item.status === 'finished';
    const isCheckedIn = !!item.checkedIn;

    const gameDate = new Date(item.start_time);
    const dateString = gameDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const timeString = gameDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.gameCard}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameDate}>{dateString} - {timeString}</Text>
          <Text style={styles.gameMatchup}>{item.home_team} vs {item.away_team}</Text>
          <Text style={styles.gameStadium}>🏟️ {item.stadium?.name || 'Local a definir'}</Text>
        </View>

        <View style={styles.gameAction}>
          {isCheckedIn ? (
            <View style={[styles.checkInButton, styles.checkedInButton]}>
              <Text style={styles.checkedInText}>CHECK-IN REALIZADO ✅</Text>
            </View>
          ) : isAvailable ? (
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => handleCheckIn(item)}
            >
              <Text style={styles.checkInText}>FAZER CHECK-IN</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.checkInButton, styles.disabledButton]}>
              <Text style={styles.disabledText}>
                {isFinished ? 'ENCERRADO' : 'AGUARDE O INÍCIO'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        {group.banner_url ? (
          <Image source={{ uri: group.banner_url }} style={styles.bannerImage} />
        ) : (
          <View style={[styles.bannerImage, styles.defaultBanner]}>
            <Text style={styles.defaultBannerIcon}>{group.type === 'EVENT' ? '🏁' : '🏟️'}</Text>
          </View>
        )}
        <View style={styles.bannerOverlay} />

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonAbsolute}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.bannerContent}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{group.type === 'EVENT' ? 'EVENTO' : 'COMUNIDADE'}</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.type === 'EVENT' && group.end_date && (
            <Text style={styles.eventDate}>
              📅 Encerra em {formatDate(group.end_date)}
            </Text>
          )}
        </View>
      </View>

      {/* Stats & Actions */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.length || '-'}</Text>
          <Text style={styles.statLabel}>Membros</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statItem}>
          <TouchableOpacity onPress={copyCode} style={styles.codeButton}>
            <Text style={styles.codeValue}>{group.invite_code}</Text>
            <Text style={styles.codeLabel}>COPIAR CÓDIGO</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.verticalDivider} />
        <TouchableOpacity style={styles.inviteButton} onPress={shareGroup}>
          <Text style={styles.inviteIcon}>📤</Text>
          <Text style={styles.inviteLabel}>CONVIDAR</Text>
        </TouchableOpacity>
      </View>

      {group.description ? (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{group.description}</Text>
        </View>
      ) : null}

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ranking' && styles.activeTab]}
          onPress={() => setActiveTab('ranking')}
        >
          <Text style={[styles.tabText, activeTab === 'ranking' && styles.activeTabText]}>🏆 Classificação</Text>
        </TouchableOpacity>

        {group.club_id && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'games' && styles.activeTab]}
            onPress={() => setActiveTab('games')}
          >
            <Text style={[styles.tabText, activeTab === 'games' && styles.activeTabText]}>⚽ Jogos</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <FlatList
        data={activeTab === 'ranking' ? members : games}
        extraData={currentTime} // Importante para atualizar com o timer
        // @ts-ignore
        renderItem={activeTab === 'ranking' ? renderMember : renderGame}
        keyExtractor={(item: any) => item.id || item.user_id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'ranking' ? 'Nenhum membro ainda.' : 'Nenhum jogo encontrado para este clube.'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  // Banner
  bannerContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultBanner: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBannerIcon: {
    fontSize: 60,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.l,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventDate: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
  },

  // Stats Row
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.m,
    marginTop: -20,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.inputBorder,
  },
  codeButton: {
    alignItems: 'center',
  },
  codeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  codeLabel: {
    fontSize: 8,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  inviteButton: {
    alignItems: 'center',
    flex: 1,
  },
  inviteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  inviteLabel: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },

  descriptionContainer: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  descriptionText: {
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },

  // TABS
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: theme.colors.primary,
  },

  // Ranking List
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  meRow: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rank: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  topRank: {
    color: '#fbbf24',
    fontSize: 18,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: theme.spacing.m,
  },
  placeholderAvatar: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  meText: {
    color: theme.colors.primary,
  },
  memberSince: {
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  memberPoints: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  crown: {
    marginLeft: 4,
    fontSize: 18,
  },

  // Games List
  gameCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  gameInfo: {
    marginBottom: theme.spacing.m,
  },
  gameDate: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameMatchup: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameStadium: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  gameAction: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.inputBorder,
    paddingTop: theme.spacing.m,
  },
  checkInButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.s,
    alignItems: 'center',
  },
  checkInText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkedInButton: {
    backgroundColor: '#22c55e', // Green 500
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.s,
  },
  checkedInText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#334155', // Slate 700
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.s,
  },
  disabledText: {
    color: '#94a3b8', // Slate 400
    fontWeight: 'bold',
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  }
});
