'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { CartItem } from '@/lib/api/cart';
import { useCart } from '@/lib/cart-context';

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateCartItem, removeFromCart } = useCart();
  const [localLoading, setLocalLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > 10) return;

    setLocalLoading(true);
    try {
      if (newQuantity === 0) {
        await removeFromCart(item.item_id);
        setSnackbarMessage('Товар удален из корзины');
      } else {
        await updateCartItem(item.item_id, newQuantity);
        setSnackbarMessage('Количество обновлено');
      }
      setShowSnackbar(true);
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Ошибка при обновлении количества');
      setShowSnackbar(true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRemoveItem = async () => {
    setLocalLoading(true);
    try {
      await removeFromCart(item.item_id);
      setSnackbarMessage('Товар удален из корзины');
      setShowSnackbar(true);
    } catch (error: any) {
      setSnackbarMessage(error.message || 'Ошибка при удалении товара');
      setShowSnackbar(true);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ display: 'flex', position: 'relative' }}>
        {/* Изображение */}
        {item.image_url && (
          <CardMedia
            component="img"
            sx={{ width: 120, height: 120, objectFit: 'cover' }}
            image={item.image_url}
            alt={item.item_name}
          />
        )}

        {/* Контент */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
              {item.item_name}
            </Typography>
            
            <IconButton
              onClick={handleRemoveItem}
              disabled={localLoading}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {item.item_description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
            {item.is_vegetarian && (
              <Chip label="Вегетарианское" size="small" color="success" variant="outlined" />
            )}
            {item.is_spicy && (
              <Chip label="Острое" size="small" color="error" variant="outlined" />
            )}
            <Chip label={item.category_name} size="small" variant="outlined" />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto'
          }}>
            {/* Управление количеством */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={localLoading || item.quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  minWidth: 40, 
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                {localLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  item.quantity
                )}
              </Typography>
              
              <IconButton
                size="small"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={localLoading || item.quantity >= 10}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Цена */}
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                {item.unit_price.toFixed(2)} ₾ за шт.
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                {item.total_price.toFixed(2)} ₾
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarMessage.includes('Ошибка') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartItemCard;