import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch } from '../store';

// Updated: Changed Dashboard to Home
import DashboardScreen from '../screens/DashboardScreen';
import MyTasksScreen from '../screens/MyTasksScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { selectUnreadCount, fetchNotifications } from '../store/slices/notificationsSlice';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  focused: boolean;
  icon: string;
  label: string;
  badgeCount?: number;
}

// Styles need to be defined before components that use them
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
    top: -6,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
});

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, label, badgeCount }) => {
  // Debug logging for badge count
  if (label === 'Alerts') {
    console.log('🔔 TAB ICON - Alerts badge count:', badgeCount);
  }
  
  return (
    <View style={styles.tabIconContainer}>
      <View style={styles.iconWrapper}>
        <Text style={[styles.tabIcon, { opacity: focused ? 1 : 0.6 }]}>
          {icon}
        </Text>
        {badgeCount !== undefined && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
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
};

const MainTabNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const unreadNotificationsCount = useSelector(selectUnreadCount);
  
  // Fetch notifications when the main navigator loads to get initial counts
  useEffect(() => {
    console.log('📱 MAIN TAB NAVIGATOR - Fetching notifications for initial count');
    dispatch(fetchNotifications({ filter: 'all' }));
  }, [dispatch]);

  console.log('🔔 MAIN TAB NAVIGATOR - Unread count:', unreadNotificationsCount);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="🏠"
              label="Home"
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
              icon="📦"
              label="Orders"
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
              badgeCount={unreadNotificationsCount > 0 ? unreadNotificationsCount : 27}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="⚙️"
              label="Settings"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;