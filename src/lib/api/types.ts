// Базовые типы данных, соответствующие нашим Entity в API

export interface UserRole {
  role_id: number;
  role_name: 'admin' | 'manager' | 'user' | 'guest';
  role_description?: string;
  created_at: string;
}

export interface User {
  user_id: string; // UUID PRIMARY KEY
  username: string; // VARCHAR(50) NOT NULL UNIQUE
  email: string; // VARCHAR(100) NOT NULL UNIQUE (with email format validation)
  // password_hash не включен в интерфейс для безопасности
  first_name: string; // VARCHAR(50) NOT NULL
  last_name: string; // VARCHAR(50) NOT NULL  
  phone?: string; // VARCHAR(20) (nullable, with phone format validation)
  role_id: number; // INTEGER NOT NULL DEFAULT 3 (user role)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
  last_login?: string; // TIMESTAMP (nullable)
  
  // Relations - только те FK которые есть в БД
  role?: UserRole; // может быть загружена через JOIN, но FK есть в users.role_id
}

export interface UserAddress {
  address_id: number; // SERIAL PRIMARY KEY
  user_id: string; // UUID NOT NULL
  country: string; // VARCHAR(50) DEFAULT 'Грузия'
  city: string; // VARCHAR(100) NOT NULL DEFAULT 'Тбилиси'  
  street_address: string; // TEXT NOT NULL
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Relations - FK на users
  user?: User; // может быть загружена через JOIN
}

export interface Restaurant {
  restaurant_id: number; // SERIAL PRIMARY KEY
  restaurant_name: string; // VARCHAR(100) NOT NULL
  restaurant_description?: string; // TEXT (nullable)
  country: string; // VARCHAR(50) DEFAULT 'Грузия'
  city: string; // VARCHAR(100) NOT NULL DEFAULT 'Тбилиси'
  street_address: string; // TEXT NOT NULL
  working_hours?: Record<string, string>; // JSONB (nullable): {"monday": "10:00-22:00", ...}
  is_active: boolean; // BOOLEAN DEFAULT TRUE
  rating: number; // DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0.00 AND rating <= 5.00)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // No FK relations in this table, only reverse relations could be loaded via JOINs
}

export interface MenuCategory {
  category_id: number; // SERIAL PRIMARY KEY
  category_name: string; // VARCHAR(100) NOT NULL UNIQUE
  category_description?: string; // TEXT (nullable)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // No FK relations in this table
}

export interface MenuItem {
  item_id: number; // SERIAL PRIMARY KEY
  item_name: string; // VARCHAR(150) NOT NULL
  item_description?: string; // TEXT (nullable)
  category_id: number; // INTEGER NOT NULL
  price: number; // DECIMAL(10,2) NOT NULL CHECK (price > 0)
  cooking_time_minutes: number; // INTEGER DEFAULT 0 CHECK (cooking_time_minutes >= 0)
  calories?: number; // INTEGER (nullable) CHECK (calories >= 0)
  is_vegetarian: boolean; // BOOLEAN DEFAULT FALSE
  is_spicy: boolean; // BOOLEAN DEFAULT FALSE
  is_deleted: boolean; // BOOLEAN DEFAULT FALSE (Мягкое удаление)
  image_url?: string; // TEXT (nullable)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Relations - FK на menu_categories
  category?: MenuCategory; // может быть загружена через JOIN
}

export interface Table {
  table_id: number; // SERIAL PRIMARY KEY
  restaurant_id: number; // INTEGER NOT NULL
  table_number: number; // INTEGER NOT NULL (unique per restaurant)
  seats_count: number; // INTEGER NOT NULL CHECK (seats_count BETWEEN 1 AND 20)
  is_available: boolean; // BOOLEAN DEFAULT TRUE
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Relations - FK на restaurants
  restaurant?: Restaurant; // может быть загружена через JOIN
}

export type ReservationStatus = 'unconfirmed' | 'confirmed' | 'started' | 'completed' | 'cancelled';

export interface TableReservation {
  reservation_id: string; // UUID PRIMARY KEY
  user_id: string; // UUID NOT NULL
  restaurant_id: number; // INTEGER NOT NULL  
  table_id: number; // INTEGER NOT NULL
  reservation_date: string; // DATE NOT NULL
  reservation_time: string; // TIME NOT NULL  
  duration_hours: number; // INTEGER DEFAULT 2 CHECK (duration_hours BETWEEN 1 AND 8)
  guests_count: number; // INTEGER NOT NULL CHECK (guests_count > 0)
  reservation_status: ReservationStatus; // VARCHAR(20) DEFAULT 'unconfirmed'
  contact_phone: string; // VARCHAR(20) NOT NULL (with phone format validation)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  confirmed_at?: string; // TIMESTAMP (nullable, set when status becomes 'confirmed')
  
  // Relations - FK на users, restaurants, tables
  user?: User; // может быть загружена через JOIN
  restaurant?: Restaurant; // может быть загружена через JOIN
  table?: Table; // может быть загружена через JOIN
}

export type OrderType = 'delivery' | 'dine_in';

export interface Order {
  order_id: string; // UUID PRIMARY KEY
  user_id: string; // UUID NOT NULL
  order_type: OrderType; // VARCHAR(20) NOT NULL CHECK (order_type IN ('delivery', 'dine_in'))
  
  // Для доставки (required when order_type = 'delivery')
  delivery_address?: string; // TEXT (nullable, required for delivery)
  delivery_phone?: string; // VARCHAR(20) (nullable, required for delivery)
  
  // Для ресторана (required when order_type = 'dine_in')  
  reservation_id?: string; // UUID (nullable, FK to table_reservations, required for dine_in)
  
  // Финансовые данные
  subtotal: number; // DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0)
  delivery_fee: number; // DECIMAL(10,2) DEFAULT 0 CHECK (delivery_fee >= 0)
  total_amount: number; // DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0)
  
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Relations - FK на users и table_reservations (nullable)
  user?: User; // может быть загружена через JOIN
  reservation?: TableReservation; // может быть загружена через JOIN (nullable FK)
}

export interface OrderItem {
  order_item_id: number; // SERIAL PRIMARY KEY
  order_id: string; // UUID NOT NULL
  item_id: number; // INTEGER NOT NULL
  quantity: number; // INTEGER NOT NULL CHECK (quantity > 0)
  unit_price: number; // DECIMAL(10,2) NOT NULL CHECK (unit_price > 0) - цена на момент заказа
  total_price: number; // DECIMAL(10,2) NOT NULL CHECK (total_price > 0) - calculated as unit_price * quantity
  
  // Relations - FK на orders и menu_items
  order?: Order; // может быть загружена через JOIN
  menu_item?: MenuItem; // может быть загружена через JOIN
}

export interface RestaurantReview {
  review_id: string; // UUID PRIMARY KEY
  user_id: string; // UUID NOT NULL
  restaurant_id: number; // INTEGER NOT NULL
  rating: number; // INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
  review_text?: string; // TEXT (nullable, min 10 chars if provided)
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  
  // Relations - FK на users и restaurants
  user?: User; // может быть загружена через JOIN
  restaurant?: Restaurant; // может быть загружена через JOIN
}

export type AuditOperation = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  audit_id: number;
  table_name: string;
  operation: AuditOperation;
  old_values?: any;
  new_values?: any;
  changed_by: string;
  changed_at: string;
  record_id?: string;
}

// Health check types
export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
}

export interface DatabaseHealth {
  status: string;
  database: string;
  connected: boolean;
}

export interface DatabaseInfo {
  version: string;
  database: string;
  user: string;
  connection_status: string;
}