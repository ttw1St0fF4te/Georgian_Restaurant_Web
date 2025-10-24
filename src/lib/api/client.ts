import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './config';

// Создаем экземпляр axios с базовой конфигурацией
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы для API ответов
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  error?: string;
}

// Интерцептор запросов - добавляем JWT токен если есть
apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('georgian_restaurant_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Request with token:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : null
        });
      } else {
        console.log('⚠️ No token found for request:', config.url);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответов - обработка ошибок
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    console.log('🚨 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'Неизвестная ошибка',
      status: error.response?.status || 500,
      error: error.response?.data?.error,
    };

    // Если 401 - перенаправляем на логин
    if (error.response?.status === 401) {
      console.log('🚨 401 Unauthorized - clearing auth data and redirecting to login');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('georgian_restaurant_token');
        localStorage.removeItem('georgian_restaurant_user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(apiError);
  }
);

// Вспомогательные функции для API запросов
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then((response) => response.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then((response) => response.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then((response) => response.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then((response) => response.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then((response) => response.data),
};