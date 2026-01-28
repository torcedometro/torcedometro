import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../services/auth';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { user, signOut, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await signOut();
            // AuthContext listener will handle navigation to Login
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível sair.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar sua foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && user) {
      handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (uri: string) => {
    if (!user) return;

    try {
      setUploading(true);

      // Upload to Storage
      const publicUrl = await authService.uploadAvatar(user.id, uri);

      // Update User Profile in DB and Context
      await updateUserProfile({ avatar_url: publicUrl });

      Alert.alert('Sucesso', 'Foto de perfil atualizada!');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao atualizar foto. ' + (error.message || ''));
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <View style={[styles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            ) : user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}

            <View style={styles.editIcon}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.full_name || 'Torcedor'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.total_points || 0}</Text>
            <Text style={styles.statLabel}>Pontos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>#{user?.current_ranking || '-'}</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Groups')}
          >
            <Text style={styles.actionText}>Minhas Comunidades</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleSignOut}>
            {loading ? (
              <ActivityIndicator color={theme.colors.error} />
            ) : (
              <Text style={[styles.actionText, styles.dangerText]}>Sair da Conta</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.l,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.m,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  loadingAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: 0,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.inputBorder,
  },
  actions: {
    gap: theme.spacing.m,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    alignItems: 'center',
  },
  actionText: {
    ...theme.typography.button,
    color: theme.colors.text,
  },
  dangerButton: {
    borderColor: theme.colors.error,
    backgroundColor: 'transparent',
    marginTop: theme.spacing.l,
  },
  dangerText: {
    color: theme.colors.error,
  },
});
