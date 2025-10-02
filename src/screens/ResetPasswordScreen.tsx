import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo } from '../assets/images/Logo';
import { authService } from '../services/authService';

interface ResetPasswordScreenProps {
  navigation: any;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendReset = async () => {
    // Validation
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('📧 FORGOT PASSWORD - Sending reset email', {
        email,
        timestamp: new Date().toISOString(),
      });

      const response = await authService.forgotPassword(email);
      
      console.log('📧 FORGOT PASSWORD - API Response', {
        success: response.success,
        message: response.message,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        Alert.alert(
          'Reset Instructions Sent',
          response.message || 'Check your email for password reset instructions.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('📧 FORGOT PASSWORD - Error', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Logo width={120} height={100} />
      </View>

      {/* Title and Instructions */}
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>

      {/* Reset Form */}
      <View style={styles.formContainer}>
        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.emailInputContainer}>
            <Text style={styles.emailIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Send Reset Button */}
        <TouchableOpacity 
          style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
          onPress={handleSendReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
          )}
        </TouchableOpacity>

        {/* Remember Password */}
        <View style={styles.rememberContainer}>
          <Text style={styles.rememberText}>Remember your password?</Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    height: 56,
    paddingHorizontal: 16,
  },
  emailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  resetButton: {
    height: 56,
    backgroundColor: '#7dc8f7',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#7dc8f7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  resetButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  rememberContainer: {
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;