import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'John Smith',
    email: 'john.smith@ez2ship.com',
    phone: '+1 (555) 123-4567',
    licenseNumber: 'DL12345678',
    vehicleType: 'Van',
    licensePlate: 'ABC-1234',
    vehicleModel: '2022 Ford Transit',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSaveChanges = () => {
    setEditMode(false);
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleUpdatePassword = () => {
    if (passwords.new !== passwords.confirm) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (passwords.new.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    setChangePasswordMode(false);
    setPasswords({ current: '', new: '', confirm: '' });
    Alert.alert('Success', 'Password updated successfully');
  };

  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => navigation.replace('Auth') },
      ]
    );
  };

  if (changePasswordMode) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Vehicle Info (collapsed) */}
          <View style={styles.section}>
            <Text style={styles.vehicleType}>{profile.vehicleType}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>License Plate</Text>
            <Text style={styles.fieldValue}>{profile.licensePlate}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Vehicle Model</Text>
            <Text style={styles.fieldValue}>{profile.vehicleModel}</Text>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔒</Text>
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwords.current}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, current: text }))}
                  secureTextEntry={!showPasswords.current}
                  placeholder="Enter current password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  <Text style={styles.eyeIcon}>{showPasswords.current ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwords.new}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, new: text }))}
                  secureTextEntry={!showPasswords.new}
                  placeholder="Enter new password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  <Text style={styles.eyeIcon}>{showPasswords.new ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordField}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <View style={[styles.passwordContainer, styles.focusedContainer]}>
                <TextInput
                  style={styles.passwordInput}
                  value={passwords.confirm}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, confirm: text }))}
                  secureTextEntry={!showPasswords.confirm}
                  placeholder="Confirm new password"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  <Text style={styles.eyeIcon}>{showPasswords.confirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordActions}>
              <TouchableOpacity style={styles.updatePasswordButton} onPress={handleUpdatePassword}>
                <Text style={styles.updatePasswordText}>Update Password</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setChangePasswordMode(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Log Out */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.driverIdText}>Driver ID: 1</Text>
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditMode(!editMode)}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👤</Text>
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.fullName}
                onChangeText={(text) => setProfile(prev => ({ ...prev, fullName: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.fullName}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.email}
                onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.email}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.phone}
                onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.phone}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>License Number</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.licenseNumber}
                onChangeText={(text) => setProfile(prev => ({ ...prev, licenseNumber: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.licenseNumber}</Text>
            )}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🚛</Text>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Type</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.vehicleType}
                onChangeText={(text) => setProfile(prev => ({ ...prev, vehicleType: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.vehicleType}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>License Plate</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.licensePlate}
                onChangeText={(text) => setProfile(prev => ({ ...prev, licensePlate: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.licensePlate}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Vehicle Model</Text>
            {editMode ? (
              <TextInput
                style={styles.fieldInput}
                value={profile.vehicleModel}
                onChangeText={(text) => setProfile(prev => ({ ...prev, vehicleModel: text }))}
              />
            ) : (
              <Text style={styles.fieldValue}>{profile.vehicleModel}</Text>
            )}
          </View>
        </View>

        {/* Save Changes Button */}
        {editMode && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
              <Text style={styles.saveButtonText}>💾 Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelEditButton} 
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.cancelEditText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Section */}
        {!editMode && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🔒</Text>
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <TouchableOpacity 
              style={styles.securityOption}
              onPress={() => setChangePasswordMode(true)}
            >
              <Text style={styles.securityIcon}>🔑</Text>
              <Text style={styles.securityText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Log Out */}
        {!editMode && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogOut}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}

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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editIcon: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 20,
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
  cancelEditButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelEditText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  vehicleType: {
    fontSize: 16,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  passwordField: {
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  focusedContainer: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    padding: 16,
  },
  eyeButton: {
    padding: 16,
  },
  eyeIcon: {
    fontSize: 16,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  updatePasswordButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  updatePasswordText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginTop: 20,
  },
  logoutIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

export default ProfileScreen;