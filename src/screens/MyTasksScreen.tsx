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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchTasks, 
  setFilter, 
  setSearch,
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
  const [activeFilter, setActiveFilter] = useState<'pending' | 'in_progress' | 'completed'>('pending');

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasks({}));
    setRefreshing(false);
  };

  // Calculate task counts for summary cards
  const pendingCount = tasks.filter(task => 
    task.status === 'pending' || task.status === '' || task.status === 'assigned'
  ).length;
  
  const inProgressCount = tasks.filter(task => 
    task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit'
  ).length;
  
  const completedCount = tasks.filter(task => 
    task.status === 'delivered' || task.status === 'cancelled'
  ).length;

  const filteredTasks = tasks.filter(task => {
    // Map filter to actual task statuses
    let matchesFilter = false;
    switch (activeFilter) {
      case 'pending':
        matchesFilter = task.status === 'pending' || task.status === '' || task.status === 'assigned';
        break;
      case 'in_progress':
        matchesFilter = task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit';
        break;
      case 'completed':
        matchesFilter = task.status === 'delivered' || task.status === 'cancelled';
        break;
      default:
        matchesFilter = true;
    }
    
    const matchesSearch = search === '' || 
      task.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      task.pickup_address.toLowerCase().includes(search.toLowerCase()) ||
      task.delivery_address.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleFilterPress = (filter: 'pending' | 'in_progress' | 'completed') => {
    setActiveFilter(filter);
    // Map to store slice filter values
    const storeFilter = filter === 'completed' ? 'completed' : filter;
    if (storeFilter === 'pending' || storeFilter === 'in_progress' || storeFilter === 'completed') {
      dispatch(setFilter(storeFilter));
    }
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetails', { task });
  };

  const handleCallCustomer = (phoneNumber: string) => {
    // You can implement phone calling functionality here
    Alert.alert(
      'Call Customer',
      `Call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // Implement actual phone call here using Linking
          // Linking.openURL(`tel:${phoneNumber}`);
          console.log('Calling:', phoneNumber);
        }}
      ]
    );
  };

  const renderTaskCard = (task: Task) => (
    <TouchableOpacity 
      key={task.id} 
      style={styles.taskCard}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>{task.order_id}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <Text style={styles.statusText}>{getStatusText(task.status, task.is_overdue)}</Text>
          </View>
          {task.is_overdue && (
            <Text style={styles.overdueText}>Overdue</Text>
          )}
        </View>
      </View>
      
      <Text style={styles.customerName}>{task.customer_name}</Text>
      
      {/* Pickup Section */}
      <View style={styles.addressSection}>
        <View style={styles.typeIndicator}>
          <View style={styles.greenDot} />
          <Text style={styles.typeText}>Pickup</Text>
        </View>
        <Text style={styles.address}>{task.pickup_address}</Text>
        
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {task.scheduled_pickup ? new Date(task.scheduled_pickup).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>�</Text>
            <Text style={styles.metaText}>{task.distance} miles</Text>
          </View>
          <TouchableOpacity 
            style={styles.callButton}
            onPress={() => handleCallCustomer(task.customer_phone)}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusText = (status: string, isOverdue: boolean) => {
    if (isOverdue) return 'Overdue';
    
    switch (status) {
      case 'pending':
      case '':
      case 'assigned': 
        return 'Ready';
      case 'in_progress': 
        return 'In Progress';
      case 'picked_up': 
        return 'Picked Up';
      case 'in_transit': 
        return 'In Transit';
      case 'delivered': 
        return 'Delivered';
      case 'cancelled': 
        return 'Cancelled';
      default: 
        return 'Ready';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case '':
      case 'assigned': 
        return '#007AFF';
      case 'in_progress': 
        return '#007AFF';
      case 'picked_up': 
        return '#FF9500';
      case 'in_transit': 
        return '#FF9500';
      case 'delivered': 
        return '#34C759';
      case 'cancelled': 
        return '#FF3B30';
      default: 
        return '#007AFF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        {summary && (
          <Text style={styles.subtitle}>
            {tasks.length} total, {summary.pending} pending, {summary.in_progress} in progress
          </Text>
        )}
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#007AFF' }]}>{inProgressCount}</Text>
          <Text style={styles.summaryLabel}>In Progress</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#34C759' }]}>{completedCount}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChangeText={handleSearchChange}
          />
          <TouchableOpacity style={styles.filterIcon}>
            <Text style={styles.filterIconText}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'in_progress', label: `In Progress (${inProgressCount})` },
          { key: 'completed', label: `Completed (${completedCount})` }
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              activeFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => handleFilterPress(filter.key as 'pending' | 'in_progress' | 'completed')}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => dispatch(clearError())}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tasks List */}
      <ScrollView 
        style={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9500',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    marginRight: 10,
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconText: {
    fontSize: 16,
    color: '#666666',
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 3,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  activeFilterTab: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#CC0000',
    flex: 1,
  },
  dismissText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tasksList: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overdueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF3B30',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  addressSection: {
    marginBottom: 12,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  typeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
  },
  address: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 18,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 18,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
  callButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  callIcon: {
    fontSize: 16,
  },
});

export default MyTasksScreen;