import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import BackHeader from '../components/BackHeader';
import { authService } from '../services/authService';
import { updateUser } from '../store/slices/authSlice';

interface FirstTimePasswordScreenProps {
  navigation: any;
}

const FirstTimePasswordScreen: React.FC<FirstTimePasswordScreenProps> = ({ navigation }) => {
  const navigationHook = useNavigation();
  const dispatch = useDispatch();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const result = await authService.updatePassword(newPassword, confirmPassword);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          result.message || 'Password updated successfully. You can now access all features.',
          [
            { 
              text: 'Continue', 
              onPress: () => {
                // Update user in Redux to set is_first_login to 0
                dispatch(updateUser({ is_first_login: 0 }));
                // RootNavigator will automatically navigate to main app
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update password. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackHeader 
        title="Set New Password" 
        onBackPress={() => {
          Alert.alert(
            'Exit',
            'You must set a new password to continue using the app. Are you sure you want to exit?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Exit', 
                style: 'destructive',
                onPress: () => {
                  // Logout user if they try to exit without setting password
                  authService.logout().then(() => {
                    // RootNavigator will handle navigation to auth stack
                  });
                }
              }
            ]
          );
        }}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoSection}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>🔐</Text>
          </View>
          <Text style={styles.infoTitle}>Password Setup Required</Text>
          <Text style={styles.infoText}>
            Your password was set by an administrator. For security reasons, please create a new password to continue.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Enter new password (minimum 8 characters)"
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm new password"
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
            />
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>• Minimum 8 characters</Text>
            <Text style={styles.requirementItem}>• At least one letter recommended</Text>
            <Text style={styles.requirementItem}>• At least one number recommended</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
                <Text style={styles.buttonText}>Updating Password...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
  },
  infoSection: {
    backgroundColor: '#e3f2fd',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconText: {
    fontSize: 28,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
  },
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FirstTimePasswordScreen;