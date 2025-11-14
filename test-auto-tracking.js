// Test the auto tracking control
import { enableAutoTracking, disableAutoTracking, isAutoTrackingEnabled } from '../utils/trackingControl';

console.log('🧪 Testing auto tracking control...');

console.log('Initial state:', isAutoTrackingEnabled());

disableAutoTracking();
console.log('After disable:', isAutoTrackingEnabled());

enableAutoTracking();
console.log('After enable:', isAutoTrackingEnabled());

disableAutoTracking();
console.log('Final state (should be disabled):', isAutoTrackingEnabled());