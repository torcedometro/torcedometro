import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<RootStackParamList, 'SideMenu'>;

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75; // 75% da tela

export const SideMenuScreen = ({ navigation }: Props) => {
  const { user, signOut } = useAuth();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current; // Começa escondido na esquerda
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animar entrada
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.5, // Opacidade do fundo preto
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
      if (callback) callback();
    });
  };

  const navigateTo = (screen: any, params?: any) => {
    closeMenu(() => {
      // Pequeno delay para garantir que o modal fechou visualmente antes da transição da stack
      setTimeout(() => {
        navigation.navigate(screen, params);
      }, 50);
    });
  };

  const handleSignOut = () => {
    closeMenu(() => {
      signOut();
    });
  };

  return (
    <View style={styles.container}>
      {/* Overlay Escuro (Fundo) - Clica para fechar */}
      <TouchableWithoutFeedback onPress={() => closeMenu()}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Conteúdo do Menu (Desliza da esquerda) */}
      <Animated.View
        style={[
          styles.menu,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header do Perfil */}
          <View style={styles.profileHeader}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{user?.full_name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>

          {/* Itens do Menu */}
          <View style={styles.menuItems}>
            <MenuItem
              icon="🏠"
              label="Início"
              onPress={() => navigateTo('AppTabs', { screen: 'Home' })}
            />

            <MenuItem
              icon="👥"
              label="Minhas Comunidades"
              onPress={() => navigateTo('Groups')}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>AÇÕES RÁPIDAS</Text>

            <MenuItem
              icon="➕"
              label="Criar Novo Grupo"
              onPress={() => navigateTo('CreateGroupSelector')}
              highlight
            />

            <MenuItem
              icon="#️⃣"
              label="Resgatar Convite"
              onPress={() => navigateTo('Groups', { mode: 'JOIN' })}
              highlight
            />

          </View>

          {/* Footer - Sair */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>🚪 Sair da Conta</Text>
          </TouchableOpacity>

        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

// Componente Auxiliar de Item
const MenuItem = ({ icon, label, onPress, highlight }: any) => (
  <TouchableOpacity style={[styles.menuItem, highlight && styles.highlightItem]} onPress={onPress}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={[styles.menuLabel, highlight && styles.highlightText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background transparente é garantido pelo presentation: transparentModal
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  menu: {
    width: MENU_WIDTH,
    height: '100%',
    backgroundColor: '#1E293B', // Slate 800 - Fundo Escuro bonito
    borderRightWidth: 1,
    borderRightColor: theme.colors.inputBorder,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  menuItems: {
    flex: 1,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  highlightItem: {
    // backgroundColor: 'rgba(56, 189, 248, 0.1)', // Highlight azulado bem leve
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 25,
    textAlign: 'center',
  },
  menuLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  highlightText: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
    marginHorizontal: 10,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
    marginTop: 5,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444', // Red 500
    fontSize: 16,
    fontWeight: 'bold',
  }
});
