import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TripProgressScreenProps {
  route?: {
    params?: {
      orderId: string;
      status: string;
    };
  };
  navigation?: any;
}

const TripProgressScreen: React.FC<TripProgressScreenProps> = ({ route, navigation }) => {
  const { orderId = '', status = 'pending' } = route?.params || {};

  const orderData = {
    'ORD-2024-001': {
      customer: 'Sarah Johnson',
      distance: '12.5 miles',
      duration: '35 min',
      scheduled: 'Mon, Jan 15, 2:30 PM',
      pickupAddress: '123 Warehouse St, Industrial District, CA 90210',
      deliveryAddress: '456 Customer Ave, Downtown, CA 90211',
    },
    'ORD-2024-002': {
      customer: 'Mike Chen',
      distance: '8.2 miles',
      duration: '25 min',
      scheduled: 'Mon, Jan 15, 5:00 PM',
      pickupAddress: '789 Supply Center, West Side, CA 90212',
      deliveryAddress: '321 Office Plaza, Business District, CA 90213',
    },
    'ORD-2024-003': {
      customer: 'Emily Davis',
      distance: '15.7 miles',
      duration: '40 min',
      scheduled: 'Mon, Jan 15, 7:30 PM',
      pickupAddress: '555 Manufacturing Way, South End, CA 90214',
      deliveryAddress: '777 Retail Center, North Hills, CA 90215',
    },
  };

  const order = orderData[orderId as keyof typeof orderData];

  const getHeaderStatus = () => {
    switch (status) {
      case 'Start Trip':
        return 'Start Trip';
      case 'In Transit':
        return 'In Transit';
      case 'Arrived at Destination':
        return 'Arrived at Destination';
      case 'Unknown':
        return 'Unknown';
      default:
        return 'Start Trip';
    }
  };

  const getMainButton = () => {
    switch (status) {
      case 'Start Trip':
        return (
          <TouchableOpacity 
            style={styles.startTripButton} 
            onPress={() => navigation.navigate('TripProgress', { orderId, status: 'In Transit' })}
          >
            <Text style={styles.startTripButtonText}>✈️ Start Trip</Text>
          </TouchableOpacity>
        );
      case 'In Transit':
        return (
          <TouchableOpacity 
            style={styles.arrivedButton} 
            onPress={() => navigation.navigate('TripProgress', { orderId, status: 'Arrived at Destination' })}
          >
            <Text style={styles.arrivedButtonText}>Arrived at Destination</Text>
          </TouchableOpacity>
        );
      case 'Arrived at Destination':
        return (
          <TouchableOpacity 
            style={styles.deliveredButton} 
            onPress={() => navigation.navigate('ProofOfDelivery', { orderId })}
          >
            <Text style={styles.deliveredButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderProgressSteps = () => {
    const steps = [
      { id: 'start', label: 'Start Trip', icon: '✅', completed: true },
      { id: 'transit', label: 'In Transit', icon: '🚛', completed: status !== 'Start Trip' },
      { id: 'arrived', label: 'Arrived at Destination', icon: '📍', completed: status === 'Arrived at Destination' },
      { id: 'delivered', label: 'Delivered', icon: '✅', completed: false },
    ];

    return steps.map((step, index) => {
      const isActive = 
        (status === 'Start Trip' && step.id === 'start') ||
        (status === 'In Transit' && step.id === 'transit') ||
        (status === 'Arrived at Destination' && step.id === 'arrived');

      const isCompleted = step.completed && !isActive;

      return (
        <View key={step.id} style={styles.progressStep}>
          <View style={[
            styles.stepIcon,
            isActive && styles.activeStepIcon,
            isCompleted && styles.completedStepIcon
          ]}>
            <Text style={styles.stepIconText}>{step.icon}</Text>
          </View>
          <Text style={[
            styles.stepLabel,
            isActive && styles.activeStepLabel,
            isCompleted && styles.completedStepLabel
          ]}>
            {step.label}
          </Text>
          {isActive && <View style={styles.activeDot} />}
          {isCompleted && <View style={styles.completedCheckmark} />}
        </View>
      );
    });
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
        <TouchableOpacity style={[
          styles.statusBadge,
          status === 'Unknown' && styles.unknownBadge,
          status === 'Start Trip' && styles.startBadge,
          status === 'In Transit' && styles.transitBadge,
          status === 'Arrived at Destination' && styles.arrivedBadge
        ]}>
          <Text style={styles.statusBadgeText}>{getHeaderStatus()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Distance and Duration - Only for certain statuses */}
        {(status === 'In Transit' || status === 'Arrived at Destination') && (
          <View style={styles.statsContainer}>
            <Text style={styles.distanceText}>{order.distance}</Text>
            <Text style={styles.durationText}>{order.duration}</Text>
          </View>
        )}

        {/* Scheduled Time */}
        <View style={styles.scheduledContainer}>
          <Text style={styles.scheduledLabel}>Scheduled</Text>
          <View style={styles.scheduledRow}>
            <Text style={styles.scheduledValue}>{order.scheduled}</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconButtonText}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.iconButtonText}>⚠️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressesContainer}>
          <View style={styles.addressItem}>
            <View style={styles.addressHeader}>
              <Text style={styles.pickupDot}>🟢</Text>
              <Text style={styles.addressLabel}>Pickup Address</Text>
            </View>
            <Text style={styles.addressText}>{order.pickupAddress}</Text>
          </View>

          <View style={styles.addressItem}>
            <View style={styles.addressHeader}>
              <Text style={styles.deliveryDot}>🔴</Text>
              <Text style={styles.addressLabel}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Trip Progress */}
        <View style={styles.tripProgressContainer}>
          <Text style={styles.sectionTitle}>Trip Progress</Text>
          
          <View style={styles.progressSteps}>
            {renderProgressSteps()}
          </View>
        </View>

        {/* Notes & Updates - Only for certain statuses */}
        {status === 'Arrived at Destination' && (
          <View style={styles.notesContainer}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesIcon}>📝</Text>
              <Text style={styles.notesTitle}>Notes & Updates</Text>
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes about this delivery..."
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Report Issue - Only for Unknown status */}
        {status === 'Unknown' && (
          <View style={styles.reportContainer}>
            <TouchableOpacity style={styles.reportButton}>
              <Text style={styles.reportIcon}>⚠️</Text>
              <Text style={styles.reportText}>Report Issue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Action Button */}
        {getMainButton()}

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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unknownBadge: {
    backgroundColor: '#007AFF',
  },
  startBadge: {
    backgroundColor: '#007AFF',
  },
  transitBadge: {
    backgroundColor: '#007AFF',
  },
  arrivedBadge: {
    backgroundColor: '#007AFF',
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  distanceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  durationText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  scheduledContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  scheduledLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
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
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButtonText: {
    fontSize: 16,
  },
  addressesContainer: {
    paddingVertical: 20,
  },
  addressItem: {
    marginBottom: 20,
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
  addressText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
  },
  tripProgressContainer: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  progressSteps: {
    marginBottom: 20,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeStepIcon: {
    backgroundColor: '#007AFF',
  },
  completedStepIcon: {
    backgroundColor: '#34C759',
  },
  stepIconText: {
    fontSize: 16,
  },
  stepLabel: {
    fontSize: 16,
    color: '#6c757d',
    flex: 1,
  },
  activeStepLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  completedStepLabel: {
    color: '#34C759',
    fontWeight: '600',
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  completedCheckmark: {
    width: 8,
    height: 8,
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  notesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  notesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  reportContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  reportIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  reportText: {
    fontSize: 16,
    color: '#FF9500',
    fontWeight: '600',
  },
  startTripButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
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

export default TripProgressScreen;