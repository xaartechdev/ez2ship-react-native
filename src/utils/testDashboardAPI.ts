/**
 * Test utility for Dashboard API
 * This file helps test the dashboard API calls and see the logs in React Native DevTools
 */

import { dashboardService } from '../services/dashboardService';

export class DashboardAPITester {
  /**
   * Test getting profile statistics - focusing on default (no period) behavior
   */
  static async testGetProfileStatistics() {
    console.log('🧪 DASHBOARD API TEST - Starting Profile Statistics Tests');
    
    try {
      // Test default stats (no period) - This is our main focus now
      console.log('🧪 Testing Default Statistics (NO PERIOD PARAMETER)...');
      const defaultStats = await dashboardService.getProfileStatistics();
      console.log('✅ Default Stats Result (no period sent):', defaultStats);

      console.log('🧪 TESTING SUMMARY:');
      console.log('- API Endpoint Called: /driver/profile/statistics (no period parameter)');
      console.log('- Period Parameter Sent: NONE');
      console.log('- Backend will return default data for testing');

      return {
        default: defaultStats,
        note: 'Only default stats tested - no period filters used'
      };
    } catch (error) {
      console.error('❌ DASHBOARD API TEST - Error:', error);
      throw error;
    }
  }

  /**
   * Test getting complete dashboard data
   */
  static async testGetDashboardData() {
    console.log('🧪 DASHBOARD API TEST - Starting Dashboard Data Test');
    
    try {
      const dashboardData = await dashboardService.getDashboardData();
      console.log('✅ Dashboard Data Result:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('❌ DASHBOARD API TEST - Dashboard Data Error:', error);
      throw error;
    }
  }

  /**
   * Run all dashboard API tests
   */
  static async runAllTests() {
    console.log('🧪🚀 DASHBOARD API TEST - Running All Tests...');
    
    try {
      const results = {
        profileStats: await this.testGetProfileStatistics(),
        dashboardData: await this.testGetDashboardData()
      };

      console.log('🧪✅ DASHBOARD API TEST - All Tests Completed Successfully');
      console.log('📊 Final Results:', results);
      return results;
    } catch (error) {
      console.error('🧪❌ DASHBOARD API TEST - Tests Failed:', error);
      throw error;
    }
  }
}

// Auto-run tests when this module is imported (for debugging)
if (__DEV__) {
  // Uncomment the line below to run tests automatically during development
  // setTimeout(() => DashboardAPITester.runAllTests(), 2000);
}