/**
 * EZ2Ship Driver App
 * React Native Application
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import 'react-native-gesture-handler';

import { store } from './src/store';
import { loadUserFromStorage } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Load user data from storage on app start
    store.dispatch(loadUserFromStorage());
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="#ffffff"
          />
          <AppNavigator />
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
