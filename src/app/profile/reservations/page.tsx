'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  TableRestaurant as TableRestaurantIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

import { useAuth } from '@/lib/auth-context';
import { 
  useUserReservations, 
  useUserActiveReservations, 
  useConfirmReservation, 
  useCancelReservation 
} from '@/lib/api/hooks';
import type { ReservationResponseDto } from '@/lib/api/reservations';

// Цвета для разных статусов
const getStatusColor = (status: string) => {
  switch (status) {
    case 'unconfirmed':
      return 'warning';
    case 'confirmed':
      return 'success';
    case 'started':
      return 'primary';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

// Перевод статусов
const getStatusText = (status: string) => {
  switch (status) {
    case 'unconfirmed':
      return 'Неподтвержденное';
    case 'confirmed':
      return 'Подтверждено';
    case 'started':
      return 'Начато';
    case 'completed':
      return 'Завершено';
    case 'cancelled':
      return 'Отменено';
    default:
      return status;
  }
};

interface ReservationCardProps {
  reservation: ReservationResponseDto;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  isConfirming: boolean;
  isCancelling: boolean;
}

const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onConfirm,
  onCancel,
  isConfirming,
  isCancelling
}) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="h3">
            {reservation.restaurant_name}
          </Typography>
          <Chip
            label={getStatusText(reservation.reservation_status)}
            color={getStatusColor(reservation.reservation_status) as any}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1, fontSize: 16 }} />
              {reservation.reservation_date}
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, fontSize: 16 }} />
              {reservation.reservation_time} ({reservation.duration_hours} ч.)
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
              {reservation.guests_count} человек(а)
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TableRestaurantIcon sx={{ mr: 1, fontSize: 16 }} />
              Столик №{reservation.table_number}
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Создано: {new Date(reservation.created_at).toLocaleString('ru-RU')}
          {reservation.confirmed_at && (
            <> • Подтверждено: {new Date(reservation.confirmed_at).toLocaleString('ru-RU')}</>
          )}
        </Typography>

        {/* Кнопки действий в зависимости от статуса */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {reservation.reservation_status === 'unconfirmed' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={isConfirming ? <CircularProgress size={16} /> : <CheckIcon />}
                onClick={() => onConfirm(reservation.reservation_id)}
                disabled={isConfirming || isCancelling}
                size="small"
              >
                Подтвердить
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={isCancelling ? <CircularProgress size={16} /> : <CancelIcon />}
                onClick={() => onCancel(reservation.reservation_id)}
                disabled={isConfirming || isCancelling}
                size="small"
              >
                Отменить
              </Button>
            </>
          )}

          {reservation.reservation_status === 'started' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<ShoppingCartIcon />}
              size="small"
              disabled // Пока без функционала
            >
              Сделать заказ
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default function UserReservationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const { data: allReservations = [], isLoading: allLoading } = useUserReservations();
  const { data: activeReservations = [], isLoading: activeLoading } = useUserActiveReservations();
  const confirmMutation = useConfirmReservation();
  const cancelMutation = useCancelReservation();

  const handleConfirm = async (reservationId: string) => {
    try {
      await confirmMutation.mutateAsync(reservationId);
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
    }
  };

  const handleCancel = async (reservationId: string) => {
    try {
      await cancelMutation.mutateAsync(reservationId);
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
    }
  };

  // Фильтрация неактивных бронирований
  const inactiveReservations = allReservations.filter(r => 
    ['completed', 'cancelled'].includes(r.reservation_status)
  );

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Доступ запрещен
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Для просмотра бронирований необходимо войти в систему
        </Typography>
        <Button variant="contained" onClick={() => router.push('/auth/login')}>
          Войти
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/profile')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          Мои бронирования
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Активные (${activeReservations.length})`} />
          <Tab label={`Все (${allReservations.length})`} />
          <Tab label={`История (${inactiveReservations.length})`} />
        </Tabs>
      </Paper>

      {/* Отображение ошибок */}
      {(confirmMutation.error || cancelMutation.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(confirmMutation.error as any)?.message || 
           (cancelMutation.error as any)?.message ||
           'Произошла ошибка при выполнении операции'}
        </Alert>
      )}

      {/* Содержимое табов */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Активные бронирования
          </Typography>
          
          {activeLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : activeReservations.length === 0 ? (
            <Alert severity="info">
              У вас нет активных бронирований
            </Alert>
          ) : (
            activeReservations.map((reservation) => (
              <ReservationCard
                key={reservation.reservation_id}
                reservation={reservation}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isConfirming={confirmMutation.isPending && confirmMutation.variables === reservation.reservation_id}
                isCancelling={cancelMutation.isPending && cancelMutation.variables === reservation.reservation_id}
              />
            ))
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Все бронирования
          </Typography>
          
          {allLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : allReservations.length === 0 ? (
            <Alert severity="info">
              У вас пока нет бронирований
            </Alert>
          ) : (
            allReservations.map((reservation) => (
              <ReservationCard
                key={reservation.reservation_id}
                reservation={reservation}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isConfirming={confirmMutation.isPending && confirmMutation.variables === reservation.reservation_id}
                isCancelling={cancelMutation.isPending && cancelMutation.variables === reservation.reservation_id}
              />
            ))
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            История бронирований
          </Typography>
          
          {allLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : inactiveReservations.length === 0 ? (
            <Alert severity="info">
              У вас нет завершенных или отмененных бронирований
            </Alert>
          ) : (
            inactiveReservations.map((reservation) => (
              <ReservationCard
                key={reservation.reservation_id}
                reservation={reservation}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isConfirming={false}
                isCancelling={false}
              />
            ))
          )}
        </Box>
      )}
    </Container>
  );
}