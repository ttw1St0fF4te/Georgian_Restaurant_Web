import { apiClient } from './client';

// Типы для корзины
export interface CartItem {
  cart_item_id: number;
  item_id: number;
  item_name: string;
  item_description: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  added_at: string;
  image_url: string | null;
  category_name: string;
  is_vegetarian: boolean;
  is_spicy: boolean;
}

export interface Cart {
  cart_id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartRequest {
  item_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export class CartService {
  private static instance: CartService;
  
  static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  /**
   * Получить корзину пользователя
   */
  async getCart(): Promise<Cart> {
    try {
      const response = await apiClient.get('/cart');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка получения корзины');
    }
  }

  /**
   * Добавить товар в корзину
   */
  async addToCart(itemId: number, quantity: number = 1): Promise<Cart> {
    try {
      const response = await apiClient.post('/cart/add', {
        item_id: itemId,
        quantity,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка добавления товара в корзину');
    }
  }

  /**
   * Обновить количество товара в корзине
   */
  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    try {
      const response = await apiClient.put(`/cart/item/${itemId}`, {
        quantity,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка обновления количества товара');
    }
  }

  /**
   * Удалить товар из корзины
   */
  async removeFromCart(itemId: number): Promise<Cart> {
    try {
      const response = await apiClient.delete(`/cart/item/${itemId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка удаления товара из корзины');
    }
  }

  /**
   * Очистить корзину полностью
   */
  async clearCart(): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete('/cart/clear');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ошибка очистки корзины');
    }
  }
}

export const cartService = CartService.getInstance();