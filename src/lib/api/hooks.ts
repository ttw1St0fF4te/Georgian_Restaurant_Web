import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService, RestaurantService } from './services';
import { reviewsApi } from './reviews';
import { reservationsApi } from './reservations';
import { ordersApi } from './orders';
import {
  MenuItemResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuFilterParams,
} from '@/lib/api/services/menu';
import {
  ReservationsService,
  ReservationResponseDto,
  CreateReservationDto as ReservationCreateDto,
  CreateReservationForUserDto,
} from '@/lib/api/services/reservations';
import { AuthService } from '@/lib/api/services/auth';
import { RestaurantFilterParams } from './services/restaurant';
import { ReviewFilterDto, CreateReviewDto, UpdateReviewDto } from './types';
import { CreateReservationDto } from './reservations';
import { CreateOrderDto } from './orders';

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

// Reservations hooks
export const useUserActiveReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'my', 'active'],
    queryFn: reservationsApi.getUserActiveReservations,
    staleTime: 30 * 1000, // 30 секунд - часто обновляем для актуальности
  });
};

export const useUserReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'my'],
    queryFn: reservationsApi.getUserReservations,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useRestaurantTables = (restaurantId: number) => {
  return useQuery({
    queryKey: ['restaurants', restaurantId, 'tables'],
    queryFn: () => reservationsApi.getRestaurantTables(restaurantId),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useTableAvailability = (restaurantId: number, tableId: number, date: string) => {
  return useQuery({
    queryKey: ['reservations', 'availability', restaurantId, tableId, date],
    queryFn: () => reservationsApi.getTableAvailability(restaurantId, tableId, date),
    enabled: !!restaurantId && !!tableId && !!date,
    staleTime: 1 * 60 * 1000, // 1 минута - быстро обновляем для точности
  });
};

// Reservations mutations
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationData: CreateReservationDto) => reservationsApi.createReservation(reservationData),
    onSuccess: () => {
      // Обновляем активные бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my', 'active'] 
      });
      // Обновляем все бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my'] 
      });
      // Обновляем доступность столиков
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'availability'] 
      });
    },
  });
};

export const useConfirmReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => reservationsApi.confirmReservation(reservationId),
    onSuccess: () => {
      // Обновляем активные бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my', 'active'] 
      });
      // Обновляем все бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my'] 
      });
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => reservationsApi.cancelReservation(reservationId),
    onSuccess: () => {
      // Обновляем активные бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my', 'active'] 
      });
      // Обновляем все бронирования пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my'] 
      });
      // Обновляем доступность столиков
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'availability'] 
      });
    },
  });
};

// Orders hooks
export const useUserOrders = () => {
  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: ordersApi.getUserOrders,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => ordersApi.getOrder(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useUserAddress = () => {
  return useQuery({
    queryKey: ['user', 'address'],
    queryFn: ordersApi.getUserAddress,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Получение активных бронирований со статусом 'started' для заказа в ресторане
export const useUserStartedReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'my', 'started'],
    queryFn: async () => {
      const reservations = await reservationsApi.getUserActiveReservations();
      return reservations.filter(r => r.reservation_status === 'started');
    },
    staleTime: 30 * 1000, // 30 секунд - часто обновляем для актуальности
  });
};

// Orders mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderDto) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      // Обновляем заказы пользователя
      queryClient.invalidateQueries({ 
        queryKey: ['orders', 'my'] 
      });
      // Обновляем корзину (она должна очиститься после заказа)
      queryClient.invalidateQueries({ 
        queryKey: ['cart'] 
      });
      // Обновляем активные бронирования (если заказ был в ресторане)
      queryClient.invalidateQueries({ 
        queryKey: ['reservations', 'my', 'active'] 
      });
    },
  });
};

// === ХУКИ ДЛЯ УПРАВЛЕНИЯ МЕНЮ (МЕНЕДЖЕР) ===

// Получить все блюда включая удаленные (для менеджера)
export const useAllMenuItems = (filters?: MenuFilterParams) => {
  return useQuery({
    queryKey: ['menu', 'all', filters],
    queryFn: () => MenuService.getAllMenuItems(filters),
    staleTime: 1 * 60 * 1000, // 1 минута - часто обновляем для актуальности
  });
};

// Создать блюдо
export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuItemData: CreateMenuItemDto) => MenuService.createMenuItem(menuItemData),
    onSuccess: () => {
      // Обновляем все запросы меню
      queryClient.invalidateQueries({ 
        queryKey: ['menu'] 
      });
    },
  });
};

// Обновить блюдо
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMenuItemDto }) =>
      MenuService.updateMenuItem(id, data),
    onSuccess: (data) => {
      // Обновляем конкретное блюдо
      queryClient.invalidateQueries({ 
        queryKey: ['menu', 'items', data.item_id] 
      });
      // Обновляем все запросы меню
      queryClient.invalidateQueries({ 
        queryKey: ['menu'] 
      });
    },
  });
};

// Мягкое удаление блюда
export const useSoftDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MenuService.softDeleteMenuItem(id),
    onSuccess: (data) => {
      // Обновляем конкретное блюдо
      queryClient.invalidateQueries({ 
        queryKey: ['menu', 'items', data.item_id] 
      });
      // Обновляем все запросы меню
      queryClient.invalidateQueries({ 
        queryKey: ['menu'] 
      });
    },
  });
};

// Восстановить блюдо
export const useRestoreMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MenuService.restoreMenuItem(id),
    onSuccess: (data) => {
      // Обновляем конкретное блюдо
      queryClient.invalidateQueries({ 
        queryKey: ['menu', 'items', data.item_id] 
      });
      // Обновляем все запросы меню
      queryClient.invalidateQueries({ 
        queryKey: ['menu'] 
      });
    },
  });
};

// ===== RESERVATIONS HOOKS =====

// Получить все бронирования (для менеджеров)
export const useAllReservations = () => {
  return useQuery({
    queryKey: ['reservations', 'all'],
    queryFn: ReservationsService.getAllReservations,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Подтвердить бронирование (для менеджера)
export const useConfirmReservationForManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => ReservationsService.confirmReservationForManager(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// Отменить бронирование (для менеджера)
export const useCancelReservationForManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) => ReservationsService.cancelReservationForManager(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// Создать бронирование для пользователя (менеджером)
export const useCreateReservationForManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationData: CreateReservationForUserDto) => ReservationsService.createReservationForUser(reservationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
};

// ===== AUTH HOOKS =====

// Получить всех пользователей (для менеджеров)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: AuthService.getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};