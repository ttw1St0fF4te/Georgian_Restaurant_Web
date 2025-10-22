import { api } from './client';
import {
  ReviewResponseDto,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilterDto,
  PaginatedReviewsDto,
  ReviewStatsDto,
} from './types';

export const reviewsApi = {
  // Получить все отзывы с фильтрацией
  getReviews: async (filters: ReviewFilterDto = {}): Promise<PaginatedReviewsDto> => {
    const params = new URLSearchParams();
    
    if (filters.restaurantId) params.append('restaurantId', filters.restaurantId.toString());
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.maxRating) params.append('maxRating', filters.maxRating.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/reviews?${params.toString()}`);
    return response;
  },

  // Получить отзывы конкретного ресторана
  getRestaurantReviews: async (restaurantId: number, filters: ReviewFilterDto = {}): Promise<PaginatedReviewsDto> => {
    const params = new URLSearchParams();
    
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.maxRating) params.append('maxRating', filters.maxRating.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/reviews/restaurant/${restaurantId}?${params.toString()}`);
    return response;
  },

  // Получить статистику отзывов ресторана
  getRestaurantReviewStats: async (restaurantId: number): Promise<ReviewStatsDto> => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}/stats`);
    return response;
  },

  // Получить отзыв по ID
  getReview: async (reviewId: string): Promise<ReviewResponseDto> => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response;
  },

  // Создать новый отзыв
  createReview: async (reviewData: CreateReviewDto): Promise<ReviewResponseDto> => {
    const response = await api.post('/reviews', reviewData);
    return response;
  },

  // Обновить отзыв (только админы)
  updateReview: async (reviewId: string, reviewData: UpdateReviewDto): Promise<ReviewResponseDto> => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response;
  },

  // Удалить отзыв
  deleteReview: async (reviewId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response;
  },

  // Получить отзывы текущего пользователя
  getMyReviews: async (filters: ReviewFilterDto = {}): Promise<PaginatedReviewsDto> => {
    const params = new URLSearchParams();
    
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.maxRating) params.append('maxRating', filters.maxRating.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/reviews/my?${params.toString()}`);
    return response;
  },

  // Удалить свой отзыв для ресторана
  deleteMyRestaurantReview: async (restaurantId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/reviews/restaurant/${restaurantId}/my`);
    return response;
  },

  // Переключить отзыв (создать или удалить)
  toggleRestaurantReview: async (restaurantId: number, reviewData: CreateReviewDto): Promise<ReviewResponseDto | { message: string }> => {
    const response = await api.post(`/reviews/restaurant/${restaurantId}/toggle`, reviewData);
    return response;
  },
};
