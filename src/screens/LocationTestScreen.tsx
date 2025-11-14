import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleLocationService from '../services/SimpleLocationService';

const LocationTestScreen: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const locationService = SimpleLocationService.getInstance();

  const clearLog = () => {
    setTestResult('');
  };

  const testGetLocation = async () => {
    setIsLoading(true);
    setTestResult('📍 Getting current location...\n');

    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setTestResult(prev => prev + `
✅ Location found!
📍 Latitude: ${location.latitude}
📍 Longitude: ${location.longitude}
`);
        Alert.alert('Success', `Location: ${location.latitude}, ${location.longitude}`);
      } else {
        setTestResult(prev => prev + '❌ Failed to get location\n');
        Alert.alert('Error', 'Failed to get location');
      }
    } catch (error) {
      setTestResult(prev => prev + `❌ Error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSendToAPI = async () => {
    setIsLoading(true);
    setTestResult(prev => prev + '🧪 Testing API sending...\n');

    try {
      await locationService.testService();
      setTestResult(prev => prev + '✅ API test completed (check logs)\n');
    } catch (error) {
      setTestResult(prev => prev + `❌ API test error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const startTracking = async () => {
    setIsLoading(true);
    setTestResult(prev => prev + '🚀 Starting location tracking...\n');

    try {
      await locationService.startTracking();
      setTestResult(prev => prev + '✅ Location tracking started\n');
      Alert.alert('Success', 'Location tracking started');
    } catch (error) {
      setTestResult(prev => prev + `❌ Tracking start error: ${error}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    setTestResult(prev => prev + '🛑 Location tracking stopped\n');
    Alert.alert('Info', 'Location tracking stopped');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Simple Location Test</Text>
        <Text style={styles.subtitle}>Clean & Simple Location Service</Text>
      </View>

      <ScrollView style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testGetLocation}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '📍 Getting Location...' : '📍 Get Current Location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testSendToAPI}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>
            🧪 Test API Sending
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={startTracking}
          disabled={isLoading}
        >
          <Text style={styles.successButtonText}>
            🚀 Start Tracking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={stopTracking}
        >
          <Text style={styles.warningButtonText}>
            🛑 Stop Tracking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearLog}
        >
          <Text style={styles.clearButtonText}>
            🗑️ Clear Log
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Test Log:</Text>
        <ScrollView style={styles.logScroll}>
          <Text style={styles.logText}>
            {testResult || 'Ready to test location service...\n\n• Get Current Location: Test getting GPS coordinates\n• Test API Sending: Get location and send to API\n• Start Tracking: Begin continuous location tracking\n• Stop Tracking: Stop location tracking'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    padding: 20,
    maxHeight: 300,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successButton: {
    backgroundColor: '#FF9500',
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningButton: {
    backgroundColor: '#FF3B30',
  },
  warningButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#8E8E93',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    padding: 15,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logScroll: {
    flex: 1,
  },
  logText: {
    fontSize: 14,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default LocationTestScreen;