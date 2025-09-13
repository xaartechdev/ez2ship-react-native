import { apiService } from './apiService';
import {
  Order,
  OrderDetailsRequest,
  UpdateOrderStatusRequest,
  ApiResponse,
} from '../types';

class OrdersService {
  // Get order details by ID
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiService.get<Order>(`/orders/${orderId}`);
    return response.data;
  }

  // Get orders list
  async getOrders(page: number = 1, limit: number = 20, status?: string): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (status) queryParams.append('status', status);

    const response = await apiService.get<Order[]>(`/orders?${queryParams.toString()}`);
    return response.data;
  }

  // Update order status
  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<Order> {
    const response = await apiService.patch<Order>(`/orders/${request.orderId}/status`, {
      status: request.status,
      notes: request.notes,
      proofOfDelivery: request.proofOfDelivery,
    });
    return response.data;
  }

  // Get active orders (in-progress)
  async getActiveOrders(): Promise<Order[]> {
    return this.getOrders(1, 50, 'in-transit');
  }

  // Get order history
  async getOrderHistory(page: number = 1, limit: number = 20): Promise<Order[]> {
    return this.getOrders(page, limit, 'delivered');
  }

  // Pickup order
  async pickupOrder(orderId: string, notes?: string): Promise<Order> {
    const response = await apiService.post<Order>(`/orders/${orderId}/pickup`, { notes });
    return response.data;
  }

  // Deliver order
  async deliverOrder(
    orderId: string,
    proofOfDelivery: {
      otp?: string;
      signature?: string;
      photos?: string[];
      recipientName?: string;
    },
    notes?: string
  ): Promise<Order> {
    const response = await apiService.post<Order>(`/orders/${orderId}/deliver`, {
      proofOfDelivery,
      notes,
    });
    return response.data;
  }

  // Upload proof of delivery photos
  async uploadProofPhotos(orderId: string, photos: string[]): Promise<{ photoUrls: string[] }> {
    const formData = new FormData();
    
    photos.forEach((photoUri, index) => {
      formData.append('photos', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `proof_${index}.jpg`,
      } as any);
    });

    const response = await apiService.upload<{ photoUrls: string[] }>(
      `/orders/${orderId}/proof-photos`,
      formData
    );
    return response.data;
  }

  // Report issue with order
  async reportOrderIssue(orderId: string, issue: string, description: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/orders/${orderId}/issues`, {
      issue,
      description,
    });
    return response.data;
  }

  // Get order tracking info
  async getOrderTracking(orderId: string): Promise<{
    currentLocation: { latitude: number; longitude: number; address: string };
    estimatedArrival: string;
    route: { latitude: number; longitude: number }[];
  }> {
    const response = await apiService.get<{
      currentLocation: { latitude: number; longitude: number; address: string };
      estimatedArrival: string;
      route: { latitude: number; longitude: number }[];
    }>(`/orders/${orderId}/tracking`);
    return response.data;
  }

  // Update location for order tracking
  async updateOrderLocation(
    orderId: string,
    location: { latitude: number; longitude: number }
  ): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`/orders/${orderId}/location`, {
      location,
    });
    return response.data;
  }
}

export const ordersService = new OrdersService();
export default ordersService;