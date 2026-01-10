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

  /**
   * Enhanced API logging for debugging location API calls
   */
  static logAPICall(type: 'REQUEST' | 'RESPONSE', data: any): void {
    const timestamp = new Date().toISOString();
    const emoji = type === 'REQUEST' ? '📤' : '📥';
    
    console.log(`\n🔍 LOCATION API DEBUG - ${type}`);
    console.log(`${emoji} Timestamp: ${timestamp}`);
    
    if (type === 'REQUEST') {
      console.log(`${emoji} URL: ${data.url}`);
      console.log(`${emoji} Method: ${data.method}`);
      console.log(`${emoji} Order IDs: ${data.orderIds}`);
      console.log(`${emoji} Coordinates: ${data.latitude}, ${data.longitude}`);
      console.log(`${emoji} Auth Token: ${data.hasToken ? 'Present' : 'Missing'}`);
      console.log(`${emoji} Payload:`, JSON.stringify(data.payload, null, 2));
    } else {
      console.log(`${emoji} Status: ${data.status} (${data.statusText})`);
      console.log(`${emoji} Success: ${data.success}`);
      console.log(`${emoji} Response:`, data.responseData);
      if (data.error) {
        console.log(`${emoji} Error Details:`, data.error);
      }
    }
    console.log(`🔍 END API DEBUG - ${type}\n`);
  }

  /**
   * Log current active orders and their tracking status
   */
  static logActiveOrdersStatus(): void {
    const locationService = SimpleLocationService.getInstance();
    const status = locationService.getTrackingStatus();
    
    console.log('\n📊 ACTIVE ORDERS TRACKING STATUS:');
    console.log('📊 Is Tracking Active:', status.isTracking);
    console.log('📊 Total Active Orders:', status.orderCount);
    console.log('📊 Active Order IDs:', status.activeOrderIds);
    console.log('📊 Timestamp:', new Date().toISOString());
    
    if (status.orderCount > 0) {
      console.log('📊 Orders Being Tracked:');
      status.activeOrderIds.forEach((orderId, index) => {
        console.log(`   ${index + 1}. Order ID: ${orderId}`);
      });
    } else {
      console.log('📊 No active orders being tracked');
    }
    console.log('📊 END ACTIVE ORDERS STATUS\n');
  }
}

export default LocationTrackingDebug;