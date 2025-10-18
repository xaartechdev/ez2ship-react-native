import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { profileService, DriverProfile, UpdateProfileRequest } from '../services/profileService';
import BackHeader from '../components/BackHeader';
import { authService } from '../services/authService';
import { logout } from '../store/slices/authSlice';
import { updateProfile, fetchProfile } from '../store/slices/profileSlice';
import { RootState, AppDispatch } from '../store';

interface NavigationProps {
  navigation: any;
}

const ProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationHook = useNavigation();
  const { profile: reduxProfile, loading } = useSelector((state: RootState) => state.profile);
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DriverProfile>>({});

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Update local state when Redux profile changes
  useEffect(() => {
    if (reduxProfile) {
      // Convert ProfileData to DriverProfile format
      const driverProfile: DriverProfile = {
        id: user?.id || 0,
        driver_id: reduxProfile.driver_id || '',
        first_name: reduxProfile.first_name || '',
        last_name: reduxProfile.last_name || '',
        email: reduxProfile.email || '',
        phone: reduxProfile.phone || '',
        profile_image: reduxProfile.profile_image || null,
        current_status: reduxProfile.status || 'active',
        status: reduxProfile.status || 'active',
        street_address: reduxProfile.street_address || '',
        city: reduxProfile.city || '',
        state: reduxProfile.state || '',
        zip_code: reduxProfile.zip_code || '',
        date_of_birth: reduxProfile.date_of_birth || '',
        license_number: reduxProfile.license_number || '',
        license_expiry: reduxProfile.license_expiry || '',
        license_class: reduxProfile.license_class || '',
        vehicle_number: reduxProfile.vehicle_number || '',
        emergency_contact_name: reduxProfile.emergency_contact_name || '',
        emergency_contact_phone: reduxProfile.emergency_contact_phone || '',
        emergency_contact_relationship: reduxProfile.emergency_contact_relationship || '',
        full_address: `${reduxProfile.street_address || ''}, ${reduxProfile.city || ''}, ${reduxProfile.state || ''} ${reduxProfile.zip_code || ''}`.trim(),
        location_string: `${reduxProfile.city || ''}, ${reduxProfile.state || ''}`.trim(),
        rating: (reduxProfile.rating || 0).toString(),
        total_trips: reduxProfile.total_trips || 0,
        on_time_rate: (reduxProfile.on_time_rate || 0).toString(),
        join_date: reduxProfile.join_date || '',
        onboarding_progress: reduxProfile.onboarding_progress || 0,
        onboarding_status: reduxProfile.onboarding_status || 'pending',
        last_active_at: reduxProfile.last_active_at || '',
        license_front: reduxProfile.license_front || null,
        license_back: reduxProfile.license_back || null,
        insurance_certificate: reduxProfile.insurance_certificate || null,
        background_check: reduxProfile.background_check || null,
        preferences: reduxProfile.preferences || []
      };
      
      setProfile(driverProfile);
      setFormData(driverProfile);
    }
  }, [reduxProfile, user]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      console.log('=== PROFILE SCREEN - SAVING PROFILE ===');
      console.log('📝 Current form data:', JSON.stringify(formData, null, 2));
      
      const updateData = {
        first_name: formData.first_name || profile.first_name,
        last_name: formData.last_name || profile.last_name,
        // Note: email updates are not supported by the API - will be filtered out
        email: formData.email || profile.email,
        phone: formData.phone || profile.phone,
        street_address: formData.street_address || profile.street_address,
        city: formData.city || profile.city,
        state: formData.state || profile.state,
        zip_code: formData.zip_code || profile.zip_code,
      };

      console.log('🚀 Dispatching updateProfile with data:', JSON.stringify(updateData, null, 2));
      
      // Use Redux action to update profile (this will also update auth state)
      const result = await dispatch(updateProfile(updateData)).unwrap();
      
      console.log('✅ Profile update successful:', JSON.stringify(result, null, 2));
      
      setIsEditing(false);
      Alert.alert(
        'Success', 
        'Profile updated successfully! Changes will be reflected throughout the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Optionally refresh the profile data
              dispatch(fetchProfile());
            }
          }
        ]
      );
    } catch (error: any) {
      console.log('❌ Profile update failed:', error?.message || error);
      Alert.alert('Error', error?.message || 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData(profile || {});
  };

  // Debug logging to check current state
  useEffect(() => {
    console.log('👤 ProfileScreen - Current user from auth:', JSON.stringify(user, null, 2));
    console.log('📋 ProfileScreen - Current profile from Redux:', JSON.stringify(reduxProfile, null, 2));
  }, [user, reduxProfile]);

  const getDisplayValue = (value: string | undefined | null): string => {
    return value && value.trim() !== '' ? value : 'N/A';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Use Redux logout action
              await dispatch(logout() as any);
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <BackHeader title="Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <BackHeader title="Profile" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <BackHeader title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {(profile.first_name?.charAt(0) || 'U')}{(profile.last_name?.charAt(0) || 'U')}
            </Text>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {getDisplayValue(`${profile.first_name || ''} ${profile.last_name || ''}`.trim())}
            </Text>
            <Text style={styles.profileEmail}>{getDisplayValue(profile.email)}</Text>
            <Text style={styles.driverIdText}>Driver ID: {getDisplayValue(profile.driver_id)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={formData.first_name && formData.last_name ? 
                  `${formData.first_name} ${formData.last_name}` :
                  formData.first_name || ''
                }
                onChangeText={(text: string) => {
                  // Handle name input more carefully to preserve spaces during typing
                  if (text === '') {
                    // If completely empty, clear both names
                    setFormData(prev => ({ 
                      ...prev, 
                      first_name: '', 
                      last_name: ''
                    }));
                  } else {
                    // Split by space but preserve trailing spaces for ongoing typing
                    const spaceIndex = text.indexOf(' ');
                    if (spaceIndex === -1) {
                      // No space found, it's just first name
                      setFormData(prev => ({ 
                        ...prev, 
                        first_name: text, 
                        last_name: ''
                      }));
                    } else {
                      // Space found, split into first and last name
                      const firstName = text.substring(0, spaceIndex);
                      const lastName = text.substring(spaceIndex + 1); // Don't trim to preserve spaces
                      setFormData(prev => ({ 
                        ...prev, 
                        first_name: firstName, 
                        last_name: lastName
                      }));
                    }
                  }
                }}
                placeholder="Enter full name"
                autoCapitalize="words"
                keyboardType="default"
                autoCorrect={false}
                multiline={false}
                textContentType="name"
              />
            ) : (
              <Text style={styles.fieldValue}>
                {getDisplayValue(`${profile.first_name || ''} ${profile.last_name || ''}`.trim())}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={formData.email || ''}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.fieldValue}>{getDisplayValue(profile.email)}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={formData.phone || ''}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{getDisplayValue(profile.phone)}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>License Number</Text>
            <Text style={styles.fieldValue}>{getDisplayValue(profile.license_number)}</Text>
          </View>
        </View>

         <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚚</Text>
            <Text style={styles.sectionTitle}>Company Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Company Name</Text>
            <Text style={styles.fieldValue}>Van</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>License Plate</Text>
            <Text style={styles.fieldValue}>ABC-1234</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Model</Text>
            <Text style={styles.fieldValue}>2022 Ford Transit</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚚</Text>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Type</Text>
            <Text style={styles.fieldValue}>Van</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>License Plate</Text>
            <Text style={styles.fieldValue}>ABC-1234</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Model</Text>
            <Text style={styles.fieldValue}>2022 Ford Transit</Text>
          </View>
        </View>

        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
              <Text style={styles.saveButtonText}>💾 Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* {!isEditing && (
          <View style={styles.logoutSection}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )} */}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginBottom: 12,
    marginTop: 0,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#007AFF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  driverIdText: {
    fontSize: 14,
    color: '#6c757d',
  },
  editButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editIcon: {
    fontSize: 16,
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '600',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  fieldInput: {
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  editActions: {
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;
