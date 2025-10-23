'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Event as EventIcon,
} from '@mui/icons-material';

export default function ReservationSuccessPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Paper sx={{ p: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Бронирование успешно создано!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Ваш стол успешно забронирован
        </Typography>

        <Alert severity="success" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body1" gutterBottom>
            <strong>Детали бронирования:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Информацию о бронировании вы можете найти в разделе "Мои бронирования"
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<EventIcon />}
            onClick={() => router.push('/profile/reservations')}
          >
            Мои бронирования
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
          >
            На главную
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}