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
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import {
  fetchTasks,
  setFilter,
  setSearch,
  clearError,
  resetPagination,
} from '../store/slices/tasksSlice';
import { Task } from '../services/tasksService';

interface MyTasksScreenProps {
  navigation: any;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, isLoading, isLoadingMore, error, filter, search, summary, pagination } = useSelector(
    (state: RootState) => state.tasks
  );

  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'pending' | 'in_progress' | 'completed'
  >('pending');
  const [searchText, setSearchText] = useState('');
  const [lastLoadMoreTrigger, setLastLoadMoreTrigger] = useState(0);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== search) {
        dispatch(setSearch(searchText));
        // Reset pagination and fetch with search
        dispatch(resetPagination());
        dispatch(fetchTasks({ 
          status: activeFilter, 
          search: searchText,
          page: 1
        }));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchText, search, dispatch, activeFilter]);

  useEffect(() => {
    // Load pending tasks by default when component mounts
    dispatch(resetPagination());
    dispatch(fetchTasks({ status: 'pending', page: 1 }));
  }, [dispatch]);

  // Refresh data when screen comes into focus (e.g., returning from OrderDetails)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(resetPagination());
      dispatch(fetchTasks({ status: activeFilter, search: search, page: 1 }));
    }, [dispatch, activeFilter, search])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    dispatch(resetPagination());
    // Use current active filter and search when refreshing
    await dispatch(fetchTasks({ status: activeFilter, search: search, page: 1 }));
    setRefreshing(false);
  };

  // Use counts from API summary instead of calculating locally
  const pendingCount = summary?.pending || 0;
  const inProgressCount = summary?.in_progress || 0;
  const completedCount = summary?.completed || 0;

  // Remove local filtering - use API data directly
  const filteredTasks = tasks;

  const handleFilterPress = (
    filter: 'pending' | 'in_progress' | 'completed'
  ) => {
    setActiveFilter(filter);
    dispatch(setFilter(filter));
    
    // Reset pagination and fetch with new filter
    dispatch(resetPagination());
    dispatch(fetchTasks({ status: filter, search: search, page: 1 }));
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  // Handle infinite scroll - auto load more when near bottom
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Only trigger if we have actual content
    if (contentSize.height <= 0) return;
    
    // Calculate how close we are to the bottom (using percentage for better mobile experience)
    const threshold = 100; // Trigger when 100px from bottom
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold;
    
    // Add debug logging
    console.log('📱 SCROLL DEBUG:', {
      contentHeight: contentSize.height,
      scrollY: contentOffset.y,
      screenHeight: layoutMeasurement.height,
      distanceFromBottom: contentSize.height - (layoutMeasurement.height + contentOffset.y),
      isCloseToBottom,
      hasMore: pagination.has_more,
      isLoadingMore,
      isLoading
    });
    
    if (isCloseToBottom && pagination.has_more && !isLoadingMore && !isLoading) {
      // Prevent multiple rapid calls with debounce
      const now = Date.now();
      if (now - lastLoadMoreTrigger < 1000) { // 1 second debounce
        return;
      }
      
      console.log('🚀 TRIGGERING LOAD MORE - Page:', pagination.current_page + 1);
      setLastLoadMoreTrigger(now);
      const nextPage = pagination.current_page + 1;
      dispatch(fetchTasks({ 
        status: activeFilter, 
        search: search, 
        page: nextPage, 
        loadMore: true 
      }));
    }
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
          value={searchText}
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
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={200}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
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
          <>
            {filteredTasks.map(renderTaskCard)}
            
            {/* Loading indicator for infinite scroll */}
            {isLoadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingMoreText}>Loading more tasks...</Text>
              </View>
            )}
          </>
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
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    marginTop: 10,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default MyTasksScreen;
