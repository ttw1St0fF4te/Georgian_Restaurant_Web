'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CardActions,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { MenuItemResponseDto } from '@/lib/api/types';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

interface MenuItemCardProps {
  item: MenuItemResponseDto;
  onViewDetails?: (item: MenuItemResponseDto) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onViewDetails }) => {
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setSnackbarMessage('Войдите в систему для добавления товаров в корзину');
      setShowSnackbar(true);
      return;
    }

    if (user?.role !== 'user') {
      setSnackbarMessage('Только пользователи могут добавлять товары в корзину');
      setShowSnackbar(true);
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(item.item_id, 1);
      setSnackbarMessage('Товар добавлен в корзину');
      setShowSnackbar(true);
    } catch (error) {
      setSnackbarMessage('Ошибка при добавлении товара в корзину');
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
      {item.image_url && (
        <CardMedia
          component="img"
          height="200"
          image={item.image_url}
          alt={item.item_name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              lineHeight: 1.3
            }}
          >
            {item.item_name}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}
          >
            {item.item_description}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          >
            {item.price} ₾
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {item.is_vegetarian && (
            <Chip 
              label="Вегетарианское" 
              size="small" 
              color="success"
              variant="outlined"
            />
          )}
          {item.is_spicy && (
            <Chip 
              label="Острое" 
              size="small" 
              color="error"
              variant="outlined"
            />
          )}
          {item.category && (
            <Chip 
              label={item.category.category_name} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => onViewDetails?.(item)}
          sx={{ flex: 1 }}
        >
          Подробнее
        </Button>
        
        {isAuthenticated && user?.role === 'user' && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <AddShoppingCartIcon />}
            onClick={handleAddToCart}
            disabled={isLoading}
            sx={{ flex: 1 }}
          >
            {isLoading ? 'Добавляем...' : 'В корзину'}
          </Button>
        )}
      </CardActions>
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

export default MenuItemCard;