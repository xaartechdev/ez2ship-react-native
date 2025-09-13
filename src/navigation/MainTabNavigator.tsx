import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import AlertsScreen from '../screens/AlertsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
  badgeCount?: number;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label, badgeCount }) => (
  <View style={styles.tabIconContainer}>
    <View style={styles.iconWrapper}>
      <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
        {icon}
      </Text>
      {badgeCount && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
    <Text style={[
      styles.tabLabel,
      { color: focused ? '#007AFF' : '#6c757d' }
    ]}>
      {label}
    </Text>
  </View>
);

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="🏠"
              label="Dashboard"
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyTasks"
        component={MyTasksScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="📋"
              label="My Tasks"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="🔔"
              label="Alerts"
              badgeCount={2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="👤"
              label="Profile"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 88,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default MainTabNavigator;