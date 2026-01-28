import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { groupService } from '../services/group';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateCommunityGroup'>;

export const CreateCommunityGroupScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      // @ts-ignore: MediaType is the new standard, ignoring type mismatch if old types
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBannerUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!name) return Alert.alert('Erro', 'Nome da comunidade é obrigatório');

    try {
      setLoading(true);
      let uploadedBannerUrl = '';

      if (bannerUri) {
        uploadedBannerUrl = await groupService.uploadGroupBanner(bannerUri);
      }

      await groupService.createGroup({
        name,
        description,
        userId: user.id,
        type: 'COMMUNITY', // Hardcoded as COMMUNITY
        banner_url: uploadedBannerUrl,
        // No dates for community
      });

      Alert.alert('Sucesso', 'Comunidade criada!', [
        { text: 'OK', onPress: () => navigation.navigate('Groups') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha ao criar comunidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nova Comunidade</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* BANNER UPLOAD */}
        <TouchableOpacity style={styles.bannerContainer} onPress={pickImage}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Text style={styles.bannerIcon}>🏟️</Text>
              <Text style={styles.bannerText}>Adicionar Capa da Comunidade</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FORM */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome da Comunidade *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Torcida Jovem 2024"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Sobre o que é essa comunidade?"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Criar Comunidade</Text>
          )}
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
  bannerContainer: {
    height: 180,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderStyle: 'dashed',
  },
  bannerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  bannerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  formGroup: {
    marginBottom: theme.spacing.m,
  },
  label: {
    color: 'white',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: theme.colors.surface,
    color: 'white',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginTop: theme.spacing.m,
    marginBottom: 30, // Extra space at bottom
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
