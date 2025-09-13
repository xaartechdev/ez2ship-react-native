import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Task {
  id: string;
  orderId: string;
  customerName: string;
  type: 'pickup' | 'delivery';
  address: string;
  time: string;
  distance: string;
  status: 'pending' | 'in-progress' | 'completed';
  statusLabel?: string;
  overdue?: boolean;
}

interface MyTasksScreenProps {
  navigation: any;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [searchText, setSearchText] = useState('');

  // Mock task data
  const tasks: Task[] = [
    {
      id: '1',
      orderId: 'ORD-2024-001',
      customerName: 'Sarah Johnson',
      type: 'pickup',
      address: '123 Warehouse St, Industrial District, CA 90210',
      time: '2:30 PM',
      distance: '12.5 miles',
      status: 'pending',
      statusLabel: 'Ready',
      overdue: true,
    },
    {
      id: '2',
      orderId: 'ORD-2024-002',
      customerName: 'Mike Chen',
      type: 'delivery',
      address: '321 Office Plaza, Business District, CA 90213',
      time: '5:00 PM',
      distance: '8.2 miles',
      status: 'in-progress',
      statusLabel: 'In Transit',
      overdue: true,
    },
    {
      id: '3',
      orderId: 'ORD-2024-003',
      customerName: 'Emily Davis',
      type: 'delivery',
      address: '777 Retail Center, North Hills, CA 90215',
      time: '7:30 PM',
      distance: '15.7 miles',
      status: 'in-progress',
      statusLabel: 'At Destination',
      overdue: true,
    },
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = task.status === activeFilter;
    const matchesSearch = task.orderId.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.customerName.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTaskCounts = () => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      'in-progress': tasks.filter(t => t.status === 'in-progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
    };
  };

  const taskCounts = getTaskCounts();

  const renderTaskCard = (task: Task) => (
    <View key={task.id} style={styles.taskCard}>
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <View style={styles.taskIconContainer}>
            {task.status === 'completed' ? (
              <Text style={styles.taskIcon}>✅</Text>
            ) : task.status === 'in-progress' ? (
              <Text style={styles.taskIcon}>⚠️</Text>
            ) : (
              <Text style={styles.taskIcon}>▶️</Text>
            )}
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.orderId}>{task.orderId}</Text>
            <Text style={styles.customerName}>{task.customerName}</Text>
          </View>
        </View>
        <View style={styles.taskHeaderRight}>
          <View style={[
            styles.statusBadge,
            task.status === 'in-progress' ? styles.inProgressBadge : styles.readyBadge
          ]}>
            <Text style={[
              styles.badgeStatusText,
              task.status === 'in-progress' ? styles.inProgressText : styles.readyText
            ]}>
              {task.statusLabel || task.status}
            </Text>
          </View>
          {task.overdue && (
            <Text style={styles.overdueText}>Overdue</Text>
          )}
        </View>
      </View>

      {/* Task Details */}
      <View style={styles.taskDetails}>
        <View style={styles.taskType}>
          <Text style={styles.typeIcon}>
            {task.type === 'pickup' ? '🟢' : '🟢'}
          </Text>
          <Text style={styles.typeText}>
            {task.type === 'pickup' ? 'Pickup' : 'Delivery'}
          </Text>
        </View>
        <Text style={styles.address}>{task.address}</Text>
        
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>{task.time}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>{task.distance}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrderDetails', { 
            orderId: task.orderId, 
            taskId: task.id 
          })}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterTabs}>
          {(['pending', 'in-progress', 'completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={styles.filterNumber}>
                {taskCounts[filter]}
              </Text>
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText
              ]}>
                {filter === 'pending' ? 'Pending' : 
                 filter === 'in-progress' ? 'In Progress' : 'Completed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonIcon}>🔽</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {activeFilter === 'pending' ? 'Pending (1)' : 
           activeFilter === 'in-progress' ? 'In Progress (2)' : 'Completed (2)'}
        </Text>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
        {filteredTasks.map(renderTaskCard)}
        
        {/* Bottom spacing for tab bar */}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  filtersContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  filterText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#007AFF',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonIcon: {
    fontSize: 16,
  },
  statusContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconContainer: {
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#6c757d',
  },
  taskHeaderRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 4,
  },
  inProgressBadge: {
    backgroundColor: '#007AFF',
  },
  readyBadge: {
    backgroundColor: '#007AFF',
  },
  badgeStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inProgressText: {
    color: '#ffffff',
  },
  readyText: {
    color: '#ffffff',
  },
  overdueText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  taskDetails: {
    marginTop: 8,
  },
  taskType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  address: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6c757d',
    marginRight: 16,
  },
  callButton: {
    padding: 8,
  },
  callIcon: {
    fontSize: 16,
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default MyTasksScreen;