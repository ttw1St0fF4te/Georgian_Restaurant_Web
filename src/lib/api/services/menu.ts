import { apiClient } from '../client';

// Типы для фильтров меню
export interface MenuFilterParams {
  search?: string;
  category_id?: number;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  min_price?: number;
  max_price?: number;
  max_cooking_time?: number;
  max_calories?: number;
  sort_by?: 'price' | 'cooking_time_minutes' | 'calories' | 'item_name' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class MenuService {
  // Получить все категории меню
  static async getCategories() {
    const response = await apiClient.get('/menu-categories');
    return response.data;
  }

  // Получить категорию по ID
  static async getCategoryById(id: number) {
    const response = await apiClient.get(`/menu-categories/${id}`);
    return response.data;
  }

  // Получить меню с фильтрацией
  static async getMenu(filters?: MenuFilterParams) {
    const response = await apiClient.get('/menu', { params: filters });
    return response.data;
  }

  // Получить блюда по категории
  static async getMenuByCategory(categoryId: number, filters?: MenuFilterParams) {
    const response = await apiClient.get(`/menu/category/${categoryId}`, { params: filters });
    return response.data;
  }

  // Получить блюдо по ID
  static async getMenuItemById(id: number) {
    const response = await apiClient.get(`/menu/${id}`);
    return response.data;
  }
}