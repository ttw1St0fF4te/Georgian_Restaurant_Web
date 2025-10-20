import axios from 'axios';

// Конфигурация API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Типы для аутентификации
export interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  city?: string;
  street_address?: string;
  role: 'admin' | 'manager' | 'user' | 'guest';
  role_id: number;
  created_at?: string;
  last_login?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  status: string;
  message: string;
  user: User;
  created_at: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  street_address?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

// Класс для работы с аутентификацией
class AuthService {
  private readonly TOKEN_KEY = 'georgian_restaurant_token';
  private readonly USER_KEY = 'georgian_restaurant_user';
  private readonly API_URL = API_BASE_URL;

  // Проверка, выполняется ли код на клиенте
  private isClient = typeof window !== 'undefined';

  // Настройка axios с автоматическим добавлением токена
  private api = axios.create({
    baseURL: this.API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Интерцептор для автоматического добавления токена
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Интерцептор для обработки ошибок авторизации
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Проверяем, не является ли это ошибкой смены пароля или другими операциями,
          // где 401 не означает недействительность токена
          const url = error.config?.url;
          const isPasswordChangeError = url && (url.includes('/auth/change-password') || url.includes('/auth/profile/password'));
          const isLoginError = url && url.includes('/auth/login');
          
          // Не разлогиниваем пользователя при ошибках смены пароля или входа
          if (!isPasswordChangeError && !isLoginError) {
            // Токен недействителен - очищаем данные
            this.clearAuthData();
            // Редирект на страницу входа (только на клиенте)
            if (this.isClient && window.location.pathname !== '/auth/login') {
              window.location.href = '/auth/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Сохранение данных авторизации
  setAuthData(token: string, user: User): void {
    if (!this.isClient) return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Получение токена
  getToken(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Получение данных пользователя
  getUser(): User | null {
    if (!this.isClient) return null;
    
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Проверка авторизации
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // Проверка срока действия токена
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  // Очистка данных авторизации
  clearAuthData(): void {
    if (!this.isClient) return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Вход в систему
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/login', credentials);
      const { access_token, user } = response.data;
      
      this.setAuthData(access_token, user);
      return response.data;
    } catch (error: any) {
      // Улучшенная обработка ошибок
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (Array.isArray(message)) {
          // Переводим ошибки валидации на русский
          const translatedErrors = message.map((msg: string) => {
            if (msg.includes('password must be longer than or equal to')) {
              return 'Пароль должен содержать минимум 6 символов';
            }
            if (msg.includes('username must be longer than or equal to')) {
              return 'Имя пользователя должно содержать минимум 3 символа';
            }
            if (msg.includes('email must be an email')) {
              return 'Введите корректный email адрес';
            }
            if (msg.includes('username should not be empty')) {
              return 'Введите имя пользователя';
            }
            if (msg.includes('password should not be empty')) {
              return 'Введите пароль';
            }
            return msg; // Возвращаем оригинальное сообщение если перевод не найден
          });
          throw new Error(translatedErrors.join(', '));
        } else if (typeof message === 'string') {
          if (message.includes('password must be longer than or equal to')) {
            throw new Error('Пароль должен содержать минимум 6 символов');
          }
          if (message.includes('username must be longer than or equal to')) {
            throw new Error('Имя пользователя должно содержать минимум 3 символа');
          }
          if (message.includes('email must be an email')) {
            throw new Error('Введите корректный email адрес');
          }
          throw new Error(message);
        }
        throw new Error('Ошибка валидации данных');
      } else if (error.response?.status === 401) {
        throw new Error('Неверный логин или пароль');
      } else if (error.response?.status === 403) {
        throw new Error('Доступ запрещен');
      } else if (error.response?.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету');
      }
      
      // Если не удалось определить тип ошибки
      throw new Error(error.response?.data?.message || 'Произошла неизвестная ошибка');
    }
  }

  // Регистрация
  async register(data: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await this.api.post<RegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      // Улучшенная обработка ошибок для регистрации
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (Array.isArray(message)) {
          // Переводим ошибки валидации на русский
          const translatedErrors = message.map((msg: string) => {
            if (msg.includes('password must be longer than or equal to')) {
              return 'Пароль должен содержать минимум 8 символов';
            }
            if (msg.includes('username must be longer than or equal to')) {
              return 'Имя пользователя должно содержать минимум 3 символа';
            }
            if (msg.includes('email must be an email')) {
              return 'Введите корректный email адрес';
            }
            if (msg.includes('first_name must be longer than or equal to')) {
              return 'Имя должно содержать минимум 2 символа';
            }
            if (msg.includes('last_name must be longer than or equal to')) {
              return 'Фамилия должна содержать минимум 2 символа';
            }
            if (msg.includes('should not be empty')) {
              if (msg.includes('username')) return 'Введите имя пользователя';
              if (msg.includes('password')) return 'Введите пароль';
              if (msg.includes('email')) return 'Введите email';
              if (msg.includes('first_name')) return 'Введите имя';
              if (msg.includes('last_name')) return 'Введите фамилию';
            }
            return msg; // Возвращаем оригинальное сообщение если перевод не найден
          });
          throw new Error(translatedErrors.join(', '));
        } else if (typeof message === 'string') {
          if (message.includes('already exists') || message.includes('уже существует')) {
            if (message.includes('username') || message.includes('пользователь')) {
              throw new Error('Пользователь с таким именем уже существует');
            }
            if (message.includes('email') || message.includes('почта')) {
              throw new Error('Пользователь с таким email уже существует');
            }
          }
          throw new Error(message);
        }
        throw new Error('Ошибка валидации данных');
      } else if (error.response?.status === 409) {
        throw new Error('Пользователь с такими данными уже существует');
      } else if (error.response?.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету');
      }
      
      // Если не удалось определить тип ошибки
      throw new Error(error.response?.data?.message || 'Произошла неизвестная ошибка при регистрации');
    }
  }

  // Получение профиля
  async getProfile(): Promise<User> {
    try {
      const response = await this.api.get<User>('/auth/profile');
      
      // Обновляем данные пользователя в localStorage с полученными данными
      const token = this.getToken();
      if (token) {
        this.setAuthData(token, response.data);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Сессия истекла. Войдите в систему снова');
      } else if (error.response?.status === 403) {
        throw new Error('Доступ запрещен');
      } else if (error.response?.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка получения профиля');
    }
  }

  // Обновление профиля
  async updateProfile(data: UpdateProfileData): Promise<{ status: string; message: string; updated_user_id: string }> {
    console.log('Отправка данных профиля:', data);
    try {
      const response = await this.api.put('/auth/profile', data);
      console.log('Ответ сервера:', response.data);
      
      // Обновляем данные пользователя в localStorage
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        this.setAuthData(this.getToken()!, updatedUser);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error.response?.data || error.message);
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (Array.isArray(message)) {
          const translatedErrors = message.map((msg: string) => {
            // Переводы ошибок валидации
            if (msg.includes('first_name must be longer than or equal to') || msg.includes('Имя должно быть от')) {
              return 'Имя должно содержать минимум 2 символа';
            }
            if (msg.includes('last_name must be longer than or equal to') || msg.includes('Фамилия должна быть от')) {
              return 'Фамилия должна содержать минимум 2 символа';
            }
            if (msg.includes('phone must match') || msg.includes('Телефон должен быть в международном формате')) {
              return 'Телефон должен быть в международном формате, например +79161234567';
            }
            if (msg.includes('country must be longer than or equal to') || msg.includes('Название страны должно быть от')) {
              return 'Название страны должно быть от 2 до 100 символов';
            }
            if (msg.includes('city must be longer than or equal to') || msg.includes('Название города должно быть от')) {
              return 'Название города должно быть от 2 до 100 символов';
            }
            if (msg.includes('street_address must be longer than or equal to') || msg.includes('Адрес должен быть от')) {
              return 'Адрес должен быть от 5 до 500 символов';
            }
            if (msg.includes('should not be empty')) {
              if (msg.includes('first_name')) return 'Введите имя';
              if (msg.includes('last_name')) return 'Введите фамилию';
              if (msg.includes('phone')) return 'Введите номер телефона';
              if (msg.includes('country')) return 'Введите страну';
              if (msg.includes('city')) return 'Введите город';
              if (msg.includes('street_address')) return 'Введите адрес';
            }
            // Возвращаем исходное сообщение, если перевод не найден
            return msg;
          });
          throw new Error(translatedErrors.join(', '));
        }
        throw new Error(message || 'Ошибка валидации данных');
      } else if (error.response?.status === 401) {
        throw new Error('Сессия истекла. Войдите в систему снова');
      } else if (error.response?.status === 403) {
        throw new Error('Доступ запрещен');
      } else if (error.response?.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
    }
  }

  // Смена пароля
  async changePassword(data: ChangePasswordData): Promise<{ status: string; message: string; updated_user_id: string }> {
    try {
      const response = await this.api.post('/auth/profile/password', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const message = error.response.data?.message;
        if (Array.isArray(message)) {
          const translatedErrors = message.map((msg: string) => {
            if (msg.includes('password must be longer than or equal to')) {
              return 'Новый пароль должен содержать минимум 8 символов';
            }
            if (msg.includes('current_password is incorrect')) {
              return 'Неверный текущий пароль';
            }
            if (msg.includes('should not be empty')) {
              if (msg.includes('current_password')) return 'Введите текущий пароль';
              if (msg.includes('new_password')) return 'Введите новый пароль';
            }
            return msg;
          });
          throw new Error(translatedErrors.join(', '));
        } else if (typeof message === 'string') {
          if (message.includes('current_password is incorrect') || message.includes('Неверный пароль')) {
            throw new Error('Неверный текущий пароль');
          }
          throw new Error(message);
        }
        throw new Error('Ошибка валидации данных');
      } else if (error.response?.status === 401) {
        // 401 при смене пароля обычно означает неверный текущий пароль
        const message = error.response.data?.message;
        if (message && (message.includes('current_password') || message.includes('Unauthorized') || message.includes('пароль'))) {
          throw new Error('Неверный текущий пароль');
        }
        throw new Error('Ошибка авторизации при смене пароля');
      } else if (error.response?.status === 403) {
        throw new Error('Доступ запрещен');
      } else if (error.response?.status === 500) {
        throw new Error('Внутренняя ошибка сервера. Попробуйте позже');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету');
      }
      
      throw new Error(error.response?.data?.message || 'Ошибка смены пароля');
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      // Уведомляем сервер о выходе
      await this.api.post('/auth/logout');
    } catch (error) {
      // Игнорируем ошибки при logout - главное очистить локальные данные
      console.warn('Logout request failed:', error);
    } finally {
      // Очищаем локальные данные
      this.clearAuthData();
    }
  }

  // Проверка роли пользователя
  hasRole(role: User['role']): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  // Проверка разрешений
  canAccess(allowedRoles: User['role'][]): boolean {
    const user = this.getUser();
    return user ? allowedRoles.includes(user.role) : false;
  }
}

// Экспортируем экземпляр сервиса
export const authService = new AuthService();
export default authService;