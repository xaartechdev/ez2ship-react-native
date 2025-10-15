import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchProfile } from '../store/slices/profileSlice';

interface ProfileViewScreenProps {
  navigation: any;
}

const ProfileViewScreen: React.FC<ProfileViewScreenProps> = ({ navigation }) => {
  const navigationHook = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    console.log('📱 PROFILE SCREEN - Component mounted, dispatching fetchProfile');
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    console.log('📱 PROFILE SCREEN - Profile data updated:', {
      hasProfile: !!profile,
      profileKeys: profile ? Object.keys(profile) : [],
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      email: profile?.email,
      profileImage: profile?.profile_image,
      loading: loading,
      fullProfile: profile
    });
    
    if (profile?.profile_image) {
      setProfileImage(profile.profile_image);
    }
  }, [profile, loading]);

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen when implemented
    console.log('Edit profile pressed');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'U';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = () => {
    if (!profile) return 'Not provided';
    const parts = [
      profile.street_address,
      profile.city,
      profile.state,
      profile.zip_code
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
            console.log('Back button pressed - ProfileView');
            if (navigationHook.canGoBack()) {
              navigationHook.goBack();
            } else {
              navigationHook.navigate('Settings' as never);
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.profileImageSection}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>
                {getInitials(profile?.first_name, profile?.last_name)}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>
            {`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User'}
          </Text>
          <Text style={styles.profileStatus}>
            Driver ID: {profile?.driver_id || 'N/A'}
          </Text>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{formatDate(profile?.date_of_birth || undefined)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{formatAddress()}</Text>
          </View>
        </View>

        {/* Driver Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>License Number</Text>
            <Text style={styles.infoValue}>{profile?.license_number || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>License Expiry</Text>
            <Text style={styles.infoValue}>{formatDate(profile?.license_expiry || undefined)}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>License Class</Text>
            <Text style={styles.infoValue}>{profile?.license_class || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Number</Text>
            <Text style={styles.infoValue}>{profile?.vehicle_number || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: profile?.status === 'active' ? '#28a745' : '#dc3545' }
              ]}>
                <Text style={styles.statusText}>
                  {profile?.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{profile?.emergency_contact_name || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile?.emergency_contact_phone || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Relationship</Text>
            <Text style={styles.infoValue}>{profile?.emergency_contact_relationship || 'Not provided'}</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>{profile?.rating || 'N/A'}/5.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Trips</Text>
            <Text style={styles.infoValue}>{profile?.total_trips || 0}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>On-Time Rate</Text>
            <Text style={styles.infoValue}>{profile?.on_time_rate || '0'}%</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Join Date</Text>
            <Text style={styles.infoValue}>{formatDate(profile?.join_date || undefined)}</Text>
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
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4caf50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 20,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  profileImageSection: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageText: {
    fontSize: 36,
    fontWeight: '600',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 16,
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
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileViewScreen;