'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Инициализация - проверяем сохраненные данные и получаем свежий профиль
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = authService.getUser();
        const token = authService.getToken();
        
        if (savedUser && token && !authService.isTokenExpired()) {
          // Сначала устанавливаем сохраненного пользователя
          setUser(savedUser);
          
          // Затем пытаемся получить свежие данные с сервера
          try {
            const freshUserData = await authService.getProfile();
            console.log('🔄 Обновленные данные профиля:', freshUserData);
            setUser(freshUserData);
          } catch (error) {
            console.warn('Не удалось получить свежие данные профиля, используем сохраненные:', error);
            // Оставляем сохраненные данные если не удалось получить свежие
          }
        } else {
          // Токен истек или данные некорректны
          authService.clearAuthData();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<void> => {
    try {
      const response = await authService.login({ usernameOrEmail, password });
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<void> => {
    try {
      await authService.register(data);
      // После регистрации не логиним автоматически
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      // Даже если запрос не удался, очищаем локальные данные
      console.error('Logout error:', error);
      authService.clearAuthData();
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};