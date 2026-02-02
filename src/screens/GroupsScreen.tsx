import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { groupService, Group } from '../services/group';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

type GroupsScreenProps = NativeStackScreenProps<RootStackParamList, 'Groups'>;

export const GroupsScreen = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE' | 'JOIN'>('JOIN');

  // Handle Quick Actions from Drawer
  // Handle Quick Actions from SideMenu
  useEffect(() => {
    if (route.params?.mode) {
      setModalMode(route.params.mode);
      setModalVisible(true);
      // Clear params so it doesn't reopen unexpectedly
      navigation.setParams({ mode: undefined });
    }
  }, [route.params]);

  // Form State
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;
    try {
      const data = await groupService.getUserGroups(user.id);
      setGroups(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  const handleCreate = async () => {
    if (!groupName || !user) return;
    try {
      setSubmitting(true);
      await groupService.createGroup({
        name: groupName,
        description: '',
        userId: user.id,
        type: 'COMMUNITY' // Modal básica cria comunidade
      });
      Alert.alert('Sucesso', 'Grupo criado!');
      setModalVisible(false);
      setGroupName('');
      fetchGroups();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode || !user) return;
    try {
      setSubmitting(true);
      await groupService.joinGroup(inviteCode, user.id);
      Alert.alert('Sucesso', 'Você entrou no grupo!');
      setModalVisible(false);
      setInviteCode('');
      fetchGroups();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GroupDetail', { group: item })}
    >
      <View>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.inviteCode}>Código: {item.invite_code}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // @ts-ignore
              navigation.navigate('Tabs');
            }
          }}
          style={{ padding: 8 }}
        >
          <Text style={{ color: 'white', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Minhas Comunidades</Text>
      </View>

      {/* Actions removed as requested, moved to Drawer */}

      <FlatList
        data={groups}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchGroups} tintColor={theme.colors.primary} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Você não participa de nenhum grupo.</Text>}
      />

      {/* SIMPLE MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{modalMode === 'CREATE' ? 'Criar Novo Grupo' : 'Entrar em Grupo'}</Text>

            {modalMode === 'CREATE' ? (
              <TextInput
                style={styles.input}
                placeholder="Nome do Grupo (ex: Bonde da Zona Sul)"
                placeholderTextColor="#666"
                value={groupName}
                onChangeText={setGroupName}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Código do Convite (ex: #XYE123)"
                placeholderTextColor="#666"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={modalMode === 'CREATE' ? handleCreate : handleJoin}
                disabled={submitting}
              >
                <Text style={styles.modalBtnText}>{submitting ? '...' : 'Confirmar'}</Text>
              </TouchableOpacity>
            </View>
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
  title: {
    ...theme.typography.h2,
    color: 'white',
    marginLeft: theme.spacing.m,
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing.m,
    gap: theme.spacing.m,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  buttonText: {
    ...theme.typography.button,
    color: 'white',
    fontSize: 12,
  },
  list: {
    padding: theme.spacing.m,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginBottom: theme.spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  groupName: {
    ...theme.typography.h2,
    color: 'white',
    fontSize: 18,
  },
  inviteCode: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  arrow: {
    color: theme.colors.primary,
    fontSize: 24,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: 'white',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.background,
    color: 'white',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    marginBottom: theme.spacing.l,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ef4444',
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary,
  },
  modalBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
