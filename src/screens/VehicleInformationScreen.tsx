import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import BackHeader from '../components/BackHeader';
import { RootState, AppDispatch } from '../store';
import { fetchProfile } from '../store/slices/profileSlice';

const VehicleInformationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <BackHeader title="Vehicle Information" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading vehicle information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <BackHeader title="Vehicle Information" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Vehicle Icon */}
        <View style={styles.vehicleIconSection}>
          <View style={styles.vehicleIconContainer}>
            <Text style={styles.vehicleIcon}>🚚</Text>
          </View>
          <Text style={styles.vehicleTitle}>Your Vehicle</Text>
          <Text style={styles.vehicleSubtitle}>View your assigned vehicle details</Text>
        </View>

        {/* Basic Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Number</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_number || 'Not assigned'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Type</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_type || 'Delivery Truck'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vehicle Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Make & Model</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_make_model || 'Ford Transit'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_year || '2023'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Color</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_color || 'White'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fuel Type</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_fuel_type || 'Diesel'}</Text>
          </View>
        </View>

        {/* Capacity Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capacity</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Max Weight</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_max_weight || '3,500 kg'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cargo Volume</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_cargo_volume || '15.1 m³'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Max Packages</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_max_packages || '150 packages'}</Text>
          </View>
        </View>

        {/* Maintenance Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maintenance</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Service</Text>
            <Text style={styles.infoValue}>September 15, 2025</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Next Service Due</Text>
            <Text style={styles.infoValue}>December 15, 2025</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Insurance Expiry</Text>
            <Text style={styles.infoValue}>March 20, 2026</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Registration Expiry</Text>
            <Text style={styles.infoValue}>June 30, 2026</Text>
          </View>
        </View>

        {/* GPS & Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS & Tracking</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>GPS Unit</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: '#28a745' }]}>
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Last Location Update</Text>
            <Text style={styles.infoValue}>2 minutes ago</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Distance (Today)</Text>
            <Text style={styles.infoValue}>125.8 km</Text>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteSection}>
          <View style={styles.noteIcon}>
            <Text style={styles.noteIconText}>ℹ️</Text>
          </View>
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Information</Text>
            <Text style={styles.noteText}>
              Vehicle information is managed by your fleet administrator. 
              Contact support if you notice any discrepancies.
            </Text>
          </View>
        </View>

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
  scrollContent: {
    paddingTop: 16,
  },
  vehicleIconSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  vehicleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIcon: {
    fontSize: 36,
  },
  vehicleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#007AFF',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteSection: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteIconText: {
    fontSize: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
});

export default VehicleInformationScreen;