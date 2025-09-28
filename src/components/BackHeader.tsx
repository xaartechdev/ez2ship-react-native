import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BackHeaderProps {
  title: string;
  right?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, right, onBackPress, backgroundColor = '#ffffff' }) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Settings' as never);
    }
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor }]} 
      edges={['top']}  // ensures safe area on top
    >
      <View style={[styles.container, { backgroundColor }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 5, bottom: 10, left: 10, right: 10 }}
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.title}>{title}</Text>

        <View style={styles.right}>{right}</View>
      </View>
    </SafeAreaView>
  );
};

export const HEADER_VERTICAL_PADDING = 12;
export const HEADER_MIN_HEIGHT = 68;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: HEADER_MIN_HEIGHT,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0, // fixes Android overlap
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '900',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 10,
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default BackHeader;
