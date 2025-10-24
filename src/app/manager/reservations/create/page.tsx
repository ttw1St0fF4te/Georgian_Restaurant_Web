'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '@/lib/auth-context';
import { useRestaurants } from '@/lib/api/hooks';
import ManagerRestaurantCard from '@/components/restaurant/ManagerRestaurantCard';

const CreateReservationPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  // Запросы данных
  const { data: restaurants, isLoading: restaurantsLoading, error: restaurantsError } = useRestaurants();

  // Проверка доступа
  React.useEffect(() => {
    if (user && user.role !== 'manager' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleRestaurantSelect = (restaurantId: number) => {
    router.push(`/manager/reservations/create/${restaurantId}`);
  };

  if (restaurantsLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (restaurantsError) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка при загрузке ресторанов: {restaurantsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/manager/reservations')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Создание бронирования - выберите ресторан
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 3 
      }}>
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          restaurants.map((restaurant: any) => (
            <ManagerRestaurantCard 
              key={restaurant.restaurant_id}
              restaurant={restaurant} 
              onSelectRestaurant={handleRestaurantSelect}
            />
          ))
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, gridColumn: '1 / -1' }}>
            {restaurantsLoading ? (
              <CircularProgress size={24} />
            ) : (
              <>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Рестораны не найдены
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  В системе пока нет ресторанов для бронирования
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CreateReservationPage;