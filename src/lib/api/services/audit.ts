import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import { AuditLog, AuditOperation } from '../types';

// Audit API service
export const auditApi = {
  // Получить записи аудита с фильтрацией
  getAuditLogs: (params?: {
    table?: string;
    operation?: AuditOperation;
    user?: string;
    recordId?: string;
    limit?: number;
  }): Promise<AuditLog[]> => 
    api.get(API_ENDPOINTS.audit, { params }),

  // Получить последние записи аудита
  getRecentAuditLogs: (limit: number = 50): Promise<AuditLog[]> => 
    api.get(`${API_ENDPOINTS.auditRecent}?limit=${limit}`),

  // Получить статистику аудита
  getAuditStatistics: (): Promise<{
    operationStats: any[];
    tableStats: any[];
  }> => 
    api.get(API_ENDPOINTS.auditStatistics),

  // Получить историю изменений записи
  getRecordHistory: (tableName: string, recordId: string): Promise<AuditLog[]> => 
    api.get(`${API_ENDPOINTS.audit}/history?table=${tableName}&recordId=${recordId}`),

  // Получить изменения за последние дни
  getRecentChanges: (days: number = 7): Promise<AuditLog[]> => 
    api.get(`${API_ENDPOINTS.audit}/recent-changes?days=${days}`),

  // Получить активность пользователя
  getUserActivity: (username: string, limit: number = 50): Promise<AuditLog[]> => 
    api.get(`${API_ENDPOINTS.audit}/user-activity?username=${username}&limit=${limit}`),
};