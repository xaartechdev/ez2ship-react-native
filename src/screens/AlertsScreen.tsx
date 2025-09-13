import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AlertsScreenProps {
  navigation: any;
}

interface Notification {
  id: string;
  type: 'new_order' | 'trip_update' | 'message' | 'cancelled';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'new_order',
      title: 'New Order Assigned',
      message: 'Order ORD-2024-006 has been assigned to you',
      date: '15/1/2024',
      isRead: false,
      icon: '📦',
      iconColor: '#007AFF',
    },
    {
      id: '2',
      type: 'trip_update',
      title: 'Trip Update',
      message: 'Pickup time changed for ORD-2024-002',
      date: '15/1/2024',
      isRead: false,
      icon: '🕐',
      iconColor: '#FF9500',
    },
    {
      id: '3',
      type: 'message',
      title: 'Message from Dispatcher',
      message: 'Please confirm your availability for tomorrow',
      date: '14/1/2024',
      isRead: true,
      icon: '💬',
      iconColor: '#34C759',
    },
    {
      id: '4',
      type: 'cancelled',
      title: 'Order Cancelled',
      message: 'Order ORD-2024-003 has been cancelled',
      date: '14/1/2024',
      isRead: true,
      icon: '❌',
      iconColor: '#FF3B30',
    },
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const allCount = notifications.length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'all' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'all' && styles.activeFilterText
          ]}>
            All ({allCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'unread' && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text style={[
            styles.filterText,
            activeFilter === 'unread' && styles.activeFilterText
          ]}>
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={[
              styles.notificationBorder,
              { backgroundColor: notification.iconColor }
            ]} />
            
            <View style={styles.notificationContent}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationLeft}>
                  <View style={[
                    styles.notificationIcon,
                    { backgroundColor: `${notification.iconColor}20` }
                  ]}>
                    <Text style={styles.notificationIconText}>{notification.icon}</Text>
                  </View>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationDate}>{notification.date}</Text>
                  </View>
                </View>
                
                <View style={styles.notificationActions}>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                  <View style={styles.actionButtons}>
                    {!notification.isRead && (
                      <TouchableOpacity 
                        style={styles.markReadButton}
                        onPress={() => handleMarkAsRead(notification.id)}
                      >
                        <Text style={styles.markReadIcon}>✓</Text>
                        <Text style={styles.markReadText}>Mark read</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.dismissButton}
                      onPress={() => handleDismiss(notification.id)}
                    >
                      <Text style={styles.dismissIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  markAllReadText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterTab: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#1a1a1a',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationBorder: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  notificationContent: {
    flex: 1,
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationIconText: {
    fontSize: 20,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  notificationActions: {
    alignItems: 'flex-end',
  },
  unreadDot: {
    width: 8,
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  markReadIcon: {
    fontSize: 12,
    color: '#34C759',
    marginRight: 4,
  },
  markReadText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  dismissButton: {
    width: 32,
    height: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissIcon: {
    fontSize: 14,
    color: '#6c757d',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default AlertsScreen;