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
import { 
  ManageAccounts as ManagerIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarTodayIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
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



      {/* Основные функции менеджера */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => router.push('/manager/menu')}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Управление меню
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Создание, редактирование и удаление блюд
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => router.push('/manager/reservations')}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <CalendarTodayIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Создание бронирований
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Бронирование столиков для клиентов
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => router.push('/manager/reports')}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <AssessmentIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Отчетность
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Аналитика и отчеты по продажам
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ManagerPage;