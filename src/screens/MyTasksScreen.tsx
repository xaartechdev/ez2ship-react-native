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
  clearError,
} from '../store/slices/tasksSlice';
import { Task } from '../services/tasksService';

interface MyTasksScreenProps {
  navigation: any;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, error, filter, search, summary } = useSelector(
    (state: RootState) => state.tasks
  );

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'pending' | 'in_progress' | 'completed'
  >('pending');

  useEffect(() => {
    dispatch(fetchTasks({}));
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasks({}));
    setRefreshing(false);
  };

  // Count tasks
  const pendingCount = tasks.filter(
    (task) =>
      task.status === 'pending' ||
      task.status === '' ||
      task.status === 'assigned'
  ).length;

  const inProgressCount = tasks.filter(
    (task) =>
      task.status === 'in_progress' ||
      task.status === 'picked_up' ||
      task.status === 'in_transit'
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === 'delivered' || task.status === 'cancelled'
  ).length;

  const filteredTasks = tasks.filter((task) => {
    let matchesFilter = false;
    switch (activeFilter) {
      case 'pending':
        matchesFilter =
          task.status === 'pending' ||
          task.status === '' ||
          task.status === 'assigned';
        break;
      case 'in_progress':
        matchesFilter =
          task.status === 'in_progress' ||
          task.status === 'picked_up' ||
          task.status === 'in_transit';
        break;
      case 'completed':
        matchesFilter =
          task.status === 'delivered' || task.status === 'cancelled';
        break;
      default:
        matchesFilter = true;
    }

    const matchesSearch =
      search === '' ||
      task.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      task.pickup_address.toLowerCase().includes(search.toLowerCase()) ||
      task.delivery_address.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleFilterPress = (
    filter: 'pending' | 'in_progress' | 'completed'
  ) => {
    setActiveFilter(filter);
    dispatch(setFilter(filter));
    
    // Map UI filter to API status values - apiClient will handle 'in_progress' to 'in_transit' mapping
    let apiStatus: 'pending' | 'in_progress' | 'completed';
    switch (filter) {
      case 'pending':
        apiStatus = 'pending';
        break;
      case 'in_progress':
        apiStatus = 'in_progress'; // apiClient will map this to 'in_transit'
        break;
      case 'completed':
        apiStatus = 'completed';
        break;
      default:
        apiStatus = 'pending';
    }
    
    // Make API call with the correct status
    dispatch(fetchTasks({ status: apiStatus }));
  };

  const handleSearchChange = (text: string) => {
    dispatch(setSearch(text));
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('OrderDetails', { task });
  };

  const handleCallCustomer = (phoneNumber: string) => {
    Alert.alert('Call Customer', `Call ${phoneNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call',
        onPress: () => {
          console.log('Calling:', phoneNumber);
        },
      },
    ]);
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
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(task.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(task.status, task.is_overdue)}
            </Text>
          </View>
          {task.is_overdue && (
            <Text style={styles.overdueText}>Overdue</Text>
          )}
        </View>
      </View>

      <Text style={styles.customerName}>{task.customer_name}</Text>

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
              {task.scheduled_pickup
                ? new Date(task.scheduled_pickup).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'TBD'}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
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
      </View>

      {/* Compact Summary Row */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryCount}>{pendingCount}</Text>
          <Text style={styles.summaryText}>Pending</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryCount, { color: '#007AFF' }]}>
            {inProgressCount}
          </Text>
          <Text style={styles.summaryText}>In Progress</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryCount, { color: '#34C759' }]}>
            {completedCount}
          </Text>
          <Text style={styles.summaryText}>Completed</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'pending', label: `Pending (${pendingCount})` },
          { key: 'in_progress', label: `In Progress (${inProgressCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeFilter === tab.key && styles.activeTab,
            ]}
            onPress={() =>
              handleFilterPress(tab.key as 'pending' | 'in_progress' | 'completed')
            }
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  title: { fontSize: 22, fontWeight: '600', color: '#000' },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  summaryBox: { alignItems: 'center' },
  summaryCount: { fontSize: 18, fontWeight: '600', color: '#FF9500' },
  summaryText: { fontSize: 13, color: '#666' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
  },
  searchInput: {
    flex: 1,
    height: 38,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
    fontSize: 14,
  },
  filterIcon: {
    marginLeft: 8,
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconText: { fontSize: 16, color: '#666' },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'space-around',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F1F1',
  },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 12, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#FFF' },

  tasksList: { flex: 1, padding: 16 },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taskId: { fontSize: 14, color: '#666', fontWeight: '500' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, color: '#FFF', fontWeight: '600' },
  overdueText: { marginLeft: 4, color: '#FF3B30', fontSize: 12 },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#000',
  },
  addressSection: { marginTop: 4 },
  typeIndicator: { flexDirection: 'row', alignItems: 'center' },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  typeText: { fontSize: 12, color: '#666' },
  address: { fontSize: 14, color: '#333', marginTop: 2 },
  taskMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaIcon: { marginRight: 4 },
  metaText: { fontSize: 12, color: '#666' },
  callButton: { marginLeft: 'auto' },
  callIcon: { fontSize: 16 },
  loadingContainer: { marginTop: 40, alignItems: 'center' },
  emptyContainer: { marginTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
});

export default MyTasksScreen;
