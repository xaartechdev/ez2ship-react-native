/**
 * LocationTrackingDebug
 * Simple debug utility for monitoring location tracking status
 */

import SimpleLocationService from '../services/SimpleLocationService';

class LocationTrackingDebug {
  private static logInterval: any = null;

  /**
   * Start debug logging for location tracking
   */
  static startDebugLogging(): void {
    if (this.logInterval) {
      console.log('🐛 Debug logging already active');
      return;
    }

    console.log('🐛 Starting location tracking debug logging...');
    
    this.logInterval = setInterval(() => {
      const locationService = SimpleLocationService.getInstance();
      const status = locationService.getTrackingStatus();
      
      console.log('🐛 Location Tracking Debug:', {
        timestamp: new Date().toISOString(),
        isTracking: status.isTracking,
        activeOrderIds: status.activeOrderIds,
        orderCount: status.orderCount,
        activeOrdersDisplay: status.activeOrderIds.join(', ') || 'None',
      });
    }, 15000); // Log every 15 seconds
  }

  /**
   * Stop debug logging
   */
  static stopDebugLogging(): void {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
      console.log('🐛 Debug logging stopped');
    }
  }

  /**
   * Get current tracking summary
   */
  static getTrackingSummary(): object {
    const locationService = SimpleLocationService.getInstance();
    const status = locationService.getTrackingStatus();
    
    return {
      timestamp: new Date().toISOString(),
      isTracking: status.isTracking,
      activeOrderIds: status.activeOrderIds,
      orderCount: status.orderCount,
      activeOrdersDisplay: status.activeOrderIds.join(', ') || 'None',
    };
  }

  /**
   * Test location service manually
   */
  static async testLocationService(orderId: string = 'debug-test'): Promise<void> {
    console.log('🧪 Manual location service test...');
    const locationService = SimpleLocationService.getInstance();
    await locationService.testService(orderId);
  }
}

export default LocationTrackingDebug;