import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface OrderDetailsScreenProps {
  route?: {
    params?: {
      orderId: string;
      customerName: string;
      status: string;
    };
  };
  navigation?: any;
}

const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ route, navigation }) => {
  const { orderId = 'ORD-2024-001', customerName = 'Sarah Johnson', status = 'Start Trip' } = route?.params || {};

  const orderData = {
    'ORD-2024-001': {
      customer: 'Sarah Johnson',
      vehicleType: 'Van',
      distance: '12.5 miles',
      duration: '35 min',
      scheduled: 'Mon, Jan 15, 2:30 PM',
      pickupAddress: '123 Warehouse St, Industrial District, CA 90210',
      deliveryAddress: '456 Customer Ave, Downtown, CA 90211',
      status: 'Start Trip',
    },
    'ORD-2024-002': {
      customer: 'Mike Chen',
      vehicleType: 'Van',
      distance: '8.2 miles',
      duration: '25 min',
      scheduled: 'Mon, Jan 15, 5:00 PM',
      pickupAddress: '789 Supply Center, West Side, CA 90212',
      deliveryAddress: '321 Office Plaza, Business District, CA 90213',
      status: 'In Transit',
    },
    'ORD-2024-003': {
      customer: 'Emily Davis',
      vehicleType: 'Van',
      distance: '15.7 miles',
      duration: '40 min',
      scheduled: 'Mon, Jan 15, 7:30 PM',
      pickupAddress: '555 Manufacturing Way, South End, CA 90214',
      deliveryAddress: '777 Retail Center, North Hills, CA 90215',
      status: 'Arrived at Destination',
    },
  };

  const order = orderData[orderId as keyof typeof orderData];

  const handleStartTrip = () => {
    navigation.navigate('TripProgress', { orderId, status: 'Start Trip' });
  };

  const handleInTransit = () => {
    navigation.navigate('TripProgress', { orderId, status: 'In Transit' });
  };

  const handleArrivedAtDestination = () => {
    navigation.navigate('TripProgress', { orderId, status: 'Arrived at Destination' });
  };

  const getStatusButton = () => {
    switch (order.status) {
      case 'Start Trip':
        return (
          <TouchableOpacity style={styles.startTripButton} onPress={handleStartTrip}>
            <Text style={styles.startTripButtonText}>✈️ Start Trip</Text>
          </TouchableOpacity>
        );
      case 'In Transit':
        return (
          <TouchableOpacity style={styles.arrivedButton} onPress={handleInTransit}>
            <Text style={styles.arrivedButtonText}>Arrived at Destination</Text>
          </TouchableOpacity>
        );
      case 'Arrived at Destination':
        return (
          <TouchableOpacity style={styles.deliveredButton} onPress={handleArrivedAtDestination}>
            <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const getHeaderButton = () => {
    switch (order.status) {
      case 'Start Trip':
        return (
          <TouchableOpacity style={styles.headerButton} onPress={handleStartTrip}>
            <Text style={styles.headerButtonText}>Start Trip</Text>
          </TouchableOpacity>
        );
      case 'In Transit':
        return (
          <TouchableOpacity style={[styles.headerButton, styles.inTransitButton]}>
            <Text style={styles.headerButtonText}>In Transit</Text>
          </TouchableOpacity>
        );
      case 'Arrived at Destination':
        return (
          <TouchableOpacity style={[styles.headerButton, styles.arrivedHeaderButton]}>
            <Text style={styles.headerButtonText}>Arrived at Destination</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{orderId}</Text>
        {getHeaderButton()}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{order.customer}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Vehicle Type</Text>
              <Text style={styles.detailValue}>{order.vehicleType}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{order.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{order.duration}</Text>
            </View>
          </View>

          <View style={styles.scheduledContainer}>
            <Text style={styles.detailLabel}>Scheduled</Text>
            <View style={styles.scheduledRow}>
              <Text style={styles.scheduledValue}>{order.scheduled}</Text>
              <TouchableOpacity style={styles.callButton}>
                <Text style={styles.callIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.alertButton}>
                <Text style={styles.alertIcon}>⚠️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Addresses Section */}
        <View style={styles.section}>
          {/* Pickup Address */}
          <View style={styles.addressItem}>
            <View style={styles.addressHeader}>
              <Text style={styles.pickupDot}>🟢</Text>
              <Text style={styles.addressLabel}>Pickup Address</Text>
            </View>
            <Text style={styles.addressValue}>{order.pickupAddress}</Text>
          </View>

          {/* Delivery Address */}
          <View style={styles.addressItem}>
            <View style={styles.addressHeader}>
              <Text style={styles.deliveryDot}>🔴</Text>
              <Text style={styles.addressLabel}>Delivery Address</Text>
            </View>
            <Text style={styles.addressValue}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Trip Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Progress</Text>
          
          <View style={styles.progressItem}>
            <View style={styles.progressIcon}>
              <Text style={styles.progressIconText}>✅</Text>
            </View>
            <Text style={styles.progressText}>Start Trip</Text>
            {order.status !== 'Start Trip' && (
              <View style={styles.progressDot} />
            )}
          </View>

          {order.status === 'In Transit' && (
            <View style={styles.progressItem}>
              <View style={[styles.progressIcon, styles.activeProgressIcon]}>
                <Text style={styles.progressIconText}>🚛</Text>
              </View>
              <Text style={[styles.progressText, styles.activeProgressText]}>In Transit</Text>
              <View style={[styles.progressDot, styles.activeProgressDot]} />
            </View>
          )}

          {order.status === 'Arrived at Destination' && (
            <>
              <View style={styles.progressItem}>
                <View style={styles.progressIcon}>
                  <Text style={styles.progressIconText}>✅</Text>
                </View>
                <Text style={styles.progressText}>In Transit</Text>
                <View style={styles.progressDot} />
              </View>
              <View style={styles.progressItem}>
                <View style={[styles.progressIcon, styles.activeProgressIcon]}>
                  <Text style={styles.progressIconText}>📍</Text>
                </View>
                <Text style={[styles.progressText, styles.activeProgressText]}>Arrived at Destination</Text>
                <View style={[styles.progressDot, styles.activeProgressDot]} />
              </View>
            </>
          )}
        </View>

        {/* Action Button */}
        {getStatusButton()}

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inTransitButton: {
    backgroundColor: '#007AFF',
  },
  arrivedHeaderButton: {
    backgroundColor: '#007AFF',
  },
  headerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    width: '48%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  scheduledContainer: {
    marginTop: 8,
  },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduledValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  callButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  callIcon: {
    fontSize: 16,
  },
  alertButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  alertIcon: {
    fontSize: 16,
  },
  addressItem: {
    marginBottom: 24,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupDot: {
    fontSize: 12,
    marginRight: 8,
  },
  deliveryDot: {
    fontSize: 12,
    marginRight: 8,
  },
  addressLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
  addressValue: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeProgressIcon: {
    backgroundColor: '#007AFF',
  },
  progressIconText: {
    fontSize: 16,
  },
  progressText: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1,
  },
  activeProgressText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
  },
  activeProgressDot: {
    backgroundColor: '#007AFF',
  },
  startTripButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  startTripButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  arrivedButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  arrivedButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  deliveredButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  deliveredButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default OrderDetailsScreen;