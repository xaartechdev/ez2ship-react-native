// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  profileImage?: string;
  driverLicense: string;
  vehicleInfo: VehicleInfo;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface VehicleInfo {
  type: 'bike' | 'car' | 'truck' | 'van';
  model: string;
  year: number;
  plateNumber: string;
  color: string;
  capacity?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Task Types
export interface Task {
  id: string;
  orderId: string;
  type: 'pickup' | 'delivery';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  customerName: string;
  customerPhone: string;
  address: Address;
  scheduledTime: string;
  estimatedDuration: number;
  distance: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface TasksState {
  tasks: Task[];
  activeTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status: 'all' | 'pending' | 'in-progress' | 'completed';
    dateRange: {
      start: string;
      end: string;
    };
  };
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryInstructions?: string;
  paymentMethod: 'cash' | 'card' | 'digital-wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  category: string;
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;
}

// Trip Progress Types
export interface TripProgress {
  orderId: string;
  currentStep: number;
  totalSteps: number;
  steps: TripStep[];
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime?: string;
  notes: string[];
}

export interface TripStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'task' | 'system';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  data?: any;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  filters: {
    type: 'all' | 'unread' | 'read';
    priority: 'all' | 'high' | 'medium' | 'low';
  };
}

// Profile Types
export interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isEditMode: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

// Authentication API Types
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Task API Types
export interface TaskListRequest {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateTaskStatusRequest {
  taskId: string;
  status: 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Order API Types
export interface OrderDetailsRequest {
  orderId: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'picked-up' | 'in-transit' | 'delivered';
  notes?: string;
  proofOfDelivery?: {
    otp?: string;
    signature?: string;
    photos?: string[];
    recipientName?: string;
  };
}

// Notification API Types
export interface NotificationListRequest {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
  isRead: boolean;
}

// App Configuration Types
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    enableNotifications: boolean;
    enableLocationTracking: boolean;
    enableOfflineMode: boolean;
  };
}