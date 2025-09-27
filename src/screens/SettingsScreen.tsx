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
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { fetchProfile } from '../store/slices/profileSlice';
import { authService } from '../services/authService';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile data when component mounts
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    // Load profile image if available
    if (profile?.profile_image) {
      setProfileImage(profile.profile_image);
    }
  }, [profile]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              dispatch(logout());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              dispatch(logout()); // Force logout even if API fails
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          }
        },
      ]
    );
  };

  const navigateToProfile = () => {
    console.log('Navigating to ProfileView...');
    navigation.navigate('ProfileView');
  };

  const navigateToChangePassword = () => {
    console.log('Navigating to ChangePassword...');
    navigation.navigate('ChangePassword');
  };

  const navigateToVehicleInfo = () => {
    console.log('Navigating to VehicleInformation...');
    navigation.navigate('VehicleInformation');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || 'U';
  };

  const getFullName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return 'User';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Profile Info */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {getInitials(profile?.first_name, profile?.last_name)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{getFullName()}</Text>
              <Text style={styles.profileSubtitle}>Driver Account</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {/* Profile Option */}
          <TouchableOpacity style={styles.settingItem} onPress={navigateToProfile}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>👤</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Profile</Text>
              <Text style={styles.settingSubtitle}>View and edit your profile</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Change Password Option */}
          <TouchableOpacity style={styles.settingItem} onPress={navigateToChangePassword}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>🔒</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingSubtitle}>Update your account password</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Vehicle Information Option */}
          <TouchableOpacity style={styles.settingItem} onPress={navigateToVehicleInfo}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>🚚</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Vehicle Information</Text>
              <Text style={styles.settingSubtitle}>View your vehicle details</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutIcon}>
              <Text style={styles.logoutIconText}>🚪</Text>
            </View>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
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
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 24,
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
  profileSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 0,
    borderRadius: 0,
    paddingVertical: 0,
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  settingArrow: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: '300',
  },
  logoutSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIconText: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;