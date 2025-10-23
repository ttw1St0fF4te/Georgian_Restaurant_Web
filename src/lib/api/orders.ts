import { api } from './client';

export type OrderType = 'delivery' | 'dine_in';

export interface CreateOrderDto {
  order_type: OrderType;
  delivery_country?: string;
  delivery_city?: string;
  delivery_street_address?: string;
  delivery_phone?: string;
  reservation_id?: string;
  should_update_user_address?: boolean;
}

export interface OrderItemResponseDto {
  order_item_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderResponseDto {
  order_id: string;
  user_id: string;
  order_type: OrderType;
  delivery_country?: string;
  delivery_city?: string;
  delivery_street_address?: string;
  delivery_phone?: string;
  reservation_id?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemResponseDto[];
}

export interface UserAddressDto {
  country?: string;
  city?: string;
  street_address?: string;
}

// API функции
export const ordersApi = {
  // Создание заказа
  createOrder: (data: CreateOrderDto): Promise<OrderResponseDto> =>
    api.post('/orders', data),

  // Получение заказов пользователя
  getUserOrders: (): Promise<OrderResponseDto[]> =>
    api.get('/orders/my'),

  // Получение конкретного заказа
  getOrder: (orderId: string): Promise<OrderResponseDto> =>
    api.get(`/orders/${orderId}`),

  // Получение адреса пользователя для автозаполнения
  getUserAddress: (): Promise<UserAddressDto | null> =>
    api.get('/orders/my-address'),
};