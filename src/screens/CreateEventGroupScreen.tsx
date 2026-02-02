import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { groupService } from '../services/group';
import { clubService } from '../services/club';
import { useAuth } from '../contexts/AuthContext';
import { Club } from '../types/club';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateEventGroup'>;

export const CreateEventGroupScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Club Selection State
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [clubModalVisible, setClubModalVisible] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const data = await clubService.getClubs();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const pickImage = async () => {
    // 1. Pedir permissão explicitamente
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher a capa.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Syntax moderna
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBannerUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error("Erro ao abrir galeria:", e);
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
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
    if (!selectedClub) return Alert.alert('Erro', 'Selecione um clube do coração para o evento');
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

      const newGroup = await groupService.createGroup({
        name,
        description,
        userId: user.id,
        type: 'EVENT',
        banner_url: uploadedBannerUrl,
        start_date: start,
        end_date: end,
        club_id: selectedClub.id,
      });

      Alert.alert('Sucesso', 'Evento criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 1,
              routes: [
                { name: 'Groups' },
                { name: 'GroupDetail', params: { group: newGroup } },
              ],
            });
          }
        }
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message || 'Falha ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (text: string, setter: (val: string) => void) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length > 8) cleaned = cleaned.substring(0, 8);
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    if (cleaned.length > 4) formatted = `${formatted.substring(0, 5)}/${formatted.substring(5)}`;
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

        {/* CLUB SELECTION */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Clube do Coração *</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setClubModalVisible(true)}
          >
            <Text style={[styles.selectorText, !selectedClub && { color: '#666' }]}>
              {selectedClub ? selectedClub.name : 'Selecione o clube...'}
            </Text>
            <Text style={{ color: 'white' }}>▼</Text>
          </TouchableOpacity>
        </View>

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

      {/* CLUB SELECTION MODAL */}
      <Modal
        visible={clubModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setClubModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Clube</Text>
              <TouchableOpacity onPress={() => setClubModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={clubs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clubItem}
                  onPress={() => {
                    setSelectedClub(item);
                    setClubModalVisible(false);
                  }}
                >
                  <Text style={styles.clubName}>{item.name}</Text>
                  {item.short_name && <Text style={styles.clubShort}>{item.short_name}</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
  selectorButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    color: 'white',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    padding: theme.spacing.m,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
    paddingBottom: theme.spacing.s,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: 'white',
    fontSize: 24,
    padding: 4,
  },
  clubItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubName: {
    color: 'white',
    fontSize: 16,
  },
  clubShort: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
