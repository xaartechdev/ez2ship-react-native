// Environment Configuration
export const ENV = {
  // API Configuration
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://api.ez2ship.com/api',
  
  API_TIMEOUT: 30000,
  
  // App Configuration
  APP_VERSION: '1.0.0',
  APP_NAME: 'EZ 2 SHIP Driver',
  
  // Environment
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  
  // Feature Flags
  FEATURES: {
    ENABLE_NOTIFICATIONS: true,
    ENABLE_LOCATION_TRACKING: true,
    ENABLE_OFFLINE_MODE: true,
    ENABLE_BIOMETRIC_AUTH: true,
    ENABLE_DARK_MODE: true,
    ENABLE_ANALYTICS: !__DEV__,
    ENABLE_CRASH_REPORTING: !__DEV__,
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: '@ez2ship:token',
    REFRESH_TOKEN: '@ez2ship:refresh_token',
    USER: '@ez2ship:user',
    SETTINGS: '@ez2ship:settings',
    PREFERENCES: '@ez2ship:preferences',
    BIOMETRIC_ENABLED: '@ez2ship:biometric_enabled',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_TOKEN: '/auth/verify',
    
    // Profile
    PROFILE: '/auth/profile',
    PROFILE_IMAGE: '/auth/profile/image',
    DELETE_ACCOUNT: '/auth/account',
    
    // Tasks
    TASKS: '/tasks',
    TASK_ACCEPT: (id: string) => `/tasks/${id}/accept`,
    TASK_START: (id: string) => `/tasks/${id}/start`,
    TASK_COMPLETE: (id: string) => `/tasks/${id}/complete`,
    TASK_CANCEL: (id: string) => `/tasks/${id}/cancel`,
    TASK_NOTES: (id: string) => `/tasks/${id}/notes`,
    
    // Orders
    ORDERS: '/orders',
    ORDER_DETAILS: (id: string) => `/orders/${id}`,
    ORDER_PICKUP: (id: string) => `/orders/${id}/pickup`,
    ORDER_DELIVER: (id: string) => `/orders/${id}/deliver`,
    ORDER_TRACKING: (id: string) => `/orders/${id}/tracking`,
    ORDER_LOCATION: (id: string) => `/orders/${id}/location`,
    ORDER_PROOF_PHOTOS: (id: string) => `/orders/${id}/proof-photos`,
    ORDER_ISSUES: (id: string) => `/orders/${id}/issues`,
    
    // Notifications
    NOTIFICATIONS: '/notifications',
    NOTIFICATIONS_UNREAD_COUNT: '/notifications/unread-count',
    NOTIFICATIONS_MARK_READ: (id: string) => `/notifications/${id}/read`,
    NOTIFICATIONS_MARK_ALL_READ: '/notifications/mark-all-read',
    NOTIFICATIONS_DELETE: (id: string) => `/notifications/${id}`,
    NOTIFICATIONS_DELETE_READ: '/notifications/read',
    NOTIFICATIONS_REGISTER_DEVICE: '/notifications/register-device',
    NOTIFICATIONS_UNREGISTER_DEVICE: '/notifications/unregister-device',
    NOTIFICATIONS_PREFERENCES: '/notifications/preferences',
    
    // Devices
    DEVICES_REGISTER: '/auth/devices',
    DEVICES_UNREGISTER: (token: string) => `/auth/devices/${token}`,
  },
  
  // Colors
  COLORS: {
    PRIMARY: '#007bff',
    SECONDARY: '#6c757d',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    DANGER: '#dc3545',
    INFO: '#17a2b8',
    LIGHT: '#f8f9fa',
    DARK: '#343a40',
    WHITE: '#ffffff',
    BLACK: '#000000',
    
    // Status Colors
    PENDING: '#ffc107',
    IN_PROGRESS: '#17a2b8',
    COMPLETED: '#28a745',
    CANCELLED: '#dc3545',
    
    // Background Colors
    BACKGROUND: '#f8f9fa',
    CARD_BACKGROUND: '#ffffff',
    INPUT_BACKGROUND: '#f8f9fa',
    
    // Text Colors
    TEXT_PRIMARY: '#212529',
    TEXT_SECONDARY: '#6c757d',
    TEXT_MUTED: '#868e96',
    TEXT_WHITE: '#ffffff',
  },
  
  // Dimensions
  DIMENSIONS: {
    PADDING: 16,
    MARGIN: 16,
    BORDER_RADIUS: 8,
    BUTTON_HEIGHT: 48,
    INPUT_HEIGHT: 48,
    HEADER_HEIGHT: 56,
    TAB_BAR_HEIGHT: 60,
    CARD_ELEVATION: 2,
  },
  
  // Font Sizes
  FONT_SIZES: {
    EXTRA_SMALL: 10,
    SMALL: 12,
    MEDIUM: 14,
    LARGE: 16,
    EXTRA_LARGE: 18,
    HEADING_SMALL: 20,
    HEADING_MEDIUM: 24,
    HEADING_LARGE: 28,
    TITLE: 32,
  },
  
  // Font Weights
  FONT_WEIGHTS: {
    LIGHT: '300' as const,
    NORMAL: '400' as const,
    MEDIUM: '500' as const,
    SEMI_BOLD: '600' as const,
    BOLD: '700' as const,
    EXTRA_BOLD: '800' as const,
  },
  
  // Animation Durations
  ANIMATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
  },
  
  // Map Configuration
  MAP: {
    DEFAULT_LATITUDE: 37.7749,
    DEFAULT_LONGITUDE: -122.4194,
    DEFAULT_ZOOM: 15,
    LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
    DISTANCE_THRESHOLD: 100, // meters
  },
  
  // Notification Types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    ORDER: 'order',
    TASK: 'task',
    SYSTEM: 'system',
  },
  
  // Task Status
  TASK_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PICKED_UP: 'picked-up',
    IN_TRANSIT: 'in-transit',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  
  // Vehicle Types
  VEHICLE_TYPES: {
    BIKE: 'bike',
    CAR: 'car',
    TRUCK: 'truck',
    VAN: 'van',
  },
  
  // Priority Levels
  PRIORITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
} as const;

export default ENV;