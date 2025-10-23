'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import CartItemCard from '@/components/cart/CartItemCard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { cart, loading, error, clearCart, refreshCart } = useCart();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Проверяем авторизацию
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && user?.role !== 'user') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Загружаем корзину при монтировании компонента
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      refreshCart();
    }
  }, [isAuthenticated, user?.user_id]);

  const handleClearCart = async () => {
    try {
      await clearCart();
      setClearDialogOpen(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Показываем загрузку пока проверяется авторизация
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Если пользователь не авторизован или не является клиентом, не показываем контент
  if (!isAuthenticated || user?.role !== 'user') {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Моя корзина
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : !cart || cart.items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Ваша корзина пуста
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Добавьте товары из меню, чтобы они появились здесь
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/')}
            sx={{ px: 4 }}
          >
            Перейти к меню
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Товары в корзине */}
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                  Товары в корзине ({cart.total_items} шт.)
                </Typography>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setClearDialogOpen(true)}
                  size="small"
                >
                  Очистить корзину
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {cart.items.map((item) => (
                  <CartItemCard key={item.cart_item_id} item={item} />
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Итоговая сумма */}
          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                Итого
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  Товары ({cart.total_items} шт.):
                </Typography>
                <Typography variant="body1">
                  {cart.total_amount.toFixed(2)} ₾
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">
                  Доставка:
                </Typography>
                <Typography variant="body1" color="success.main">
                  5% при доставке на дом
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }}>
                  К оплате:
                </Typography>
                <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }} color="primary">
                  {cart.total_amount.toFixed(2)} ₾
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ py: 1.5 }}
                onClick={() => router.push('/checkout')}
              >
                Оформить заказ
              </Button>
              
              <Button
                variant="text"
                fullWidth
                sx={{ mt: 1 }}
                onClick={() => router.push('/')}
              >
                Продолжить покупки
              </Button>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Диалог подтверждения очистки корзины */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Очистить корзину?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить все товары из корзины? 
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Отмена
          </Button>
          <Button 
            onClick={handleClearCart} 
            color="error"
            variant="contained"
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CartPage;