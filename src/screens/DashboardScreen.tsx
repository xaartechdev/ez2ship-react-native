import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  // Chart data for weekly performance
  const chartData = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 95 },
    { day: 'Wed', value: 80 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 85 },
    { day: 'Sun', value: 95 },
  ];

  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, John</Text>
          <Text style={styles.subtitle}>Ready for your deliveries?</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {/* Today's Orders */}
            <View style={[styles.statCard, styles.ordersCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📦</Text>
              </View>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Today's Orders</Text>
            </View>

            {/* On-Time Rate */}
            <View style={[styles.statCard, styles.rateCard]}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIcon}>📈</Text>
              </View>
              <Text style={styles.statValue}>95%</Text>
              <Text style={styles.statLabel}>On-Time Rate</Text>
            </View>
          </View>
        </View>

        {/* Weekly Performance Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Performance</Text>
            <Text style={styles.chartIcon}>📊</Text>
          </View>
          
          <View style={styles.chart}>
            <View style={styles.chartBars}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: (item.value / maxValue) * 120,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Stats */}
          <View style={styles.weeklyStats}>
            <View style={styles.weeklyStatItem}>
              <Text style={styles.weeklyStatValue}>58</Text>
              <Text style={styles.weeklyStatLabel}>Completed</Text>
            </View>
            <View style={styles.weeklyStatItem}>
              <Text style={styles.weeklyStatValue}>$1,240</Text>
              <Text style={styles.weeklyStatLabel}>Earned</Text>
            </View>
            <View style={styles.weeklyStatItem}>
              <Text style={styles.weeklyStatValue}>92%</Text>
              <Text style={styles.weeklyStatLabel}>On-Time</Text>
            </View>
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
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
  chart: {
    height: 160,
    marginBottom: 24,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
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
});

export default DashboardScreen;