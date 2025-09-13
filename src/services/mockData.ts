import { Task, Order, Notification } from '../types';

// Mock Tasks Data
export const mockTasks: Task[] = [
  {
    id: '1',
    orderId: 'ORD-2024-001',
    type: 'pickup',
    status: 'pending',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 234-5678',
    address: {
      street: '123 Warehouse St',
      city: 'Industrial District',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    scheduledTime: '2:30 PM',
    estimatedDuration: 30,
    distance: 12.5,
    priority: 'high',
    notes: 'Fragile items - handle with care',
    createdAt: '2024-09-12T10:00:00Z',
    updatedAt: '2024-09-12T10:00:00Z'
  },
  {
    id: '2',
    orderId: 'ORD-2024-002',
    type: 'delivery',
    status: 'in-progress',
    customerName: 'Michael Chen',
    customerPhone: '+1 (555) 345-6789',
    address: {
      street: '456 Residential Ave',
      city: 'Downtown',
      state: 'CA',
      postalCode: '90211',
      country: 'USA',
      coordinates: { latitude: 37.7849, longitude: -122.4094 }
    },
    scheduledTime: '3:45 PM',
    estimatedDuration: 25,
    distance: 8.3,
    priority: 'medium',
    createdAt: '2024-09-12T11:00:00Z',
    updatedAt: '2024-09-12T11:30:00Z'
  },
  {
    id: '3',
    orderId: 'ORD-2024-003',
    type: 'pickup',
    status: 'completed',
    customerName: 'Emily Rodriguez',
    customerPhone: '+1 (555) 456-7890',
    address: {
      street: '789 Business Blvd',
      city: 'Commerce Center',
      state: 'CA',
      postalCode: '90212',
      country: 'USA',
      coordinates: { latitude: 37.7649, longitude: -122.4294 }
    },
    scheduledTime: '1:15 PM',
    estimatedDuration: 20,
    distance: 5.7,
    priority: 'low',
    notes: 'Customer prefers morning delivery',
    createdAt: '2024-09-12T09:00:00Z',
    updatedAt: '2024-09-12T13:15:00Z'
  },
  {
    id: '4',
    orderId: 'ORD-2024-004',
    type: 'delivery',
    status: 'pending',
    customerName: 'David Wilson',
    customerPhone: '+1 (555) 567-8901',
    address: {
      street: '321 Suburban Way',
      city: 'Residential Park',
      state: 'CA',
      postalCode: '90213',
      country: 'USA',
      coordinates: { latitude: 37.7549, longitude: -122.4394 }
    },
    scheduledTime: '4:30 PM',
    estimatedDuration: 35,
    distance: 15.2,
    priority: 'medium',
    createdAt: '2024-09-12T12:00:00Z',
    updatedAt: '2024-09-12T12:00:00Z'
  }
];

// Mock Orders Data
export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    customerId: 'CUST-001',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'sarah.johnson@email.com',
    pickupAddress: {
      street: '123 Warehouse St',
      city: 'Industrial District',
      state: 'CA',
      postalCode: '90210',
      country: 'USA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    deliveryAddress: {
      street: '456 Home Ave',
      city: 'Residential Area',
      state: 'CA',
      postalCode: '90220',
      country: 'USA',
      coordinates: { latitude: 37.7849, longitude: -122.4094 }
    },
    items: [
      {
        id: 'ITEM-001',
        name: 'Electronics Package',
        description: 'Laptop and accessories',
        quantity: 1,
        weight: 3.5,
        dimensions: { length: 40, width: 30, height: 10 },
        value: 1200,
        category: 'Electronics'
      }
    ],
    totalAmount: 25.99,
    currency: 'USD',
    status: 'confirmed',
    priority: 'high',
    deliveryInstructions: 'Ring doorbell twice, fragile items',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    estimatedDeliveryTime: '2024-09-12T15:30:00Z',
    driverId: '1',
    createdAt: '2024-09-12T10:00:00Z',
    updatedAt: '2024-09-12T10:00:00Z'
  },
  {
    id: 'ORD-2024-002',
    customerId: 'CUST-002',
    customerName: 'Michael Chen',
    customerPhone: '+1 (555) 345-6789',
    customerEmail: 'michael.chen@email.com',
    pickupAddress: {
      street: '789 Store St',
      city: 'Shopping District',
      state: 'CA',
      postalCode: '90215',
      country: 'USA',
      coordinates: { latitude: 37.7649, longitude: -122.4294 }
    },
    deliveryAddress: {
      street: '456 Residential Ave',
      city: 'Downtown',
      state: 'CA',
      postalCode: '90211',
      country: 'USA',
      coordinates: { latitude: 37.7849, longitude: -122.4094 }
    },
    items: [
      {
        id: 'ITEM-002',
        name: 'Grocery Package',
        description: 'Fresh groceries and household items',
        quantity: 3,
        weight: 8.2,
        value: 85.50,
        category: 'Groceries'
      }
    ],
    totalAmount: 15.99,
    currency: 'USD',
    status: 'in-transit',
    priority: 'medium',
    deliveryInstructions: 'Leave at door if no answer',
    paymentMethod: 'digital-wallet',
    paymentStatus: 'paid',
    estimatedDeliveryTime: '2024-09-12T16:45:00Z',
    driverId: '1',
    createdAt: '2024-09-12T11:00:00Z',
    updatedAt: '2024-09-12T14:30:00Z'
  }
];

// Mock Notifications Data
export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    title: 'New Order Assigned',
    message: 'You have been assigned order ORD-2024-005 for pickup at 5:00 PM',
    type: 'order',
    priority: 'high',
    isRead: false,
    actionRequired: true,
    actionUrl: '/orders/ORD-2024-005',
    data: { orderId: 'ORD-2024-005' },
    createdAt: '2024-09-12T14:30:00Z'
  },
  {
    id: 'NOTIF-002',
    title: 'Delivery Completed',
    message: 'Order ORD-2024-001 has been successfully delivered',
    type: 'success',
    priority: 'medium',
    isRead: true,
    actionRequired: false,
    data: { orderId: 'ORD-2024-001' },
    createdAt: '2024-09-12T13:45:00Z'
  },
  {
    id: 'NOTIF-003',
    title: 'Route Update',
    message: 'Traffic detected on your route. Consider alternative path.',
    type: 'warning',
    priority: 'medium',
    isRead: false,
    actionRequired: false,
    createdAt: '2024-09-12T14:15:00Z'
  },
  {
    id: 'NOTIF-004',
    title: 'System Maintenance',
    message: 'Scheduled maintenance tonight from 2:00 AM - 4:00 AM',
    type: 'system',
    priority: 'low',
    isRead: false,
    actionRequired: false,
    createdAt: '2024-09-12T12:00:00Z',
    expiresAt: '2024-09-13T04:00:00Z'
  },
  {
    id: 'NOTIF-005',
    title: 'Weekly Performance',
    message: 'Great job! You completed 25 deliveries this week.',
    type: 'info',
    priority: 'low',
    isRead: true,
    actionRequired: false,
    createdAt: '2024-09-11T18:00:00Z'
  }
];

// Mock API delay function
export const mockApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
};

// Generate random ID
export const generateMockId = (): string => {
  return 'MOCK-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};