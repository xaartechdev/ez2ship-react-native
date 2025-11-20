/**
 * EZ2Ship Driver App
 * React Native Application
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import 'react-native-gesture-handler';

import store from './src/store';
import { loadUserFromStorage } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common';
import AppLoadingScreen from './src/screens/AppLoadingScreen';
import GlobalLocationTracker from './src/components/GlobalLocationTracker';


function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing app...');

  useEffect(() => {
    // Delayed initialization to prevent ANR during app startup
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        setLoadingMessage('Loading user data...');
        
        // Add small delay to allow UI to render first
        await new Promise<void>(resolve => setTimeout(() => resolve(), 200));
        
        // Load user data with timeout protection
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('App initialization timeout'));
          }, 5000);
        });
        
        const loadPromise = store.dispatch(loadUserFromStorage());
        
        await Promise.race([loadPromise, timeoutPromise]);
        console.log('✅ App initialized successfully');
        
        setLoadingMessage('Almost ready...');
        await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
        
      } catch (error) {
        console.error('⚠️ App initialization error (continuing anyway):', error);
        setLoadingMessage('Starting app...');
        // Continue with app initialization even if storage loading fails
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <Provider store={store}>
        <ErrorBoundary>
          <SafeAreaProvider>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor="#ffffff"
            />
            <AppLoadingScreen message={loadingMessage} />
          </SafeAreaProvider>
        </ErrorBoundary>
      </Provider>
    );
  }

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="#ffffff"
          />
          <GlobalLocationTracker />
          <AppNavigator />
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
