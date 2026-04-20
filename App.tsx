import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PharmacyDetailScreen } from './src/screens/PharmacyDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import type { RootStackParamList } from './src/navigation/types';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.textPrimary,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Velora' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search medicine' }}
        />
        <Stack.Screen
          name="PharmacyDetail"
          component={PharmacyDetailScreen}
          options={{ title: 'Pharmacy' }}
        />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{ title: 'Emergency Mode', headerBackTitle: 'Back' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
