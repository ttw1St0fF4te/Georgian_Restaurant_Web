'use client';

import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  Restaurant as RestaurantIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  TableRestaurant as TableRestaurantIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useUserActiveReservations, useConfirmReservation, useCancelReservation } from '@/lib/api/hooks';
import type { ReservationResponseDto } from '@/lib/api/reservations';

// Цвета для активных статусов (только те, что отображаются в header)
const getStatusColor = (status: string) => {
  switch (status) {
    case 'unconfirmed':
      return 'warning'; // Желтый - требует действия
    case 'confirmed':
      return 'success'; // Зеленый - подтверждено
    case 'started':
      return 'primary'; // Синий - можно заказывать
    default:
      return 'default';
  }
};

// Перевод активных статусов
const getStatusText = (status: string) => {
  switch (status) {
    case 'unconfirmed':
      return 'Неподтвержденное';
    case 'confirmed':
      return 'Подтверждено';
    case 'started':
      return 'Начато';
    default:
      return status;
  }
};

const ActiveReservationBadge: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: activeReservations = [], isLoading } = useUserActiveReservations();
  const confirmMutation = useConfirmReservation();
  const cancelMutation = useCancelReservation();

  // Показываем только первое активное бронирование (по бизнес-логике может быть только одно)
  // Фильтруем только действительно активные статусы для отображения в header
  const displayableReservation = activeReservations.find(reservation => 
    ['unconfirmed', 'confirmed', 'started'].includes(reservation.reservation_status)
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConfirm = async () => {
    if (displayableReservation) {
      try {
        await confirmMutation.mutateAsync(displayableReservation.reservation_id);
        handleClose();
      } catch (error) {
        console.error('Failed to confirm reservation:', error);
      }
    }
  };

  const handleCancel = async () => {
    if (displayableReservation) {
      try {
        await cancelMutation.mutateAsync(displayableReservation.reservation_id);
        handleClose();
      } catch (error) {
        console.error('Failed to cancel reservation:', error);
      }
    }
  };

  // Если нет активных бронирований для отображения, не показываем ничего
  if (isLoading || !displayableReservation) {
    return null;
  }

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <Badge
          color={getStatusColor(displayableReservation.reservation_status) as any}
          variant="dot"
        >
          <EventIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Активное бронирование
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip
              label={getStatusText(displayableReservation.reservation_status)}
              color={getStatusColor(displayableReservation.reservation_status) as any}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RestaurantIcon sx={{ mr: 1, fontSize: 16 }} />
              {displayableReservation.restaurant_name}
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1, fontSize: 16 }} />
              {displayableReservation.reservation_date}
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon sx={{ mr: 1, fontSize: 16 }} />
              {displayableReservation.reservation_time} ({displayableReservation.duration_hours} ч.)
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1, fontSize: 16 }} />
              {displayableReservation.guests_count} человек(а)
            </Typography>
            
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              <TableRestaurantIcon sx={{ mr: 1, fontSize: 16 }} />
              Столик №{displayableReservation.table_number}
            </Typography>
          </Box>

          {/* Отображение ошибок */}
          {(confirmMutation.error || cancelMutation.error) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(confirmMutation.error as any)?.message || 
               (cancelMutation.error as any)?.message ||
               'Произошла ошибка'}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Кнопки действий в зависимости от статуса */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {displayableReservation.reservation_status === 'unconfirmed' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={confirmMutation.isPending ? <CircularProgress size={16} /> : <CheckIcon />}
                  onClick={handleConfirm}
                  disabled={confirmMutation.isPending || cancelMutation.isPending}
                  size="small"
                >
                  Подтвердить
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={cancelMutation.isPending ? <CircularProgress size={16} /> : <CancelIcon />}
                  onClick={handleCancel}
                  disabled={confirmMutation.isPending || cancelMutation.isPending}
                  size="small"
                >
                  Отменить
                </Button>
              </>
            )}

            {displayableReservation.reservation_status === 'started' && (
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

            {displayableReservation.reservation_status === 'confirmed' && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Бронирование подтверждено
              </Typography>
            )}
          </Box>
        </Paper>
      </Popover>
    </>
  );
};

export default ActiveReservationBadge;