import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootState } from '../store';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import FirstTimePasswordScreen from '../screens/FirstTimePasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileViewScreen from '../screens/ProfileViewScreen';
import VehicleInformationScreen from '../screens/VehicleInformationScreen';
import OrderDetailsScreen from '../screens/OrderDetailsScreen';
import TripProgressScreen from '../screens/TripProgressScreen';
import ProofOfDeliveryScreen from '../screens/ProofOfDeliveryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple Tab Icon Component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <Text style={{ fontSize: 20, color: color === '#007AFF' ? color : '#6c757d' }}>
    {icon}
  </Text>
);

// Bottom Tab Navigator for main app screens
const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: Platform.OS === 'ios' 
            ? 60 + insets.bottom 
            : 60 + Math.max(insets.bottom, 8),
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏠" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={MyTasksScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="�" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🔔" color={color} />
          ),
          tabBarBadge: 5,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="⚙️" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator (includes tabs + modal screens)
const AppStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="ProfileView" 
        component={ProfileScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="VehicleInformation" 
        component={VehicleInformationScreen}
        options={{
          presentation: 'card',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="TripProgress" 
        component={TripProgressScreen}
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen 
        name="ProofOfDelivery" 
        component={ProofOfDeliveryScreen}
        options={{
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

// Root Navigation
const RootNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  // Debug: Only log when values change to reduce console noise
  React.useEffect(() => {
    console.log('🧭 RootNavigator: Auth state changed -', { 
      isAuthenticated, 
      userId: user?.id, 
      isFirstLogin: user?.is_first_login 
    });
  }, [isAuthenticated, user?.id, user?.is_first_login]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : user?.is_first_login === 1 ? (
          <Stack.Screen 
            name="FirstTimePassword" 
            component={FirstTimePasswordScreen}
            options={{
              gestureEnabled: false,
            }}
          />
        ) : (
          <Stack.Screen name="Main" component={AppStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;