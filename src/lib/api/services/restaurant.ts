import { apiClient } from '../client';

export interface RestaurantFilterParams {
  search?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
  min_rating?: number;
}

export class RestaurantService {
  // Получить все рестораны с фильтрацией
  static async getRestaurants(filters?: RestaurantFilterParams) {
    const response = await apiClient.get('/restaurants', { params: filters });
    return response.data;
  }

  // Получить ресторан по ID с детальной информацией
  static async getRestaurantById(id: number) {
    const response = await apiClient.get(`/restaurants/${id}`);
    return response.data;
  }
}