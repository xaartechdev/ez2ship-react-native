import { apiClient } from './apiClient';

export interface OrderDetail {
  id: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  vehicle_type: string;
  distance: string;
  duration: string;
  scheduled_pickup: string;
  pickup_address: string;
  delivery_address: string;
  status: string;
  amount: number;
  notes?: string;
  trip_progress: {
    start_trip: boolean;
    in_transit: boolean;
    arrived_at_destination: boolean;
    delivered: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UpdateStatusRequest {
  status: 'pending' | 'accepted' | 'in_progress' | 'picked_up' | 'in_transit' | 'arrived_at_destination' | 'completed' | 'delivered' | 'cancelled';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  otp?: string;
}

export interface ProofOfDelivery {
  otp_code: string;
  delivery_notes?: string;
  documents?: File[];
  customer_signature?: string;
}

class OrderService {
  /**
   * Get detailed information about a specific order/task
   */
  async getOrderDetails(taskId: number): Promise<OrderDetail> {
    try {
      const response = await apiClient.getTaskDetails(taskId);
      
      if (response.success && response.data) {
        const task = response.data as any;
        
        // Transform API response to match our interface
        const orderDetail: OrderDetail = {
          id: task.id || 0,
          order_id: task.order_id || '',
          customer_name: task.customer_name || '',
          customer_phone: task.customer_phone || '',
          vehicle_type: task.vehicle_type || 'Van',
          distance: task.distance || '0',
          duration: task.duration || '0 min',
          scheduled_pickup: task.scheduled_pickup || '',
          pickup_address: task.pickup_address || '',
          delivery_address: task.delivery_address || '',
          status: task.status || 'pending',
          amount: task.amount || 0,
          notes: task.notes || '',
          trip_progress: {
            start_trip: task.status === 'in_progress' || task.status === 'picked_up' || task.status === 'in_transit' || task.status === 'delivered',
            in_transit: task.status === 'in_transit' || task.status === 'delivered',
            arrived_at_destination: task.status === 'delivered',
            delivered: task.status === 'delivered'
          },
          created_at: task.created_at || '',
          updated_at: task.updated_at || ''
        };
        
        return orderDetail;
      }
      
      throw new Error('Invalid response format');
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      throw new Error(error.message || 'Failed to fetch order details');
    }
  }

  /**
   * Update order/task status
   */
  async updateOrderStatus(taskId: number, updateData: UpdateStatusRequest): Promise<void> {
    try {
      console.log('updateData',updateData)
      console.log('taskId',taskId)
      const response = await apiClient.updateTaskStatus(taskId, updateData);
      console.log('response',response)
      if (!response.success) {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  /**
   * Update order status with delivery documents (multipart/form-data)
   */
  async updateOrderStatusWithDocuments(taskId: number, updateData: UpdateStatusRequest & { delivery_documents: any[] }): Promise<void> {
    try {
      console.log('🔧 ORDER SERVICE - updateOrderStatusWithDocuments called');
      console.log('📄 Task ID:', taskId);
      console.log('📄 Update Data:', JSON.stringify(updateData, null, 2));
      console.log('📄 Documents array length:', updateData.delivery_documents?.length || 0);
      
      if (updateData.delivery_documents?.length > 0) {
        console.log('📎 Individual Documents:');
        updateData.delivery_documents.forEach((doc, index) => {
          console.log(`  Document ${index}:`, {
            name: doc.name,
            type: doc.type,
            uri: doc.uri ? `${doc.uri.substring(0, 50)}...` : 'No URI',
            hasSize: !!doc.size
          });
        });
      } else {
        console.log('⚠️ WARNING: No documents in delivery_documents array!');
      }
      
      console.log('🚀 Calling apiClient.updateTaskStatusWithDocuments...');
      const response = await apiClient.updateTaskStatusWithDocuments(taskId, updateData);
      console.log('📨 API Response received:', response);
      
      if (!response.success) {
        console.error('❌ API Response indicates failure:', response.message);
        throw new Error(response.message || 'Failed to update order status with documents');
      }
      
      console.log('✅ ORDER SERVICE - Document upload completed successfully');
    } catch (error: any) {
      console.error('❌ ORDER SERVICE ERROR:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw new Error(error.message || 'Failed to update order status with documents');
    }
  }

  /**
   * Accept a pending task
   */
  async acceptTask(taskId: number): Promise<void> {
    try {
      const response = await apiClient.acceptTask(taskId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to accept task');
      }
    } catch (error: any) {
      console.error('Error accepting task:', error);
      throw new Error(error.message || 'Failed to accept task');
    }
  }

  /**
   * Reject a pending task
   */
  async rejectTask(taskId: number, reason: string): Promise<void> {
    try {
      const response = await apiClient.rejectTask(taskId, reason);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reject task');
      }
    } catch (error: any) {
      console.error('Error rejecting task:', error);
      throw new Error(error.message || 'Failed to reject task');
    }
  }

  /**
   * Start trip - update status to in_progress
   */
  async startTrip(taskId: number): Promise<void> {
    return this.updateOrderStatus(taskId, {
      status: 'in_progress',
      notes: 'Trip started'
    });
  }

  /**
   * Mark as in transit - update status to in_transit
   */
  async markInTransit(taskId: number): Promise<void> {
    return this.updateOrderStatus(taskId, {
      status: 'in_transit',
      notes: 'Package picked up and in transit'
    });
  }

  /**
   * Mark as arrived at destination
   */
  async markArrivedAtDestination(taskId: number): Promise<void> {
    return this.updateOrderStatus(taskId, {
      status: 'picked_up', // Using picked_up as intermediate status
      notes: 'Arrived at destination'
    });
  }

  /**
   * Complete delivery
   */
  async completeDelivery(taskId: number, proofData?: ProofOfDelivery): Promise<void> {
    const notes = proofData?.delivery_notes || 'Package delivered successfully';
    
    return this.updateOrderStatus(taskId, {
      status: 'delivered',
      notes: notes,
      otp: proofData?.otp_code
    });
  }

  /**
   * Verify OTP (mock implementation - would need actual API endpoint)
   */
  async verifyOTP(taskId: number, otpCode: string): Promise<boolean> {
    try {
      // This would typically be a separate API endpoint for OTP verification
      // For now, we'll simulate OTP verification
      
      // Mock OTP validation - in real app, this would hit an API
      if (otpCode.length === 6 && /^\d+$/.test(otpCode)) {
        return true;
      }
      
      throw new Error('Invalid OTP code');
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error('OTP verification failed');
    }
  }

  /**
   * Upload delivery documents (mock implementation)
   */
  async uploadDeliveryDocuments(taskId: number, documents: File[]): Promise<void> {
    try {
      // This would typically upload to a file storage service
      // For now, we'll just simulate the upload
      console.log(`Uploading ${documents.length} documents for task ${taskId}`);
      
      // Mock upload delay
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error('Error uploading documents:', error);
      throw new Error('Failed to upload documents');
    }
  }
}

export const orderService = new OrderService();