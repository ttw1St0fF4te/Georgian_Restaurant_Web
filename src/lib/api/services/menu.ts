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

// Типы для создания и обновления блюд
export interface CreateMenuItemDto {
  item_name: string;
  item_description?: string;
  category_id: number;
  price: number;
  cooking_time_minutes?: number;
  calories?: number;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  image_url?: string;
}

export interface UpdateMenuItemDto {
  item_name?: string;
  item_description?: string;
  category_id?: number;
  price?: number;
  cooking_time_minutes?: number;
  calories?: number;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  image_url?: string;
}

export interface MenuItemResponseDto {
  item_id: number;
  item_name: string;
  item_description?: string;
  category_id: number;
  price: number;
  cooking_time_minutes: number;
  calories?: number;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_deleted: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
  category?: {
    category_id: number;
    category_name: string;
    category_description?: string;
  };
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

  // === ФУНКЦИИ ДЛЯ МЕНЕДЖЕРА ===

  // Создать новое блюдо
  static async createMenuItem(data: CreateMenuItemDto): Promise<MenuItemResponseDto> {
    const response = await apiClient.post('/menu', data);
    return response.data;
  }

  // Обновить блюдо
  static async updateMenuItem(id: number, data: UpdateMenuItemDto): Promise<MenuItemResponseDto> {
    const response = await apiClient.patch(`/menu/${id}`, data);
    return response.data;
  }

  // Мягкое удаление блюда (is_deleted = true)
  static async softDeleteMenuItem(id: number): Promise<MenuItemResponseDto> {
    const response = await apiClient.patch(`/menu/${id}/soft-delete`);
    return response.data;
  }

  // Восстановить удаленное блюдо (is_deleted = false)
  static async restoreMenuItem(id: number): Promise<MenuItemResponseDto> {
    const response = await apiClient.patch(`/menu/${id}/restore`);
    return response.data;
  }

  // Получить все блюда включая удаленные (для менеджера)
  static async getAllMenuItems(filters?: MenuFilterParams) {
    const response = await apiClient.get('/menu/all', { params: filters });
    return response.data;
  }
}