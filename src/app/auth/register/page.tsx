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
  Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Редирект если уже авторизован (только после завершения загрузки)
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

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
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateField = (field: string, value: string) => {
    let fieldError = '';

    switch (field) {
      case 'username':
        if (!value.trim()) {
          fieldError = 'Введите имя пользователя';
        } else if (value.length < 3) {
          fieldError = 'Имя пользователя должно содержать минимум 3 символа';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          fieldError = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldError = 'Введите корректный email адрес';
        }
        break;
      
      case 'password':
        if (!value) {
          fieldError = 'Введите пароль';
        } else if (value.length < 8) {
          fieldError = 'Пароль должен содержать минимум 8 символов';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          fieldError = 'Пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол';
        }
        break;
      
      case 'confirmPassword':
        if (value !== formData.password) {
          fieldError = 'Пароли не совпадают';
        }
        break;
      
      case 'first_name':
        if (!value.trim()) {
          fieldError = 'Введите имя';
        } else if (value.length < 2) {
          fieldError = 'Имя должно содержать минимум 2 символа';
        }
        break;
      
      case 'last_name':
        if (!value.trim()) {
          fieldError = 'Введите фамилию';
        } else if (value.length < 2) {
          fieldError = 'Фамилия должна содержать минимум 2 символа';
        }
        break;
      
      case 'phone':
        if (value && !/^\+?[1-9]\d{1,14}$/.test(value)) {
          fieldError = 'Введите корректный номер телефона';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
  };

  const validateForm = (): string[] => {
    const newErrors: string[] = [];

    if (!formData.username.trim()) {
      newErrors.push('Введите имя пользователя');
    } else if (formData.username.length < 3) {
      newErrors.push('Имя пользователя должно содержать минимум 3 символа');
    }

    if (!formData.email.trim()) {
      newErrors.push('Введите email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push('Введите корректный email');
    }

    if (!formData.password) {
      newErrors.push('Введите пароль');
    } else if (formData.password.length < 8) {
      newErrors.push('Пароль должен содержать минимум 8 символов');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.push('Пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Пароли не совпадают');
    }

    if (!formData.first_name.trim()) {
      newErrors.push('Введите имя');
    } else if (formData.first_name.length < 2) {
      newErrors.push('Имя должно содержать минимум 2 символа');
    }

    if (!formData.last_name.trim()) {
      newErrors.push('Введите фамилию');
    } else if (formData.last_name.length < 2) {
      newErrors.push('Фамилия должна содержать минимум 2 символа');
    }

    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.push('Введите корректный номер телефона');
    }

    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || undefined,
      });

      setSuccessMessage('Регистрация прошла успешно! Теперь вы можете войти в систему.');
      
      // Перенаправляем на страницу входа через 2 секунды
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);

    } catch (error: any) {
      // Логируем ошибку только в режиме разработки
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      
      // Используем сообщение об ошибке напрямую из AuthService
      if (error.message) {
        setErrors([error.message]);
      } else {
        setErrors(['Произошла ошибка при регистрации. Попробуйте снова.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Регистрация
        </Typography>
        
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Создайте аккаунт для доступа к дополнительным возможностям
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                id="first_name"
                label="Имя"
                name="first_name"
                autoComplete="given-name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                disabled={isLoading}
                placeholder="Введите ваше имя"
                error={!!fieldErrors.first_name}
                helperText={fieldErrors.first_name}
              />
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                id="last_name"
                label="Фамилия"
                name="last_name"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                disabled={isLoading}
                placeholder="Введите вашу фамилию"
                error={!!fieldErrors.last_name}
                helperText={fieldErrors.last_name}
              />
            </Box>
            <TextField
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleInputChange('username')}
              disabled={isLoading}
              placeholder="Введите имя пользователя (минимум 3 символа)"
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              disabled={isLoading}
              placeholder="Введите ваш email"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              fullWidth
              id="phone"
              label="Телефон (необязательно)"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              disabled={isLoading}
              placeholder="Введите номер телефона (+995123456789)"
              error={!!fieldErrors.phone}
              helperText={fieldErrors.phone}
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange('password')}
                disabled={isLoading}
                placeholder="Минимум 8 символов"
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
              />
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                name="confirmPassword"
                label="Подтвердите пароль"
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                disabled={isLoading}
                placeholder="Повторите пароль"
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
              />
            </Box>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
          
          <Box textAlign="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" passHref>
                <MuiLink component="span" sx={{ cursor: 'pointer' }}>
                  Войти
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;