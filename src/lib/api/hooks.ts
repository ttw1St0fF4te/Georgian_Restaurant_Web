import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService, RestaurantService } from './services';
import { reviewsApi } from './reviews';
import { MenuFilterParams } from './services/menu';
import { RestaurantFilterParams } from './services/restaurant';
import { ReviewFilterDto, CreateReviewDto, UpdateReviewDto } from './types';

// Menu hooks
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: MenuService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useMenuCategory = (id: number) => {
  return useQuery({
    queryKey: ['menu', 'categories', id],
    queryFn: () => MenuService.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMenu = (filters?: MenuFilterParams) => {
  return useQuery({
    queryKey: ['menu', 'items', filters],
    queryFn: () => MenuService.getMenu(filters),
    staleTime: 2 * 60 * 1000, // 2 минуты для меню
  });
};

export const useMenuByCategory = (categoryId: number, filters?: MenuFilterParams) => {
  return useQuery({
    queryKey: ['menu', 'items', 'category', categoryId, filters],
    queryFn: () => MenuService.getMenuByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMenuItem = (id: number) => {
  return useQuery({
    queryKey: ['menu', 'items', id],
    queryFn: () => MenuService.getMenuItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Restaurant hooks
export const useRestaurants = (filters?: RestaurantFilterParams) => {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: () => RestaurantService.getRestaurants(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useRestaurant = (id: number) => {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => RestaurantService.getRestaurantById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Reviews hooks
export const useRestaurantReviews = (restaurantId: number, filters?: ReviewFilterDto) => {
  return useQuery({
    queryKey: ['reviews', 'restaurant', restaurantId, filters],
    queryFn: () => reviewsApi.getRestaurantReviews(restaurantId, filters),
    enabled: !!restaurantId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useRestaurantReviewStats = (restaurantId: number) => {
  return useQuery({
    queryKey: ['reviews', 'restaurant', restaurantId, 'stats'],
    queryFn: () => reviewsApi.getRestaurantReviewStats(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyReviews = (filters?: ReviewFilterDto) => {
  return useQuery({
    queryKey: ['reviews', 'my', filters],
    queryFn: () => reviewsApi.getMyReviews(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useReview = (reviewId: string) => {
  return useQuery({
    queryKey: ['reviews', reviewId],
    queryFn: () => reviewsApi.getReview(reviewId),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
  });
};

// Reviews mutations
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData: CreateReviewDto) => reviewsApi.createReview(reviewData),
    onSuccess: (data) => {
      // Обновляем кэш отзывов ресторана
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'restaurant', data.restaurant_id] 
      });
      // Обновляем мои отзывы
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'my'] 
      });
      // Обновляем информацию о ресторане (рейтинг мог измениться)
      queryClient.invalidateQueries({ 
        queryKey: ['restaurants', data.restaurant_id] 
      });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, reviewData }: { reviewId: string; reviewData: UpdateReviewDto }) =>
      reviewsApi.updateReview(reviewId, reviewData),
    onSuccess: (data) => {
      // Обновляем кэш конкретного отзыва
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', data.review_id] 
      });
      // Обновляем отзывы ресторана
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'restaurant', data.restaurant_id] 
      });
      // Обновляем мои отзывы
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'my'] 
      });
      // Обновляем информацию о ресторане
      queryClient.invalidateQueries({ 
        queryKey: ['restaurants', data.restaurant_id] 
      });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: (_, reviewId) => {
      // Удаляем конкретный отзыв из кэша
      queryClient.removeQueries({ 
        queryKey: ['reviews', reviewId] 
      });
      // Обновляем все связанные запросы
      queryClient.invalidateQueries({ 
        queryKey: ['reviews'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['restaurants'] 
      });
    },
  });
};

export const useDeleteMyRestaurantReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (restaurantId: number) => reviewsApi.deleteMyRestaurantReview(restaurantId),
    onSuccess: (_, restaurantId) => {
      // Обновляем отзывы ресторана
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'restaurant', restaurantId] 
      });
      // Обновляем мои отзывы
      queryClient.invalidateQueries({ 
        queryKey: ['reviews', 'my'] 
      });
      // Обновляем информацию о ресторане
      queryClient.invalidateQueries({ 
        queryKey: ['restaurants', restaurantId] 
      });
    },
  });
};