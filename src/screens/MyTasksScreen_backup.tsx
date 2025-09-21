import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Ac        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {new Date(task.scheduled_pickup).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>💰</Text>
            <Text style={styles.metaText}>${task.amount}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchTasks, 
  setFilter, 
  setSearch, 
  acceptTask, 
  rejectTask,
  clearError 
} from '../store/slices/tasksSlice';
import { Task } from '../services/tasksService';

interface MyTasksScreenProps {
  navigation: any;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, error, filter, search, summary } = useSelector((state: RootState) => state.tasks);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<Task['status']>('pending');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadTasks();
  }, [filter, search]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadTasks = async () => {
    try {
      await dispatch(fetchTasks({
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
        per_page: 20,
      })).unwrap();
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleFilterChange = (newFilter: 'all' | 'pending' | 'in_progress' | 'completed') => {
    dispatch(setFilter(newFilter));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  const handleAcceptTask = async (taskId: number) => {
    try {
      await dispatch(acceptTask(taskId)).unwrap();
      Alert.alert('Success', 'Task accepted successfully');
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to accept task');
    }
  };

  const handleRejectTask = (taskId: number) => {
    Alert.prompt(
      'Reject Task',
      'Please provide a reason for rejecting this task:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          onPress: async (reason?: string) => {
            if (reason && reason.trim()) {
              try {
                await dispatch(rejectTask({ taskId, reason: reason.trim() })).unwrap();
                Alert.alert('Success', 'Task rejected successfully');
              } catch (error: any) {
                Alert.alert('Error', error || 'Failed to reject task');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'assigned': return '#007AFF';
      case 'in_progress': return '#34C759';
      case 'picked_up': return '#5856D6';
      case 'in_transit': return '#AF52DE';
      case 'delivered': return '#30D158';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = task.status === activeFilter;
    const matchesSearch = task.order_id.toLowerCase().includes(searchText.toLowerCase()) ||
                         task.customer.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTaskCounts = () => {
    return {
      pending: tasks.filter(t => t.status === 'pending').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      delivered: tasks.filter(t => t.status === 'delivered').length,
    };
  };

  const taskCounts = getTaskCounts();

  const renderTaskCard = (task: Task) => (
    <View key={task.id} style={styles.taskCard}>
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskHeaderLeft}>
          <View style={styles.taskIconContainer}>
            {task.status === 'delivered' ? (
              <Text style={styles.taskIcon}>✅</Text>
            ) : task.status === 'in_progress' ? (
              <Text style={styles.taskIcon}>⚠️</Text>
            ) : (
              <Text style={styles.taskIcon}>▶️</Text>
            )}
          </View>
          <View style={styles.taskInfo}>
            <Text style={styles.orderId}>{task.order_id}</Text>
            <Text style={styles.customerName}>{task.customer.name}</Text>
          </View>
        </View>
        <View style={styles.taskHeaderRight}>
          <View style={[
            styles.statusBadge,
            task.status === 'in_progress' ? styles.inProgressBadge : styles.readyBadge
          ]}>
            <Text style={[
              styles.badgeStatusText,
              task.status === 'in_progress' ? styles.inProgressText : styles.readyText
            ]}>
              {getStatusText(task.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Task Details */}
      <View style={styles.taskDetails}>
        <View style={styles.taskType}>
          <Text style={styles.typeIcon}>�</Text>
          <Text style={styles.typeText}>Delivery</Text>
        </View>
        <Text style={styles.address}>{task.delivery_address}</Text>
        
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {new Date(task.estimated_delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>�</Text>
            <Text style={styles.metaText}>{task.package_type}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('OrderDetails', { 
            orderId: task.order_id, 
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
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterTabs}>
          {(['pending', 'in_progress', 'delivered'] as const).map((filter) => (
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
                 filter === 'in_progress' ? 'In Progress' : 'Delivered'}
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
          {activeFilter === 'pending' ? `Pending (${taskCounts.pending})` : 
           activeFilter === 'in_progress' ? `In Progress (${taskCounts.in_progress})` : 
           `Delivered (${taskCounts.delivered})`}
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
  // New styles for API integration
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  addressContainer: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 18,
  },
  instructionsContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  taskActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyTasksScreen;