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
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Проверка авторизации и роли (только после завершения загрузки)
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (user && user.role !== 'admin') {
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

  if (user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          У вас нет доступа к этой странице. Только администраторы могут просматривать эту страницу.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок страницы */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <AdminIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" color="primary">
            Административная панель
          </Typography>
        </Box>
        
        <Typography variant="h6" color="text.secondary">
          Добро пожаловать, {user.first_name} {user.last_name}!
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 1 }}>
          Это панель администратора ресторана "Грузинские традиции". 
          Здесь вы можете управлять всеми аспектами работы ресторана.
        </Typography>
      </Paper>

      {/* Карточки с функциями */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление пользователями
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Просмотр, создание, редактирование и удаление пользователей системы.
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
              Добавление, редактирование и удаление блюд, управление категориями.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление заказами
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Просмотр всех заказов, управление статусами, аналитика продаж.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Настройки ресторана
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Настройка информации о ресторане, время работы, контакты.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Отчеты и аналитика
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Финансовые отчеты, статистика продаж, популярные блюда.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 300, flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Управление промокодами
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Создание и управление скидками, промокодами и акциями.
            </Typography>
            <Button variant="outlined" disabled>
              В разработке
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Информационный блок */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Информация о системе
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Ваша роль
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              Администратор
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Последний вход
            </Typography>
            <Typography variant="body1">
              {new Date().toLocaleDateString('ru-RU')} в {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
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
        <Button 
          variant="contained" 
          color="error"
          onClick={handleLogout}
        >
          Выйти из системы
        </Button>
      </Box>
    </Container>
  );
};

export default AdminPage;