'use client';

import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';
import { OrderType } from '@/lib/api/orders';

interface CartItem {
  cart_item_id: number;
  item_id: number;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

interface Cart {
  cart_id: string;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderSummaryProps {
  cart: Cart | null;
  orderType: OrderType | '';
  deliveryFee: number;
  total: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  cart, 
  orderType, 
  deliveryFee, 
  total 
}) => {
  if (!cart) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        Ваш заказ
      </Typography>
      
      <List dense>
        {cart.items.map((item) => (
          <ListItem key={item.cart_item_id} disableGutters>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <RestaurantIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={item.item_name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {(item.unit_price || 0).toFixed(2)} ₾ × {item.quantity || 0}
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {(item.total_price || 0).toFixed(2)} ₾
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1">
          Товары ({cart.total_items || 0} шт.):
        </Typography>
        <Typography variant="body1">
          {(cart.total_amount || 0).toFixed(2)} ₾
        </Typography>
      </Box>
      
      {orderType && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">
            Тип заказа:
          </Typography>
          <Chip 
            label={orderType === 'delivery' ? 'Доставка' : 'В ресторане'} 
            size="small"
            color={orderType === 'delivery' ? 'warning' : 'success'}
          />
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body1">
          Доставка:
        </Typography>
        <Typography variant="body1" color={deliveryFee > 0 ? 'warning.main' : 'success.main'}>
          {deliveryFee > 0 ? `${deliveryFee.toFixed(2)} ₾` : 'Бесплатно'}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }}>
          К оплате:
        </Typography>
        <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold' }} color="primary">
          {(total || 0).toFixed(2)} ₾
        </Typography>
      </Box>

      {orderType === 'delivery' && deliveryFee > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          * Стоимость доставки составляет 5% от суммы заказа
        </Typography>
      )}
    </Paper>
  );
};

export default OrderSummary;