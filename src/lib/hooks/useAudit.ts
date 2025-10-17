import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { auditApi } from '../api/services';
import { AuditLog, AuditOperation } from '../api/types';

// Query keys для audit API
export const auditQueryKeys = {
  all: ['audit'] as const,
  logs: (filters?: object) => [...auditQueryKeys.all, 'logs', filters] as const,
  recent: (limit: number) => [...auditQueryKeys.all, 'recent', limit] as const,
  statistics: () => [...auditQueryKeys.all, 'statistics'] as const,
  history: (table: string, recordId: string) => 
    [...auditQueryKeys.all, 'history', table, recordId] as const,
  changes: (days: number) => [...auditQueryKeys.all, 'changes', days] as const,
  userActivity: (username: string, limit: number) => 
    [...auditQueryKeys.all, 'user-activity', username, limit] as const,
};

// Хук для получения записей аудита с фильтрацией
export const useAuditLogs = (params?: {
  table?: string;
  operation?: AuditOperation;
  user?: string;
  recordId?: string;
  limit?: number;
}): UseQueryResult<AuditLog[], Error> => {
  return useQuery({
    queryKey: auditQueryKeys.logs(params),
    queryFn: () => auditApi.getAuditLogs(params),
    staleTime: 30000, // 30 секунд
  });
};

// Хук для получения последних записей аудита
export const useRecentAuditLogs = (limit: number = 50): UseQueryResult<AuditLog[], Error> => {
  return useQuery({
    queryKey: auditQueryKeys.recent(limit),
    queryFn: () => auditApi.getRecentAuditLogs(limit),
    refetchInterval: 60000, // Обновляем каждую минуту
  });
};

// Хук для получения статистики аудита
export const useAuditStatistics = (): UseQueryResult<{
  operationStats: any[];
  tableStats: any[];
}, Error> => {
  return useQuery({
    queryKey: auditQueryKeys.statistics(),
    queryFn: auditApi.getAuditStatistics,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения истории изменений записи
export const useRecordHistory = (
  tableName: string, 
  recordId: string,
  enabled: boolean = true
): UseQueryResult<AuditLog[], Error> => {
  return useQuery({
    queryKey: auditQueryKeys.history(tableName, recordId),
    queryFn: () => auditApi.getRecordHistory(tableName, recordId),
    enabled: enabled && !!tableName && !!recordId,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для получения изменений за последние дни
export const useRecentChanges = (days: number = 7): UseQueryResult<AuditLog[], Error> => {
  return useQuery({
    queryKey: auditQueryKeys.changes(days),
    queryFn: () => auditApi.getRecentChanges(days),
    staleTime: 60000, // 1 минута
  });
};

// Хук для получения активности пользователя
export const useUserActivity = (
  username: string, 
  limit: number = 50,
  enabled: boolean = true
): UseQueryResult<AuditLog[], Error> => {
  return useQuery({
    queryKey: auditQueryKeys.userActivity(username, limit),
    queryFn: () => auditApi.getUserActivity(username, limit),
    enabled: enabled && !!username,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};