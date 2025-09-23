// API Configuration for EZ2Ship Driver App
export const API_CONFIG = {
  BASE_URL: 'https://devez2ship.xaartech.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

// Auth Response Types
export interface LoginResponse {
  driver: {
    id: number;
    driver_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    current_status: string;
    rating: string;
    total_trips: number;
    status: string;
  };
  token: string;
  token_type: string;
}

export interface RegisterResponse {
  driver: {
    id: number;
    driver_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    onboarding_progress: number;
  };
  token: string;
  token_type: string;
}

// Tasks Response Types
export interface TasksResponse {
  summary: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  tasks: Task[];
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
    has_more: boolean;
  };
}

export interface Task {
  id: number;
  order_id: string;
  customer_name: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickup_address: string;
  delivery_address: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  customer_phone?: string;
  estimated_delivery_time?: string;
}

// Profile Response Types
export interface ProfileResponse {
  driver: {
    id: number;
    driver_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    current_status: string;
    rating: string;
    total_trips: number;
    street_address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    vehicle_number?: string;
  };
}

export interface StatisticsResponse {
  period: string;
  total_orders: number;
  completed_orders: number;
  on_time_rate: number;
  total_earnings: number;
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  device_name: string;
}

export interface UpdateTaskStatusRequest {
  status: Task['status'];
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  vehicle_number?: string;
}

// Error codes mapping
export const ERROR_CODES = {
  200: 'Success',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Validation Error',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
} as const;