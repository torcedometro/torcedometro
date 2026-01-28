import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Clipboard, Share, RefreshControl, Dimensions, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupService, GroupMember } from '../services/group';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/date';

type GroupDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupDetail'>;

const { width } = Dimensions.get('window');

export const GroupDetailScreen = ({ route, navigation }: GroupDetailScreenProps) => {
  // @ts-ignore - group params may be partial or old, we trust the update
  const { group } = route.params;
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await groupService.getGroupRanking(group.id);
      setMembers(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar os membros.');
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
          <Text style={styles.statValue}>{members.length}</Text>
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

      <Text style={styles.sectionTitle}>Classificação</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMembers} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
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
    // Gradient fake using opacity
  },
  bannerContent: {
    padding: theme.spacing.m,
    paddingBottom: theme.spacing.l,
  },
  backButtonAbsolute: {
    position: 'absolute',
    top: 50, // Safe area logic needed if not using SafeAreaView
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
    marginTop: -20, // Overlap banner
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

  sectionTitle: {
    paddingHorizontal: theme.spacing.m,
    marginBottom: theme.spacing.s,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
    color: '#fbbf24', // Goldish
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
  }
});
