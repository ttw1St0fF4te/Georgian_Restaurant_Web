import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import { HealthStatus, DatabaseHealth, DatabaseInfo } from '../types';

// Health API service
export const healthApi = {
  // Проверка работоспособности API
  getHealth: (): Promise<HealthStatus> => 
    api.get(API_ENDPOINTS.health),

  // Проверка подключения к базе данных
  getDatabaseHealth: (): Promise<DatabaseHealth> => 
    api.get(API_ENDPOINTS.healthDb),

  // Подробная информация о базе данных
  getDatabaseInfo: (): Promise<DatabaseInfo> => 
    api.get(API_ENDPOINTS.healthDbInfo),
};