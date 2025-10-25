import { api } from '../client';

// Database API service
export const databaseApi = {
  // Создать полный дамп базы данных
  createDump: (): Promise<{
    success: boolean;
    message: string;
    filePath: string;
    fileName: string;
  }> => 
    api.post('/database/dump'),

  // Получить информацию о базе данных
  getDatabaseInfo: (): Promise<{
    host: string;
    port: string;
    database: string;
    user: string;
  }> => 
    api.get('/database/info'),
};