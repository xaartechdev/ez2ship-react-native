import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';
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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🏠" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="My Tasks"
        component={MyTasksScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📋" color={color} />
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
          tabBarBadge: 2,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <TabIcon icon="👤" color={color} />
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
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Auth"
      >
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
        <Stack.Screen name="Main" component={AppStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;