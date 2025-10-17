// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Health
  health: '/health',
  healthDb: '/health/db',
  healthDbInfo: '/health/db/info',
  
  // Auth (будущие эндпоинты)
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  
  // Restaurants
  restaurants: '/restaurants',
  restaurantsActive: '/restaurants/active',
  
  // Menu
  menu: '/menu',
  menuCategories: '/menu/categories',
  menuItems: '/menu/items',
  
  // Tables
  tables: '/tables',
  tablesAvailable: '/tables/available',
  
  // Reservations
  reservations: '/reservations',
  reservationsUser: '/reservations/user',
  
  // Orders
  orders: '/orders',
  ordersUser: '/orders/user',
  
  // Audit
  audit: '/audit',
  auditRecent: '/audit/recent',
  auditStatistics: '/audit/statistics',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;