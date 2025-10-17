import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { healthApi } from '../api/services';
import { HealthStatus, DatabaseHealth, DatabaseInfo } from '../api/types';

// Query keys для health API
export const healthQueryKeys = {
  all: ['health'] as const,
  health: () => [...healthQueryKeys.all, 'status'] as const,
  database: () => [...healthQueryKeys.all, 'database'] as const,
  databaseInfo: () => [...healthQueryKeys.all, 'database', 'info'] as const,
};

// Хук для проверки работоспособности API
export const useHealth = (): UseQueryResult<HealthStatus, Error> => {
  return useQuery({
    queryKey: healthQueryKeys.health(),
    queryFn: healthApi.getHealth,
    refetchInterval: 30000, // Проверяем каждые 30 секунд
  });
};

// Хук для проверки подключения к базе данных
export const useDatabaseHealth = (): UseQueryResult<DatabaseHealth, Error> => {
  return useQuery({
    queryKey: healthQueryKeys.database(),
    queryFn: healthApi.getDatabaseHealth,
    refetchInterval: 60000, // Проверяем каждую минуту
  });
};

// Хук для получения информации о базе данных
export const useDatabaseInfo = (): UseQueryResult<DatabaseInfo, Error> => {
  return useQuery({
    queryKey: healthQueryKeys.databaseInfo(),
    queryFn: healthApi.getDatabaseInfo,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};