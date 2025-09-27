import { apiClient } from './apiClient';

export interface DashboardStatistics {
  period: 'week' | 'month' | 'year';
  total_orders: number;
  completed_orders: number;
  on_time_rate: number;
  total_earnings: number;
}

export interface DashboardData {
  today_orders?: number;
  weekly_stats?: DashboardStatistics;
  monthly_stats?: DashboardStatistics;
}

class DashboardService {
  /**
   * Get profile statistics for dashboard
   * @param period - The period for statistics (week, month, year) - optional
   * @returns Promise<DashboardStatistics>
   */
  async getProfileStatistics(period?: 'week' | 'month' | 'year'): Promise<DashboardStatistics> {
    try {
      // Log the API request
      const endpoint = period ? `/driver/profile/statistics?period=${period}` : '/driver/profile/statistics';
      console.log('📊 DASHBOARD API - GET STATISTICS REQUEST', {
        endpoint,
        method: 'GET',
        params: period ? { period } : {},
        timestamp: new Date().toISOString(),
      });

      const response = await apiClient.getStatistics(period);
      
      // Log the API response
      console.log('📊 DASHBOARD API - GET STATISTICS RESPONSE', {
        success: response.success,
        data: response.data,
        message: response.message,
        timestamp: new Date().toISOString(),
      });

      if (response.success && response.data) {
        const data = response.data as any; // Type assertion for API response
        const statistics = {
          period: data.period || period || 'month' as const, // Default to 'month' if no period in response
          total_orders: data.total_orders || 0,
          completed_orders: data.completed_orders || 0,
          on_time_rate: data.on_time_rate || 0,
          total_earnings: data.total_earnings || 0,
        };

        // Log processed statistics
        console.log('📊 DASHBOARD API - PROCESSED STATISTICS', {
          statistics,
          timestamp: new Date().toISOString(),
        });

        return statistics;
      } else {
        console.warn('📊 DASHBOARD API - STATISTICS REQUEST FAILED', {
          message: response.message,
          response,
          timestamp: new Date().toISOString(),
        });
        throw new Error(response.message || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      console.error('📊 DASHBOARD API - ERROR', {
        error: error.message,
        period,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      });
      
      // Return default values on error
      const defaultStats = {
        period: period || 'month' as const, // Default to 'month' if no period specified
        total_orders: 0,
        completed_orders: 0,
        on_time_rate: 0,
        total_earnings: 0,
      };

      console.log('📊 DASHBOARD API - RETURNING DEFAULT VALUES', {
        defaultStats,
        reason: 'API Error',
        timestamp: new Date().toISOString(),
      });

      return defaultStats;
    }
  }

  /**
   * Get comprehensive dashboard data without period filters
   * @returns Promise<DashboardData>
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('📊 DASHBOARD API - GET DASHBOARD DATA REQUEST', {
        endpoints: ['/driver/profile/statistics'],
        note: 'No period parameter sent - API will return default data',
        timestamp: new Date().toISOString(),
      });

      // Fetch default statistics without any period filter
      const defaultStats = await this.getProfileStatistics(); // No period parameter passed

      const dashboardData = {
        weekly_stats: undefined, // Not fetching weekly stats for now
        monthly_stats: defaultStats, // Use default stats as monthly
        // Today's orders derived from default stats or set to default
        today_orders: Math.floor(defaultStats.total_orders / 30), // Approximate today's orders from total
      };

      console.log('📊 DASHBOARD API - DASHBOARD DATA COMPILED', {
        dashboardData,
        summary: {
          default_stats_orders: defaultStats.total_orders,
          estimated_today: Math.floor(defaultStats.total_orders / 30),
          period_used: defaultStats.period,
        },
        timestamp: new Date().toISOString(),
      });

      return dashboardData;
    } catch (error: any) {
      console.error('📊 DASHBOARD API - GET DASHBOARD DATA ERROR', {
        error: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack,
      });
      // Return default values on error - no period parameters
      return {
        today_orders: 0,
        monthly_stats: {
          period: 'month',
          total_orders: 0,
          completed_orders: 0,
          on_time_rate: 0,
          total_earnings: 0,
        },
      };
    }
  }

  /**
   * Format earnings for display
   * @param earnings - Raw earnings number
   * @returns Formatted earnings string
   */
  formatEarnings(earnings: number): string {
    if (earnings >= 1000) {
      return `$${(earnings / 1000).toFixed(1)}k`;
    }
    return `$${earnings.toFixed(0)}`;
  }

  /**
   * Format percentage for display
   * @param rate - Rate as decimal (0.929 for 92.9%)
   * @returns Formatted percentage string
   */
  formatPercentage(rate: number): string {
    return `${Math.round(rate)}%`;
  }

  /**
   * Generate mock weekly performance data for chart
   * Based on weekly statistics
   */
  generateWeeklyChartData(weeklyStats: DashboardStatistics) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseRate = weeklyStats.on_time_rate || 85;
    
    // Generate realistic daily performance data around the weekly average
    return days.map((day, index) => ({
      day,
      value: Math.max(60, Math.min(100, baseRate + (Math.random() - 0.5) * 20))
    }));
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;