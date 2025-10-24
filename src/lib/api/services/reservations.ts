import { apiClient } from '../client';

// Типы для бронирований
export interface CreateReservationDto {
  restaurant_id: number;
  table_id: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  guests_count: number;
  contact_phone: string;
}

export interface CreateReservationForUserDto {
  user_id: string;
  restaurant_id: number;
  table_id: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  guests_count: number;
  contact_phone: string;
}

export interface ReservationResponseDto {
  reservation_id: string;
  user_id: string;
  restaurant_id: number;
  restaurant_name: string;
  table_id: number;
  table_number: number;
  seats_count: number;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  guests_count: number;
  reservation_status: 'unconfirmed' | 'confirmed' | 'started' | 'completed' | 'cancelled';
  contact_phone: string;
  created_at: Date;
  updated_at: Date;
  confirmed_at?: Date;
}

export interface RestaurantTableAvailabilityDto {
  restaurant_id: number;
  restaurant_name: string;
  table_id: number;
  table_number: number;
  seats_count: number;
  date: string;
  occupied_slots: Array<{
    start_time: string;
    end_time: string;
    reservation_id: string;
  }>;
}

export class ReservationsService {
  // Создать новое бронирование
  static async createReservation(data: CreateReservationDto): Promise<ReservationResponseDto> {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  }

  // Создать бронирование для пользователя (только менеджеры)
  static async createReservationForUser(data: CreateReservationForUserDto): Promise<ReservationResponseDto> {
    const response = await apiClient.post('/reservations/for-user', data);
    return response.data;
  }

  // Получить все бронирования (для менеджеров и админов)
  static async getAllReservations(): Promise<ReservationResponseDto[]> {
    const response = await apiClient.get('/reservations');
    return response.data;
  }

  // Получить активные бронирования
  static async getActiveReservations(): Promise<ReservationResponseDto[]> {
    const response = await apiClient.get('/reservations/active');
    return response.data;
  }

  // Получить неактивные бронирования
  static async getInactiveReservations(): Promise<ReservationResponseDto[]> {
    const response = await apiClient.get('/reservations/inactive');
    return response.data;
  }

  // Получить бронирования текущего пользователя
  static async getUserReservations(): Promise<ReservationResponseDto[]> {
    const response = await apiClient.get('/reservations/my');
    return response.data;
  }

  // Получить активные бронирования текущего пользователя
  static async getUserActiveReservations(): Promise<ReservationResponseDto[]> {
    const response = await apiClient.get('/reservations/my/active');
    return response.data;
  }

  // Получить доступность столика
  static async getTableAvailability(
    restaurantId: number, 
    tableId: number, 
    date: string
  ): Promise<RestaurantTableAvailabilityDto> {
    const response = await apiClient.get(`/reservations/availability/${restaurantId}/${tableId}`, {
      params: { date }
    });
    return response.data;
  }

  // Подтвердить бронирование
  static async confirmReservation(reservationId: string): Promise<ReservationResponseDto> {
    const response = await apiClient.patch(`/reservations/${reservationId}/confirm`);
    return response.data;
  }

  // Отменить бронирование
  static async cancelReservation(reservationId: string): Promise<ReservationResponseDto> {
    const response = await apiClient.patch(`/reservations/${reservationId}/cancel`);
    return response.data;
  }

  // Подтвердить бронирование (для менеджеров)
  static async confirmReservationForManager(reservationId: string): Promise<ReservationResponseDto> {
    const response = await apiClient.patch(`/reservations/manager/${reservationId}/confirm`);
    return response.data;
  }

  // Отменить бронирование (для менеджеров)
  static async cancelReservationForManager(reservationId: string): Promise<ReservationResponseDto> {
    const response = await apiClient.patch(`/reservations/manager/${reservationId}/cancel`);
    return response.data;
  }
}