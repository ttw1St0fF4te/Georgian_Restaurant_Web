import { apiClient } from '../client';

export interface SalesByDayRow {
  day: string;
  total: number;
}

export interface OccupancyRow {
  table_id: number;
  table_number?: number;
  reservations_count: number;
}

export interface UserVisitsRow {
  day: string;
  total_visits: number;
}

export class ReportsService {
  static async getSalesByDay(restaurantId: number | null, from: string, to: string): Promise<SalesByDayRow[]> {
    const params: any = { from, to };
    if (restaurantId) params.restaurantId = restaurantId;
    const response = await apiClient.get('/reports/sales', { params });
    return response.data;
  }

  static async getOccupancyByTable(restaurantId: number | null, from: string, to: string): Promise<OccupancyRow[]> {
    const params: any = { from, to };
    if (restaurantId) params.restaurantId = restaurantId;
    const response = await apiClient.get('/reports/occupancy', { params });
    return response.data;
  }

  static async getUserVisits(from: string, to: string): Promise<UserVisitsRow[]> {
    const response = await apiClient.get('/reports/user-visits', { params: { from, to } });
    return response.data;
  }

  static async exportSalesCsv(restaurantId: number | null, from: string, to: string) {
    const params: any = { from, to };
    if (restaurantId) params.restaurantId = restaurantId;
    // Expecting text/csv
    const response = await apiClient.get(`/reports/export/sales`, { params, responseType: 'blob' as any });
    return response.data;
  }

  static async exportOccupancyCsv(restaurantId: number | null, from: string, to: string) {
    const params: any = { from, to };
    if (restaurantId) params.restaurantId = restaurantId;
    const response = await apiClient.get(`/reports/export/occupancy`, { params, responseType: 'blob' as any });
    return response.data;
  }

  static async exportUserVisitsCsv(from: string, to: string) {
    const response = await apiClient.get(`/reports/export/user-visits`, { params: { from, to }, responseType: 'blob' as any });
    return response.data;
  }

  static async exportAllDataCsv(restaurantId: number | null, from: string, to: string) {
    const params: any = { from, to };
    if (restaurantId) params.restaurantId = restaurantId;
    const response = await apiClient.get(`/reports/export/all`, { params, responseType: 'blob' as any });
    return response.data;
  }
}
