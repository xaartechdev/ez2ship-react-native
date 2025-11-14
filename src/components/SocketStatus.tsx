import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SimpleLocationService from '../services/SimpleLocationService';

interface TrackingStatusProps {
  style?: any;
}

const TrackingStatus: React.FC<TrackingStatusProps> = ({ style }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState<'inactive' | 'active'>('inactive');
  const locationService = SimpleLocationService.getInstance();

  useEffect(() => {
    // Set up a periodic check for tracking status
    const statusInterval = setInterval(() => {
      const isActive = locationService.isCurrentlyTracking();
      setIsTracking(isActive);
      
      if (isActive) {
        setTrackingStatus('active');
      } else {
        setTrackingStatus('inactive');
      }
    }, 1000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const getStatusColor = () => {
    switch (trackingStatus) {
      case 'active':
        return '#4CAF50'; // Green
      case 'inactive':
        return '#757575'; // Gray
      default:
        return '#757575'; // Gray
    }
  };

  const getStatusText = () => {
    switch (trackingStatus) {
      case 'active':
        return 'API Tracking Active';
      case 'inactive':
        return 'Tracking Inactive';
      default:
        return 'Unknown';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TrackingStatus;