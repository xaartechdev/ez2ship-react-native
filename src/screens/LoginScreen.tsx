import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError } from '../store/slices/authSlice';
import { Button, Input, Loading } from '../components/common';
import { ENV } from '../config/environment';
import Logo from '../assets/images/ez2ship-logo.png';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, user } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    console.log('LoginScreen useEffect - isAuthenticated:', isAuthenticated, 'user:', user);
    if (isAuthenticated && user) {
      // Navigation will be handled automatically by RootNavigator based on is_first_login
      // No need to navigate manually here anymore
      console.log('User logged in successfully, RootNavigator will handle navigation');
    }
  }, [isAuthenticated, user, navigation]);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!ENV.VALIDATION.EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < ENV.VALIDATION.PASSWORD_MIN_LENGTH) {
      setPasswordError(`Password must be at least ${ENV.VALIDATION.PASSWORD_MIN_LENGTH} characters`);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    console.log('🚀 Login process started');
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      console.log('❌ Validation failed');
      return;
    }

    try {
      // Add timeout protection to prevent ANR
      const loginPromise = dispatch(login({
        email: email.trim().toLowerCase(),
        password,
        device_name: 'React Native App',
      })).unwrap();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏰ Login timeout triggered');
          reject(new Error('Login timeout - please try again'));
        }, 30000); // 30 second timeout
      });

      await Promise.race([loginPromise, timeoutPromise]);
      console.log('✅ Login completed successfully');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      if (error.message.includes('timeout')) {
        Alert.alert('Login Timeout', 'Login is taking too long. Please check your connection and try again.');
      }
      // Other errors are handled in useEffect
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading message="Signing you in..." overlay />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ENV.COLORS.BACKGROUND} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo */}
          <View style={styles.logoContainer}>
            <Image
            source={Logo}
            style={styles.logo}
            resizeMode="contain"
          />
          </View>

          {/* App Title */}
          <Text style={styles.title}>EZ2SHIP Driver</Text>
          <Text style={styles.subtitle}>
            Welcome back! Please sign in to continue.
          </Text>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onBlur={() => validateEmail(email)}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              secureTextEntry={!showPassword}
              onBlur={() => validatePassword(password)}
              rightIcon={
                <Text style={styles.passwordToggle}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              }
              onRightIconPress={togglePasswordVisibility}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="outline"
              fullWidth
              style={styles.forgotButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need help? Contact support
            </Text>
            <Text style={styles.versionText}>
              Version {ENV.APP_VERSION}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENV.COLORS.BACKGROUND,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: ENV.DIMENSIONS.PADDING * 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: ENV.DIMENSIONS.MARGIN * 2,
    marginTop: ENV.DIMENSIONS.MARGIN,
  },
  title: {
    fontSize: ENV.FONT_SIZES.TITLE,
    fontWeight: ENV.FONT_WEIGHTS.BOLD,
    color: ENV.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: ENV.DIMENSIONS.MARGIN,
  },
  subtitle: {
    fontSize: ENV.FONT_SIZES.LARGE,
    color: ENV.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: ENV.DIMENSIONS.MARGIN * 3,
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: ENV.DIMENSIONS.MARGIN * 2,
  },
  loginButton: {
    marginTop: ENV.DIMENSIONS.MARGIN,
  },
  forgotButton: {
    marginTop: ENV.DIMENSIONS.MARGIN,
  },
  passwordToggle: {
    fontSize: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: ENV.DIMENSIONS.PADDING,
  },
  footerText: {
    fontSize: ENV.FONT_SIZES.SMALL,
    color: ENV.COLORS.TEXT_MUTED,
    marginBottom: 8,
  },
  versionText: {
    fontSize: ENV.FONT_SIZES.EXTRA_SMALL,
    color: ENV.COLORS.TEXT_MUTED,
  },
  logo: {
  width: 140,
  height: 110,
},
});

export default LoginScreen;