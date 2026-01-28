import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from './src/types/navigation';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { CheckInScreen } from './src/screens/CheckInScreen';
import { GroupsScreen } from './src/screens/GroupsScreen';
import { GroupDetailScreen } from './src/screens/GroupDetailScreen';
import { AppTabs } from './src/navigation/AppTabs';
import { SideMenuScreen } from './src/screens/SideMenuScreen';
import { CreateGroupSelectorScreen } from './src/screens/CreateGroupSelectorScreen';
import { CreateEventGroupScreen } from './src/screens/CreateEventGroupScreen';
import { CreateCommunityGroupScreen } from './src/screens/CreateCommunityGroupScreen';
import { AuthProvider } from './src/contexts/AuthContext';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />

            {/* Voltamos para AppTabs como principal */}
            <Stack.Screen name="Main" component={AppTabs} />
            <Stack.Screen name="AppTabs" component={AppTabs} />

            {/* Menu Lateral Customizado */}
            <Stack.Screen
              name="SideMenu"
              component={SideMenuScreen}
              options={{
                presentation: 'transparentModal',
                animation: 'none', // Animação é feita dentro do componente
              }}
            />

            {/* Telas Extras */}
            <Stack.Screen name="CheckIn" component={CheckInScreen} />
            <Stack.Screen name="Groups" component={GroupsScreen} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen name="CreateGroupSelector" component={CreateGroupSelectorScreen} />
            <Stack.Screen name="CreateEventGroup" component={CreateEventGroupScreen} />
            <Stack.Screen name="CreateCommunityGroup" component={CreateCommunityGroupScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
