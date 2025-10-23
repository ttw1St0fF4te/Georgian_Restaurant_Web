import { api } from './client';

export interface CreateReservationDto {
  restaurant_id: number;
  table_id: number;
  reservation_date: string; // YYYY-MM-DD
  reservation_time: string; // HH:MM
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
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

export interface TableResponseDto {
  table_id: number;
  restaurant_id: number;
  table_number: number;
  seats_count: number;
  is_available: boolean;
}

export interface ReservationAvailabilityDto {
  reservations: ReservationResponseDto[];
  occupiedTimeSlots: {
    start: string;
    end: string;
    reservation_id: string;
  }[];
}

// API функции
export const reservationsApi = {
  // Создание бронирования
  createReservation: (data: CreateReservationDto): Promise<ReservationResponseDto> =>
    api.post('/reservations', data),

  // Получение активных бронирований пользователя
  getUserActiveReservations: (): Promise<ReservationResponseDto[]> =>
    api.get('/reservations/my/active'),

  // Получение всех бронирований пользователя
  getUserReservations: (): Promise<ReservationResponseDto[]> =>
    api.get('/reservations/my'),

  // Подтверждение бронирования
  confirmReservation: (reservationId: string): Promise<ReservationResponseDto> =>
    api.patch(`/reservations/${reservationId}/confirm`),

  // Отмена бронирования
  cancelReservation: (reservationId: string): Promise<ReservationResponseDto> =>
    api.patch(`/reservations/${reservationId}/cancel`),

  // Получение столиков ресторана
  getRestaurantTables: (restaurantId: number): Promise<TableResponseDto[]> =>
    api.get(`/restaurants/${restaurantId}/tables`),

  // Получение доступности столика на дату
  getTableAvailability: (restaurantId: number, tableId: number, date: string): Promise<ReservationAvailabilityDto> =>
    api.get(`/reservations/availability/${restaurantId}/${tableId}?date=${date}`),
};