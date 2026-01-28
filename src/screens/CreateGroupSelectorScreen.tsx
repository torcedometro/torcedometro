import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateGroupSelector'>;

export const CreateGroupSelectorScreen = ({ navigation }: Props) => {

  const handleSelect = (type: 'EVENT' | 'COMMUNITY') => {
    if (type === 'EVENT') {
      navigation.navigate('CreateEventGroup');
    } else {
      navigation.navigate('CreateCommunityGroup');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Criar grupo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Escolha o tipo de grupo que deseja criar.
        </Text>

        {/* CARD EVENTO */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect('EVENT')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>🏁</Text>
            <Text style={styles.cardTitle}>Evento</Text>
          </View>

          <Text style={styles.description}>
            Uma competição com data de início e término, baseada em jogos específicos.
          </Text>

          <Text style={styles.description}>
            Os membros competem durante o período definido para alcançar o topo do ranking de presença no estádio.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Ideal para desafios entre amigos, fases de campeonato ou jogos decisivos.</Text>
          </View>
        </TouchableOpacity>

        {/* CARD COMUNIDADE */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleSelect('COMMUNITY')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.icon}>🏟️</Text>
            <Text style={styles.cardTitle}>Comunidade</Text>
          </View>

          <Text style={styles.description}>
            Uma comunidade permanente de torcedores que valoriza presença e fidelidade.
          </Text>

          <Text style={styles.description}>
            As classificações são atualizadas automaticamente ao longo da temporada, com rankings semanais, mensais e gerais.
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Ideal para quem frequenta o estádio regularmente e quer construir histórico e status.</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    color: 'white',
    fontSize: 24,
  },
  title: {
    ...theme.typography.h2,
    color: 'white',
    fontSize: 20,
  },
  content: {
    padding: theme.spacing.m,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.s,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  icon: {
    fontSize: 32,
    marginRight: theme.spacing.m,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontSize: 24,
  },
  description: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: theme.spacing.m,
  },
  badge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)', // Primary color with low opacity
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginTop: theme.spacing.s,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  }
});
