import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { groupService } from '../services/group';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateEventGroup'>;

export const CreateEventGroupScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const validateDate = (dateStr: string) => {
    // DD/MM/YYYY
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    return regex.test(dateStr);
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!name) return Alert.alert('Erro', 'Nome do evento é obrigatório');
    if (!startDate || !validateDate(startDate)) return Alert.alert('Erro', 'Data de início inválida (DD/MM/AAAA)');
    if (!endDate || !validateDate(endDate)) return Alert.alert('Erro', 'Data final inválida (DD/MM/AAAA)');

    try {
      setLoading(true);
      let uploadedBannerUrl = '';

      if (bannerUri) {
        uploadedBannerUrl = await groupService.uploadGroupBanner(bannerUri);
      }

      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (end < start) {
        throw new Error('A data final deve ser depois da data de início.');
      }

      await groupService.createGroup({
        name,
        description,
        userId: user.id,
        type: 'EVENT',
        banner_url: uploadedBannerUrl,
        start_date: start,
        end_date: end,
      });

      Alert.alert('Sucesso', 'Evento criado com sucesso!', [
        { text: 'OK', onPress: () => navigation.navigate('Groups') }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (text: string, setter: (val: string) => void) => {
    // Simple mask for DD/MM/YYYY
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);

    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    if (cleaned.length > 4) {
      formatted = `${formatted.substring(0, 5)}/${formatted.substring(5)}`;
    }
    setter(formatted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo Evento</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* BANNER UPLOAD */}
        <TouchableOpacity style={styles.bannerContainer} onPress={pickImage}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <Text style={styles.bannerIcon}>📷</Text>
              <Text style={styles.bannerText}>Adicionar Capa</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FORM */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nome do Evento *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Brasileirão 2024 - Turno 1"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Regras, prêmios, detalhes..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Início (DD/MM/AAAA) *</Text>
            <TextInput
              style={styles.input}
              placeholder="01/01/2024"
              placeholderTextColor="#666"
              value={startDate}
              onChangeText={(t) => handleDateChange(t, setStartDate)}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Fim (DD/MM/AAAA) *</Text>
            <TextInput
              style={styles.input}
              placeholder="31/12/2024"
              placeholderTextColor="#666"
              value={endDate}
              onChangeText={(t) => handleDateChange(t, setEndDate)}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Criar Evento</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
