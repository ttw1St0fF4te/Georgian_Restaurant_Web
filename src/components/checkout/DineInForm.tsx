'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  TableRestaurant as TableRestaurantIcon,
} from '@mui/icons-material';
import type { ReservationResponseDto } from '@/lib/api/reservations';

interface DineInFormProps {
  startedReservations: ReservationResponseDto[];
  onNext: () => void;
}

const DineInForm: React.FC<DineInFormProps> = ({ startedReservations, onNext }) => {
  const hasStartedReservation = startedReservations.length > 0;
  const reservation = startedReservations[0]; // Берем первое (по логике может быть только одно)

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Заказ в ресторане
      </Typography>

      {!hasStartedReservation ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Заказ в ресторане недоступен</strong>
            <br />
            У вас нет активного бронирования со статусом "начато". 
            Чтобы сделать заказ в ресторане, сначала создайте бронирование 
            и дождитесь его начала.
          </Typography>
        </Alert>
      ) : (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Отлично!</strong> У вас есть активное бронирование. 
              Заказ будет доставлен к вашему столику в ресторане.
            </Typography>
          </Alert>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3">
                  {reservation.restaurant_name}
                </Typography>
                <Chip
                  label="Начато"
                  color="primary"
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

              <Typography variant="caption" color="text.secondary">
                Создано: {new Date(reservation.created_at).toLocaleString('ru-RU')}
                {reservation.confirmed_at && (
                  <> • Подтверждено: {new Date(reservation.confirmed_at).toLocaleString('ru-RU')}</>
                )}
              </Typography>
            </CardContent>
          </Card>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Информация:</strong> Заказ будет передан на кухню ресторана 
              и доставлен к вашему столику. Оплата производится в ресторане. 
              Комиссия за доставку не взимается.
            </Typography>
          </Alert>
        </>
      )}

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        disabled={!hasStartedReservation}
        fullWidth
      >
        {hasStartedReservation ? 'Продолжить' : 'Недоступно'}
      </Button>
    </Paper>
  );
};

export default DineInForm;