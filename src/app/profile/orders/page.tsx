'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingBag as ShoppingBagIcon,
  LocalShipping as LocalShippingIcon,
  Restaurant as RestaurantIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUserOrders } from '@/lib/api/hooks';
import { OrderResponseDto, OrderType } from '@/lib/api/orders';

const OrdersHistoryPage: React.FC = () => {
  const router = useRouter();
  const { data: orders, isLoading, error } = useUserOrders();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderTypeInfo = (orderType: OrderType) => {
    switch (orderType) {
      case 'delivery':
        return {
          label: 'Доставка',
          icon: <LocalShippingIcon />,
          color: 'warning' as const,
        };
      case 'dine_in':
        return {
          label: 'В ресторане',
          icon: <RestaurantIcon />,
          color: 'success' as const,
        };
      default:
        return {
          label: 'Неизвестно',
          icon: <ShoppingBagIcon />,
          color: 'default' as const,
        };
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при загрузке истории заказов. Попробуйте перезагрузить страницу.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/profile')}
        >
          Назад к профилю
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок с кнопкой "Назад" */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/profile')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary">
          <ShoppingBagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          История заказов
        </Typography>
      </Box>

      {!orders || orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBagIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет заказов
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Перейдите в меню, выберите понравившиеся блюда и сделайте свой первый заказ!
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            size="large"
          >
            Перейти в меню
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {orders.map((order) => {
            const orderTypeInfo = getOrderTypeInfo(order.order_type);
            
            return (
              <Card key={order.order_id} sx={{ overflow: 'visible' }}>
                <CardContent>
                  {/* Заголовок заказа */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6">
                        Заказ #{order.order_id.split('-')[0]}
                      </Typography>
                    </Box>
                    <Chip
                      label={orderTypeInfo.label}
                      icon={orderTypeInfo.icon}
                      color={orderTypeInfo.color}
                      variant="outlined"
                    />
                  </Box>

                  {/* Информация о заказе */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Левая колонка - детали заказа */}
                    <Box sx={{ flex: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.created_at)}
                          </Typography>
                        </Box>
                        
                        {/* Адрес доставки (если есть) */}
                        {order.order_type === 'delivery' && (order.delivery_country || order.delivery_city || order.delivery_street_address) && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              <LocalShippingIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Адрес доставки
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {[order.delivery_country, order.delivery_city, order.delivery_street_address]
                                .filter(Boolean)
                                .join(', ')}
                            </Typography>
                            {order.delivery_phone && (
                              <Typography variant="body2" color="text.secondary">
                                Телефон: {order.delivery_phone}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>

                      {/* Состав заказа */}
                      {order.order_items && order.order_items.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Состав заказа:
                          </Typography>
                          <List dense>
                            {order.order_items.map((item) => (
                              <ListItem key={item.order_item_id} sx={{ px: 0 }}>
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Typography variant="body2">
                                        {item.item_name} × {item.quantity}
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {item.total_price.toFixed(2)} ₾
                                      </Typography>
                                    </Box>
                                  }
                                  secondary={
                                    <Typography variant="caption" color="text.secondary">
                                      {item.unit_price.toFixed(2)} ₾ за единицу
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>

                    {/* Правая колонка - сумма */}
                    <Box sx={{ flex: 1, minWidth: '250px' }}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Сумма заказа
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Товары:
                          </Typography>
                          <Typography variant="body2">
                            {order.subtotal.toFixed(2)} ₾
                          </Typography>
                        </Box>

                        {order.delivery_fee > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              Доставка:
                            </Typography>
                            <Typography variant="body2">
                              {order.delivery_fee.toFixed(2)} ₾
                            </Typography>
                          </Box>
                        )}

                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Итого:
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} color="primary">
                            {order.total_amount.toFixed(2)} ₾
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default OrdersHistoryPage;