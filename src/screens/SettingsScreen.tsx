import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const { profile } = useSelector((state: RootState) => state.profile);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
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
              dispatch(logout());
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            }
          },
        },
      ]
    );
  };

  const navigateToProfile = () => {
    navigation.navigate('ProfileView');
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const navigateToVehicleInfo = () => {
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Profile Section */}
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

      {/* Settings Options */}
      <View style={styles.settingsLabelContainer}>
        <Text style={styles.settingsLabel}>Settings</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
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

          {/* Logout Option */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <View style={[styles.settingIcon, styles.logoutIconBg]}>
              <Text style={styles.settingIconText}>🚪</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.logoutText]}>Logout</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    marginBottom: 12,
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
  settingsLabelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  settingsContainer: {
    backgroundColor: '#FFF',
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
  logoutIconBg: {
    backgroundColor: '#FFE5E5',
  },
  logoutText: {
    color: '#FF3B30',
  },
});

export default SettingsScreen;
