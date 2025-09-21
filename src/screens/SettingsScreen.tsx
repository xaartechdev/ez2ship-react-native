import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

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
              await dispatch(logout()).unwrap();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              // Still navigate even if API call fails
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

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }> = ({ title, subtitle, onPress, rightElement, showArrow = true }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingItemRight}>
        {rightElement}
        {showArrow && onPress && (
          <Text style={styles.arrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your app preferences
        </Text>
      </View>

      <View style={styles.content}>
        {/* Account Section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <SettingItem
            title="Profile Information"
            subtitle="Update your personal details"
            onPress={() => {
              // Navigate to profile edit
              Alert.alert('Info', 'Profile editing will be available soon');
            }}
          />
          <SettingItem
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => {
              Alert.alert('Info', 'Password change will be available soon');
            }}
          />
          <SettingItem
            title="Account Status"
            subtitle={user?.status === 'active' ? 'Active' : 'Inactive'}
            showArrow={false}
            rightElement={
              <View style={[
                styles.statusBadge, 
                { backgroundColor: user?.status === 'active' ? '#28a745' : '#dc3545' }
              ]}>
                <Text style={styles.statusText}>
                  {user?.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </View>
            }
          />
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View style={styles.section}>
          <SettingItem
            title="Push Notifications"
            subtitle="Receive push notifications"
            showArrow={false}
            rightElement={
              <Switch
                value={true}
                onValueChange={(value) => {
                  // Update notification setting
                  console.log('Push notifications:', value);
                }}
              />
            }
          />
          <SettingItem
            title="Email Notifications"
            subtitle="Receive email updates"
            showArrow={false}
            rightElement={
              <Switch
                value={true}
                onValueChange={(value) => {
                  console.log('Email notifications:', value);
                }}
              />
            }
          />
          <SettingItem
            title="Order Updates"
            subtitle="Get notified about order changes"
            showArrow={false}
            rightElement={
              <Switch
                value={true}
                onValueChange={(value) => {
                  console.log('Order updates:', value);
                }}
              />
            }
          />
        </View>

        {/* App Preferences */}
        <SectionHeader title="App Preferences" />
        <View style={styles.section}>
          <SettingItem
            title="Language"
            subtitle="English (US)"
            onPress={() => {
              Alert.alert('Info', 'Language selection will be available soon');
            }}
          />
          <SettingItem
            title="Theme"
            subtitle="Light Mode"
            onPress={() => {
              Alert.alert('Info', 'Theme selection will be available soon');
            }}
          />
          <SettingItem
            title="Map Preferences"
            subtitle="Configure map settings"
            onPress={() => {
              Alert.alert('Info', 'Map preferences will be available soon');
            }}
          />
        </View>

        {/* Support Section */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <SettingItem
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => {
              Alert.alert('Info', 'Help center will be available soon');
            }}
          />
          <SettingItem
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => {
              Alert.alert('Info', 'Contact support will be available soon');
            }}
          />
          <SettingItem
            title="Report a Bug"
            subtitle="Help us improve the app"
            onPress={() => {
              Alert.alert('Info', 'Bug reporting will be available soon');
            }}
          />
          <SettingItem
            title="Rate the App"
            subtitle="Share your feedback"
            onPress={() => {
              Alert.alert('Info', 'App rating will be available soon');
            }}
          />
        </View>

        {/* About Section */}
        <SectionHeader title="About" />
        <View style={styles.section}>
          <SettingItem
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            title="Terms of Service"
            onPress={() => {
              Alert.alert('Info', 'Terms of service will be available soon');
            }}
          />
          <SettingItem
            title="Privacy Policy"
            onPress={() => {
              Alert.alert('Info', 'Privacy policy will be available soon');
            }}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingItemLeft: {
    flex: 1,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  arrow: {
    fontSize: 20,
    color: '#adb5bd',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SettingsScreen;