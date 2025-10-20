'use client';

import React, { useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ManageAccounts as ManagerIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ManagerPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Проверка авторизации и роли (только после завершения загрузки)
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user && user.role !== 'manager' && user.role !== 'admin') {
        router.push('/');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Показываем загрузку пока идет инициализация
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Если загрузка завершена но пользователя нет - редирект уже произошел
  if (!user) {
    return null;
  }

  if (user.role !== 'manager' && user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          У вас нет доступа к этой странице. Только менеджеры и администраторы могут просматривать эту страницу.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок страницы */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <ManagerIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" color="primary">
            Панель менеджера
          </Typography>
        </Box>
        
        <Typography variant="h6" color="text.secondary">
          Добро пожаловать, {user.first_name} {user.last_name}!
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 1 }}>
          Это панель менеджера ресторана "Грузинские традиции". 
          Здесь вы можете управлять ежедневными операциями ресторана.
        </Typography>
      </Paper>

      {/* Карточки с функциями */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление заказами
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Просмотр активных заказов, изменение статусов, управление очередью.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление меню
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Редактирование цен, добавление блюд дня, управление наличием.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление столиками
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Бронирование столов, управление рассадкой гостей.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Отчеты продаж
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ежедневные отчеты, популярные блюда, выручка.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление персоналом
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Расписание смен, задачи для сотрудников.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Обратная связь
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Отзывы клиентов, жалобы, предложения по улучшению.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Быстрая статистика */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Статистика на сегодня
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Активные заказы
            </Typography>
            <Typography variant="h4" color="primary">
              -
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Выручка
            </Typography>
            <Typography variant="h4" color="success.main">
              - ₾
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Забронированные столы
            </Typography>
            <Typography variant="h4" color="warning.main">
              -
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Посетители
            </Typography>
            <Typography variant="h4" color="info.main">
              -
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Информационный блок */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Информация о смене
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ваша роль
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {user.role === 'admin' ? 'Администратор' : 'Менеджер'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Время входа
            </Typography>
            <Typography variant="body1">
              {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {user.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Кнопки действий */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => router.push('/profile')}
        >
          Редактировать профиль
        </Button>
        {user.role === 'admin' && (
          <Button 
            variant="outlined" 
            onClick={() => router.push('/admin')}
          >
            Админ панель
          </Button>
        )}
        <Button 
          variant="contained" 
          color="error"
          onClick={handleLogout}
        >
          Завершить смену
        </Button>
      </Box>
    </Container>
  );
};

export default ManagerPage;