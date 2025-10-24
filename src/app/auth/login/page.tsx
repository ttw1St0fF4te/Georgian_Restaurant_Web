'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Редирект если уже авторизован (только после завершения загрузки)
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Редирект в зависимости от роли пользователя
      if (user.role === 'manager') {
        router.push('/manager');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Валидация конкретного поля
    validateField(field, value);
    
    // Очищаем общие ошибки при вводе
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateField = (field: string, value: string) => {
    let fieldError = '';

    switch (field) {
      case 'usernameOrEmail':
        if (!value.trim()) {
          fieldError = 'Введите email или имя пользователя';
        }
        break;
      
      case 'password':
        if (!value) {
          fieldError = 'Введите пароль';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Валидация
    const newErrors: string[] = [];
    if (!formData.usernameOrEmail.trim()) {
      newErrors.push('Введите имя пользователя или email');
    }
    if (!formData.password.trim()) {
      newErrors.push('Введите пароль');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await login(formData.usernameOrEmail, formData.password);
      // Редирект будет выполнен в useEffect после обновления user
    } catch (error: any) {
      // Логируем ошибку только в режиме разработки
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      
      // Используем сообщение об ошибке напрямую из AuthService
      if (error.message) {
        setErrors([error.message]);
      } else {
        setErrors(['Произошла ошибка при входе. Попробуйте снова.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Вход в систему
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Войдите в свой аккаунт для доступа к персональным функциям
        </Typography>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="usernameOrEmail"
            label="Имя пользователя или Email"
            name="usernameOrEmail"
            autoComplete="username"
            autoFocus
            value={formData.usernameOrEmail}
            onChange={handleInputChange('usernameOrEmail')}
            disabled={isLoading}
            placeholder="Введите имя пользователя или email"
            error={!!fieldErrors.usernameOrEmail}
            helperText={fieldErrors.usernameOrEmail}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isLoading}
            placeholder="Введите пароль"
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
          
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Нет аккаунта?{' '}
              <Link href="/auth/register" passHref>
                <MuiLink component="span" sx={{ cursor: 'pointer' }}>
                  Зарегистрироваться
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;