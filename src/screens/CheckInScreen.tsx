import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { isWithinStadium, calculateDistance } from '../utils/geo';
import { checkinService } from '../services/checkin';
import { useAuth } from '../contexts/AuthContext';

type CheckInScreenProps = NativeStackScreenProps<RootStackParamList, 'CheckIn'>;

export const CheckInScreen = ({ route, navigation }: CheckInScreenProps) => {
  const { game } = route.params;
  const { user, refreshUserData } = useAuth();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [distance, setDistance] = useState<number | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);

  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    try {
      setCheckingLocation(true);
      setErrorMsg(null);

      // 1. Permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permissão de localização negada. Habilite nas configurações para fazer check-in.');
        setCheckingLocation(false);
        return;
      }

      // 2. Get Location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);

      // 3. Check Fence
      if (game.stadium) {
        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;
        const stadiumLat = game.stadium.latitude;
        const stadiumLon = game.stadium.longitude;
        const radius = game.stadium.radius_meters;

        const dist = calculateDistance(userLat, userLon, stadiumLat, stadiumLon);
        setDistance(dist);

        const allowed = dist <= radius;
        setIsAllowed(allowed);

        if (!allowed) {
          // Optional: for testing/demo purposes, we might want to be lenient or show a bypass in debug mode
          // For now, strict mode.
          console.log(`User is ${dist}m away from stadium (Limit: ${radius}m)`);
        }
      } else {
        setErrorMsg('Dados do estádio não encontrados.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Erro ao obter localização. Verifique seu GPS.');
    } finally {
      setCheckingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      // Request Camera Permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert("Permissão negada", "O app precisa de acesso à câmera.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Selfie format
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao abrir câmera");
    }
  };

  const handleSubmit = async () => {
    if (!user || !game.stadium || !location || !photo) return;

    try {
      setSubmitting(true);
      await checkinService.createCheckIn({
        userId: user.id,
        gameId: game.id,
        stadiumId: game.stadium.id,
        photoUri: photo!, // Force non-null assertion
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      // Trigger Points Refresh!
      await refreshUserData();

      Alert.alert('GOLAÇO!', 'Check-in realizado! +10 PONTOS', [
        { text: 'OK', onPress: () => navigation.goBack() } // Go back to previous screen
      ]);

    } catch (error: any) {
      Alert.alert('Erro no Check-in', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (checkingLocation) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Verificando localização...</Text>
        </View>
      );
    }

    if (errorMsg) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
            <Text style={styles.buttonText}>TENTAR NOVAMENTE</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!isAllowed) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.title}>Você está longe do estádio</Text>
          <Text style={styles.distanceText}>
            Distância: {(distance || 0).toFixed(0)} metros
          </Text>
          <Text style={styles.subtitle}>
            Chegue mais perto do {game.stadium?.name} para liberar o check-in.
            (Raio permitido: {game.stadium?.radius_meters}m)
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
            <Text style={styles.buttonText}>ATUALIZAR LOCALIZAÇÃO</Text>
          </TouchableOpacity>

          {/* DEV BUTTON */}
          <TouchableOpacity
            style={[styles.retryButton, { marginTop: 20, borderColor: theme.colors.textSecondary }]}
            onPress={() => {
              // Mock location to match stadium
              setLocation({
                coords: {
                  latitude: game.stadium!.latitude,
                  longitude: game.stadium!.longitude,
                  altitude: 0,
                  accuracy: 10,
                  altitudeAccuracy: 10,
                  heading: 0,
                  speed: 0
                },
                timestamp: Date.now()
              });
              setIsAllowed(true);
            }}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
              🛠️ [DEV] SIMULAR PRESENÇA
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Success Phase: Allowed to Check-in
    return (
      <View style={styles.actionContainer}>
        <Text style={styles.successTitle}>Você está no estádio!</Text>
        <Text style={styles.stadiumName}>{game.stadium?.name}</Text>

        <View style={styles.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.previewImage} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.placeholderText}>Sua foto aqui</Text>
            </View>
          )}
        </View>

        {!photo ? (
          <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
            <Text style={styles.buttonText}>📸 TIRAR SELFIE</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%', gap: 10 }}>
            <TouchableOpacity style={[styles.primaryButton, submitting && styles.disabledButton]} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>✅ CONFIRMAR CHECK-IN</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto} disabled={submitting}>
              <Text style={styles.secondaryButtonText}>Tirar outra foto</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check-in de Jogo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
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
    padding: theme.spacing.s,
  },
  backText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginLeft: theme.spacing.m,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
  },
  loadingText: {
    marginTop: theme.spacing.m,
    color: theme.colors.textSecondary,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
    fontSize: 16,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  distanceText: {
    ...theme.typography.h1,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontSize: 32,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  actionContainer: {
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    ...theme.typography.h2,
    color: '#4ade80', // Green
    marginBottom: theme.spacing.xs,
  },
  stadiumName: {
    ...theme.typography.body,
    color: theme.colors.white,
    marginBottom: theme.spacing.xl,
  },
  photoContainer: {
    width: 250,
    height: 250,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surface,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    width: '100%',
    padding: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    fontSize: 16,
  },
  retryButton: {
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.m,
  },
  secondaryButton: {
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textSecondary,
  },
});
