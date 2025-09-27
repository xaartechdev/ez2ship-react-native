import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchProfile } from '../store/slices/profileSlice';

interface VehicleInformationScreenProps {
  navigation: any;
}

const VehicleInformationScreen: React.FC<VehicleInformationScreenProps> = ({ navigation }) => {
  const navigationHook = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
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
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('Back button pressed - VehicleInformation');
            if (navigationHook.canGoBack()) {
              navigationHook.goBack();
            } else {
              navigationHook.navigate('Settings' as never);
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 80,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '900',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  vehicleIconSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
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
});

export default VehicleInformationScreen;