import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  AppState
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { locationTrackingService } from '../services/locationTrackingService';

const LocationTestScreen: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [backgroundTestLog, setBackgroundTestLog] = useState<string>('');

  const runLocationTest = async () => {
    setIsLoading(true);
    setTestResult('🧪 Testing location access...\n');
    
    try {
      const result = await locationTrackingService.testLocationAccess();
      
      let resultText = `=== LOCATION TEST RESULTS ===\n`;
      resultText += `Platform: ${Platform.OS}\n`;
      resultText += `Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
      resultText += `Message: ${result.message}\n`;
      
      if (result.data) {
        if (result.success && result.data.latitude) {
          resultText += `\nLocation Data:\n`;
          resultText += `• Latitude: ${result.data.latitude}\n`;
          resultText += `• Longitude: ${result.data.longitude}\n`;
          resultText += `• Accuracy: ${result.data.accuracy}m\n`;
          resultText += `• Timestamp: ${result.data.timestamp}\n`;
        } else {
          resultText += `\nError Details:\n`;
          resultText += JSON.stringify(result.data, null, 2);
        }
      }
      
      setTestResult(resultText);
      
      if (result.success) {
        Alert.alert('Location Test Successful!', 'GPS is working correctly on this device.');
      } else {
        Alert.alert('Location Test Failed', result.message);
      }
      
    } catch (error) {
      const errorText = `❌ TEST EXCEPTION:\n${error instanceof Error ? error.message : String(error)}`;
      setTestResult(errorText);
      Alert.alert('Test Error', errorText);
    }
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResult('');
    setBackgroundTestLog('');
  };

  const startBackgroundTest = async () => {
    try {
      setBackgroundTestLog('🔄 Starting background location test...\n');
      
      const started = await locationTrackingService.startTracking('TEST-BG-001');
      
      if (started) {
        setIsTrackingActive(true);
        setBackgroundTestLog(prev => prev + '✅ Background tracking started\n');
        setBackgroundTestLog(prev => prev + '📱 Now minimize the app to test background location...\n');
        setBackgroundTestLog(prev => prev + '⏰ Test will run for 2 minutes\n\n');
        
        // Set up monitoring
        const startTime = Date.now();
        const monitorInterval = setInterval(() => {
          const status = locationTrackingService.getTrackingStatus();
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          
          setBackgroundTestLog(prev => {
            const lines = prev.split('\n');
            const fixedLines = lines.slice(0, 4); // Keep first 4 lines
            const newStatus = `📊 Status (${elapsed}s): ${status.isTracking ? '🟢 Active' : '🔴 Stopped'}`;
            const lastLocation = status.lastLocation ? 
              `📍 Last: ${status.lastLocation.latitude.toFixed(6)}, ${status.lastLocation.longitude.toFixed(6)}` : 
              '📍 No location yet';
            return [...fixedLines, newStatus, lastLocation, ''].join('\n');
          });
          
          // Stop after 2 minutes
          if (elapsed > 120) {
            clearInterval(monitorInterval);
            stopBackgroundTest();
          }
        }, 5000);
        
      } else {
        setBackgroundTestLog(prev => prev + '❌ Failed to start background tracking\n');
      }
    } catch (error) {
      setBackgroundTestLog(prev => prev + `❌ Error: ${error}\n`);
    }
  };

  const stopBackgroundTest = () => {
    locationTrackingService.stopTracking();
    setIsTrackingActive(false);
    setBackgroundTestLog(prev => prev + '\n🛑 Background test stopped\n');
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      
      if (isTrackingActive) {
        const timestamp = new Date().toLocaleTimeString();
        setBackgroundTestLog(prev => 
          prev + `📱 App state: ${nextAppState} (${timestamp})\n`
        );
      }
    });

    return () => subscription?.remove();
  }, [isTrackingActive]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Location Debug Tool</Text>
          <Text style={styles.subtitle}>Test GPS functionality on real device</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={runLocationTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '🧪 Testing...' : '🧪 Test Location Access'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, isTrackingActive ? styles.stopButton : styles.backgroundButton]} 
            onPress={isTrackingActive ? stopBackgroundTest : startBackgroundTest}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isTrackingActive ? '🛑 Stop Background Test' : '🌙 Test Background Tracking'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.clearButton]} 
            onPress={clearResults}
          >
            <Text style={styles.buttonText}>🗑️ Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* App State Indicator */}
        <View style={styles.appStateContainer}>
          <Text style={styles.appStateText}>
            📱 App State: <Text style={[styles.appStateValue, appState === 'background' ? styles.backgroundState : styles.foregroundState]}>
              {appState}
            </Text>
          </Text>
        </View>

        {testResult !== '' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Location Test Results:</Text>
            <Text style={styles.resultsText}>{testResult}</Text>
          </View>
        )}

        {backgroundTestLog !== '' && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Background Test Log:</Text>
            <Text style={styles.resultsText}>{backgroundTestLog}</Text>
          </View>
        )}

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Test Background Location:</Text>
          <Text style={styles.instructionText}>
            1. Tap "🌙 Test Background Tracking" to start
          </Text>
          <Text style={styles.instructionText}>
            2. Minimize the app (press home button)
          </Text>
          <Text style={styles.instructionText}>
            3. Wait 1-2 minutes, then return to app
          </Text>
          <Text style={styles.instructionText}>
            4. Check if locations were tracked in background
          </Text>
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Troubleshooting Tips:</Text>
          <Text style={styles.instructionText}>
            1. Enable Location Services in device settings
          </Text>
          <Text style={styles.instructionText}>
            2. Grant Location permission to Ez2ship app
          </Text>
          <Text style={styles.instructionText}>
            3. For background: Allow "All the time" location access
          </Text>
          <Text style={styles.instructionText}>
            4. Test outdoors or near a window for better GPS signal
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#007AFF',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  backgroundButton: {
    backgroundColor: '#5856D6',
  },
  stopButton: {
    backgroundColor: '#FF9500',
  },
  appStateContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  appStateText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  appStateValue: {
    fontWeight: 'bold',
  },
  backgroundState: {
    color: '#FF3B30',
  },
  foregroundState: {
    color: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultsText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  instructionsContainer: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    paddingLeft: 10,
  },
});

export default LocationTestScreen;