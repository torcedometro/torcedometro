import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RankingScreen } from '../screens/RankingScreen'; // Import Ranking
import { theme } from '../theme/theme';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.inputBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            return <Text style={{ fontSize: 24 }}>🏟️</Text>
          } else if (route.name === 'RankingTab') {
            return <Text style={{ fontSize: 24 }}>🏆</Text>
          } else if (route.name === 'ProfileTab') {
            return <Text style={{ fontSize: 24 }}>👤</Text>
          }
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Jogo' }}
      />
      <Tab.Screen
        name="RankingTab"
        component={RankingScreen}
        options={{ title: 'Ranking' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};
