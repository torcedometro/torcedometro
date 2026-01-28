import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { AppTabs } from './AppTabs';
import { GroupsScreen } from '../screens/GroupsScreen';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { user, signOut } = useAuth();
  const { navigation } = props;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Header do Drawer */}
      <View style={styles.header}>
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{user?.full_name?.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuItems}>
        <DrawerItem
          label="Início"
          labelStyle={styles.label}
          onPress={() => navigation.navigate('Tabs')}
          icon={() => <Text>🏠</Text>}
        />
        <DrawerItem
          label="Minhas Comunidades"
          labelStyle={styles.label}
          onPress={() => navigation.navigate('GroupsNav')}
          icon={() => <Text>👥</Text>}
        />

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <DrawerItem
          label="Criar Novo Grupo"
          labelStyle={styles.label}
          onPress={() => navigation.navigate('GroupsNav', { action: 'CREATE' })}
          icon={() => <Text>➕</Text>}
        />
        <DrawerItem
          label="Resgatar Convite"
          labelStyle={styles.label}
          onPress={() => navigation.navigate('GroupsNav', { action: 'JOIN' })}
          icon={() => <Text>#️⃣</Text>}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <DrawerItem
          label="Sair da Conta"
          labelStyle={{ color: theme.colors.error }}
          onPress={signOut}
          icon={() => <Text>🚪</Text>}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export const AppDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Tabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 300,
        },
        drawerActiveBackgroundColor: theme.colors.primary,
        drawerActiveTintColor: 'white',
      }}
    >
      <Drawer.Screen name="Tabs" component={AppTabs} />
      {/*
        Usamos GroupsScreen aqui dentro do Drawer também?
        Se colocarmos na Stack principal, o Drawer fecha.
        Se colocarmos aqui, ele abre DENTRO do Drawer (com header do drawer).
        Idealmente: O Drawer tem links que navegam na Stack Principal ou muda a Tab.

        Mas como AppDrawer será o "Main", ele precisa conter as rotas acessíveis.
        Vamos colocar 'GroupsNav' apontando para GroupsScreen.
      */}
      <Drawer.Screen name="GroupsNav" component={GroupsScreen} initialParams={{ action: null }} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.inputBorder,
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarInitial: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    ...theme.typography.h2,
    color: 'white',
    fontSize: 18,
  },
  email: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  menuItems: {
    flex: 1,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginLeft: -16,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.inputBorder,
    marginVertical: theme.spacing.m,
    marginHorizontal: theme.spacing.m,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: theme.spacing.l,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.inputBorder,
    paddingVertical: theme.spacing.s,
  },
});
