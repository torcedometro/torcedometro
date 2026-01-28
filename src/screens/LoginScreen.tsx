import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Changed isLoading to loading
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const { signIn } = useAuth(); // Used useAuth hook

  const handleLogin = async () => {
    Keyboard.dismiss();

    // Basic Validation
    if (!email || !password) {
      Alert.alert('Ops!', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigation is handled by auth state listener in App (or we can navigate manually)
      // Main handles the tabs now
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Erro de Login', error.message || 'Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.header}>
              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>
            </View>

            {/* Form Section */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
                  placeholder="exemplo@email.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  accessibilityLabel="Campo de email"
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  style={[styles.input, passwordFocused && styles.inputFocused]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  accessibilityLabel="Campo de senha"
                />
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]} // Used loading
                onPress={handleLogin}
                disabled={loading} // Used loading
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Botão de Entrar">
                {loading ? ( // Used loading
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              {/* Sign Up Link */}
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.forgotText}>Não tem conta? Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  form: {
    gap: theme.spacing.l,
  },
  inputContainer: {
    marginBottom: theme.spacing.s,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  input: {
    backgroundColor: theme.colors.inputBg,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    color: theme.colors.text,
    fontSize: 16,
    height: 56, // Touch target optimized
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.l, // Pill shape often looks modern, or slightly rounded
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.s,
    elevation: 4, // Android shadow
    shadowColor: theme.colors.primary, // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  forgotButton: {
    alignItems: 'center',
    padding: theme.spacing.s,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
