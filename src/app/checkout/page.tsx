'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { 
  useUserAddress, 
  useUserStartedReservations, 
  useCreateOrder 
} from '@/lib/api/hooks';
import { OrderType } from '@/lib/api/orders';

import DeliveryForm from '@/components/checkout/DeliveryForm';
import DineInForm from '@/components/checkout/DineInForm';
import OrderSummary from '@/components/checkout/OrderSummary';

const steps = ['Выбор типа заказа', 'Заполнение данных', 'Подтверждение'];

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { cart, loading: cartLoading, error: cartError, refreshCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [orderType, setOrderType] = useState<OrderType | ''>('');
  const [deliveryData, setDeliveryData] = useState({
    country: '',
    city: '',
    street_address: '',
    phone: '',
    saveAddress: false,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { data: userAddress } = useUserAddress();
  const { data: startedReservations = [] } = useUserStartedReservations();
  const createOrderMutation = useCreateOrder();

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
  }, [isAuthenticated, user?.user_id, refreshCart]);

  // Автозаполнение адреса из профиля пользователя
  useEffect(() => {
    if (userAddress && orderType === 'delivery') {
      setDeliveryData(prev => ({
        ...prev,
        country: userAddress.country || '',
        city: userAddress.city || '',
        street_address: userAddress.street_address || '',
      }));
    }
  }, [userAddress, orderType]);

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

  // Если корзина пуста, перенаправляем на страницу корзины
  if (!cartLoading && (!cart || cart.items.length === 0)) {
    router.push('/cart');
    return null;
  }

  const handleOrderTypeChange = (value: OrderType) => {
    setOrderType(value);
    setValidationErrors([]);
    setActiveStep(1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      router.push('/cart');
    } else {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Валидация данных перед переходом к подтверждению
      const errors = validateOrderData();
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors([]);
      setActiveStep(2);
    }
  };

  const validateOrderData = (): string[] => {
    const errors: string[] = [];

    if (orderType === 'delivery') {
      if (!deliveryData.country.trim()) {
        errors.push('Введите страну доставки');
      }
      if (!deliveryData.city.trim()) {
        errors.push('Введите город доставки');
      }
      if (!deliveryData.street_address.trim()) {
        errors.push('Введите адрес доставки');
      }
      if (!deliveryData.phone.trim()) {
        errors.push('Введите контактный телефон');
      } else {
        const phoneRegex = /^\+?[1-9]\d{8,14}$/;
        if (!phoneRegex.test(deliveryData.phone.trim())) {
          errors.push('Телефон должен быть в международном формате');
        }
      }
    } else if (orderType === 'dine_in') {
      if (startedReservations.length === 0) {
        errors.push('У вас нет активного бронирования со статусом "начато"');
      }
    }

    return errors;
  };

  const handleCreateOrder = async () => {
    try {
      const orderData: any = {
        order_type: orderType,
      };

      if (orderType === 'delivery') {
        orderData.delivery_country = deliveryData.country.trim();
        orderData.delivery_city = deliveryData.city.trim();
        orderData.delivery_street_address = deliveryData.street_address.trim();
        orderData.delivery_phone = deliveryData.phone.trim();
        orderData.should_update_user_address = deliveryData.saveAddress;
      } else if (orderType === 'dine_in' && startedReservations.length > 0) {
        orderData.reservation_id = startedReservations[0].reservation_id;
        orderData.should_update_user_address = false;
      }

      await createOrderMutation.mutateAsync(orderData);
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const calculateDeliveryFee = () => {
    if (!cart || orderType !== 'delivery') return 0;
    return Math.round(cart.total_amount * 0.05 * 100) / 100;
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.total_amount + calculateDeliveryFee();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          {activeStep === 0 ? 'Вернуться в корзину' : 'Назад'}
        </Button>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Оформление заказа
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {cartError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {cartError}
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.map((error, index) => (
              <Typography key={index} variant="body2">
                {error}
              </Typography>
            ))}
          </Alert>
        )}
      </Box>

      {cartLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Основная форма */}
          <Box sx={{ flex: { lg: 2 } }}>
            {activeStep === 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Выберите тип заказа
                </Typography>
                
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup
                    value={orderType}
                    onChange={(e) => handleOrderTypeChange(e.target.value as OrderType)}
                  >
                    <Card variant="outlined" sx={{ mb: 2, cursor: 'pointer' }}>
                      <CardContent>
                        <FormControlLabel
                          value="delivery"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocalShippingIcon sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="h6">Доставка на дом</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Доставим ваш заказ по указанному адресу. Комиссия за доставку 5%
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </CardContent>
                    </Card>

                    <Card variant="outlined">
                      <CardContent>
                        <FormControlLabel
                          value="dine_in"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <RestaurantIcon sx={{ mr: 1 }} />
                              <Box>
                                <Typography variant="h6">Заказ в ресторане</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Заказ на стол в ресторане по активному бронированию
                                </Typography>
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', m: 0 }}
                        />
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
              </Paper>
            )}

            {activeStep === 1 && orderType === 'delivery' && (
              <DeliveryForm
                data={deliveryData}
                onChange={setDeliveryData}
                onNext={handleNext}
              />
            )}

            {activeStep === 1 && orderType === 'dine_in' && (
              <DineInForm
                startedReservations={startedReservations}
                onNext={handleNext}
              />
            )}

            {activeStep === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Подтверждение заказа
                </Typography>

                <Typography variant="body1" sx={{ mb: 3 }}>
                  Тип заказа: {orderType === 'delivery' ? 'Доставка на дом' : 'Заказ в ресторане'}
                </Typography>

                {orderType === 'delivery' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Адрес доставки:
                    </Typography>
                    <Typography variant="body2">
                      {deliveryData.country}, {deliveryData.city}
                    </Typography>
                    <Typography variant="body2">
                      {deliveryData.street_address}
                    </Typography>
                    <Typography variant="body2">
                      Телефон: {deliveryData.phone}
                    </Typography>
                  </Box>
                )}

                {createOrderMutation.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {(createOrderMutation.error as any)?.message || 'Ошибка при создании заказа'}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateOrder}
                  disabled={createOrderMutation.isPending}
                  startIcon={createOrderMutation.isPending ? <CircularProgress size={20} /> : null}
                  fullWidth
                >
                  {createOrderMutation.isPending ? 'Создание заказа...' : 'Подтвердить заказ'}
                </Button>
              </Paper>
            )}
          </Box>

          {/* Сводка заказа */}
          <Box sx={{ flex: { lg: 1 } }}>
            <OrderSummary
              cart={cart}
              orderType={orderType}
              deliveryFee={calculateDeliveryFee()}
              total={calculateTotal()}
            />
          </Box>
        </Box>
      )}
    </Container>
  );
}