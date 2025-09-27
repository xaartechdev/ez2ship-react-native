import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { dashboardService, DashboardData } from '../services/dashboardService';
import { RootState } from '../store';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [userName, setUserName] = useState('User');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  // Get user name
  useEffect(() => {
    const getUserName = async () => {
      try {
        if (user) {
          const fullName = `${user.first_name} ${user.last_name}`.trim();
          setUserName(fullName || 'User');
        } else {
          const fullName = await authService.getUserFullName();
          setUserName(fullName);
        }
      } catch (error) {
        console.error('Error getting user name:', error);
        setUserName('User');
      }
    };

    getUserName();
  }, [user]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      console.log('📱 DASHBOARD SCREEN - STARTING DATA LOAD');
      setLoading(true);
      const data = await dashboardService.getDashboardData();
      console.log('📱 DASHBOARD SCREEN - DATA LOADED SUCCESSFULLY', data);
      setDashboardData(data);
    } catch (error: any) {
      console.error('📱 DASHBOARD SCREEN - ERROR:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Good morning, {userName}</Text>
              <Text style={styles.subtitle}>Ready for your deliveries?</Text>
            </View>
          </View>
        </View>

        {loading && !dashboardData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                {/* Today's Orders */}
                <View style={[styles.statCard, styles.ordersCard]}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>📦</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {dashboardData?.today_orders || 0}
                  </Text>
                  <Text style={styles.statLabel}>Today's Orders</Text>
                </View>

                {/* On-Time Rate */}
                <View style={[styles.statCard, styles.rateCard]}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>📈</Text>
                  </View>
                  <Text style={styles.statValue}>
                    {dashboardData?.monthly_stats 
                      ? dashboardService.formatPercentage(dashboardData.monthly_stats.on_time_rate)
                      : '0%'
                    }
                  </Text>
                  <Text style={styles.statLabel}>On-Time Rate</Text>
                </View>
              </View>
            </View>

            {/* Performance Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Performance Overview</Text>
                <Text style={styles.chartIcon}>📊</Text>
              </View>
              
              {/* Weekly Statistics */}
              <View style={styles.weeklyStats}>
                <View style={styles.weeklyStatItem}>
                  <Text style={styles.weeklyStatValue}>
                    {dashboardData?.monthly_stats?.completed_orders || 0}
                  </Text>
                  <Text style={styles.weeklyStatLabel}>Completed</Text>
                </View>
                <View style={styles.weeklyStatItem}>
                  <Text style={styles.weeklyStatValue}>
                    {dashboardData?.monthly_stats 
                      ? dashboardService.formatEarnings(dashboardData.monthly_stats.total_earnings)
                      : '$0'
                    }
                  </Text>
                  <Text style={styles.weeklyStatLabel}>Earned</Text>
                </View>
                <View style={styles.weeklyStatItem}>
                  <Text style={styles.weeklyStatValue}>
                    {dashboardData?.monthly_stats 
                      ? dashboardService.formatPercentage(dashboardData.monthly_stats.on_time_rate)
                      : '0%'
                    }
                  </Text>
                  <Text style={styles.weeklyStatLabel}>On-Time</Text>
                </View>
              </View>
            </View>

            {/* Bottom spacing */}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  rateCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chartIcon: {
    fontSize: 20,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  weeklyStatItem: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});

export default DashboardScreen;
