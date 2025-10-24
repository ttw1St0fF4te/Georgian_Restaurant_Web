'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ReservationsManagementPage: React.FC = () => {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/manager')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary">
          <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Создание бронирований
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              Раздел в разработке
            </Typography>
            <Typography variant="body2">
              Здесь будет функционал для создания и управления бронированиями столиков для клиентов.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReservationsManagementPage;