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
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Paper sx={{ p: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Заказ успешно создан!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Ваш заказ принят и передан в обработку
        </Typography>

        <Alert severity="success" sx={{ mb: 4, textAlign: 'left' }}>
          <Typography variant="body1" gutterBottom>
            <strong>Что дальше:</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Информацию о заказе и его статусе вы можете отслеживать в разделе "Мои заказы". 
            Мы уведомим вас о готовности заказа.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => router.push('/orders')}
          >
            Мои заказы
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ShoppingCartIcon />}
            onClick={() => router.push('/')}
          >
            Сделать ещё заказ
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