'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  TableRestaurant as TableRestaurantIcon
} from '@mui/icons-material';

import { useAuth } from '@/lib/auth-context';
import { useRestaurantTables, useCreateReservation, useTableAvailability } from '@/lib/api/hooks';
import { RestaurantService } from '@/lib/api/services/restaurant';
import type { Restaurant } from '@/lib/api/types';

interface TimeSlot {
  start: string;
  end: string;
}

// Вспомогательная функция для добавления часов к времени
const addHoursToTime = (time: string, hours: number): string => {
  const [hoursStr, minutesStr] = time.split(':');
  const totalMinutes = parseInt(hoursStr) * 60 + parseInt(minutesStr) + hours * 60;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
};

export default function CreateReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant') || searchParams.get('restaurant_id');
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [duration, setDuration] = useState(2);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [phoneError, setPhoneError] = useState<string>('');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  
  const { data: tables = [], isLoading: tablesLoading } = useRestaurantTables(
    restaurantId ? Number(restaurantId) : 0
  );

  const { data: availability } = useTableAvailability(
    restaurantId ? Number(restaurantId) : 0,
    selectedTable || 0,
    selectedDate
  );

  const createReservationMutation = useCreateReservation();

  // Загружаем информацию о ресторане
  useEffect(() => {
    if (restaurantId) {
      RestaurantService.getRestaurantById(Number(restaurantId))
        .then(setRestaurant)
        .catch(console.error);
    }
  }, [restaurantId]);  // Проверяем, что выбранный столик подходит по количеству гостей
  useEffect(() => {
    if (selectedTable && tables.length > 0) {
      const selectedTableData = tables.find((table: any) => table.table_id === selectedTable);
      if (selectedTableData && selectedTableData.seats_count < guestsCount) {
        // Выбранный столик больше не подходит по количеству гостей - сбрасываем
        setSelectedTable(null);
        setSelectedTimeSlot(null);
      }
    }
  }, [selectedTable, tables, guestsCount]);

  // Функция валидации номера телефона
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) {
      return 'Введите контактный телефон';
    }
    
    const phoneValue = phone.trim();
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    
    if (!phoneRegex.test(phoneValue)) {
      return 'Телефон должен быть в международном формате, например +79161234567';
    }
    
    return '';
  };

  // Обработчик изменения номера телефона
  const handlePhoneChange = (value: string) => {
    // Разрешаем только цифры, плюс в начале и ограничиваем длину
    const cleanValue = value.replace(/[^\d+]/g, '');
    
    // Проверяем, что плюс только в начале
    let formattedValue = cleanValue;
    if (cleanValue.includes('+')) {
      const firstPlusIndex = cleanValue.indexOf('+');
      if (firstPlusIndex === 0) {
        // Убираем все остальные плюсы кроме первого
        formattedValue = '+' + cleanValue.slice(1).replace(/\+/g, '');
      } else {
        // Убираем все плюсы если они не в начале
        formattedValue = cleanValue.replace(/\+/g, '');
      }
    }
    
    // Ограничиваем длину (максимум 15 символов: + и 14 цифр)
    if (formattedValue.length <= 15) {
      setContactPhone(formattedValue);
    }
    
    // Очищаем ошибку при изменении
    if (phoneError) {
      setPhoneError('');
    }
  };

  // Функция для проверки рабочих часов ресторана на конкретный день
  const getRestaurantWorkingHours = (date: string): { isOpen: boolean; openTime?: string; closeTime?: string; message?: string } => {
    if (!restaurant?.working_hours) {
      return { isOpen: false, message: 'Информация о рабочих часах недоступна' };
    }

    const selectedDay = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[selectedDay.getDay()];
    
    const dayHours = restaurant.working_hours[dayName];
    
    if (!dayHours || dayHours === 'closed') {
      const russianDayNames = {
        monday: 'понедельник',
        tuesday: 'вторник', 
        wednesday: 'среду',
        thursday: 'четверг',
        friday: 'пятницу',
        saturday: 'субботу',
        sunday: 'воскресенье'
      };
      return { 
        isOpen: false, 
        message: `Ресторан закрыт в ${russianDayNames[dayName as keyof typeof russianDayNames]}` 
      };
    }

    const [openTime, closeTime] = dayHours.split('-');
    return { isOpen: true, openTime, closeTime };
  };

  // Генерируем доступные временные слоты с учетом рабочих часов ресторана
  useEffect(() => {
    if (duration && availability && selectedDate && restaurant) {
      const workingHours = getRestaurantWorkingHours(selectedDate);
      
      if (!workingHours.isOpen) {
        setAvailableTimeSlots([]);
        setSelectedTimeSlot(null);
        return;
      }

      const slots: TimeSlot[] = [];
      
      // Парсим рабочие часы
      const openHour = parseInt(workingHours.openTime!.split(':')[0]);
      const closeHour = parseInt(workingHours.closeTime!.split(':')[0]);
      
      // Получаем текущее время по Москве
      const now = new Date();
      const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
      const currentDate = moscowTime.toISOString().split('T')[0];
      const currentHour = moscowTime.getHours();
      const currentMinute = moscowTime.getMinutes();
      
      // Определяем минимальный час для бронирования
      let startHour = openHour;
      if (selectedDate === currentDate) {
        // Если сегодня, то можно бронировать только со следующего часа
        const minHour = currentMinute > 0 ? currentHour + 2 : currentHour + 1;
        startHour = Math.max(openHour, minHour);
      }
      
      // Генерируем слоты каждый час в рабочее время
      for (let hour = startHour; hour <= closeHour - duration; hour++) {
        const start = `${hour.toString().padStart(2, '0')}:00`;
        const end = `${(hour + duration).toString().padStart(2, '0')}:00`;
        
        // Проверяем, что время не пересекается с существующими бронированиями
        const startTime = new Date(`${selectedDate}T${start}`);
        const endTime = new Date(`${selectedDate}T${end}`);
        
        const isAvailable = !availability.reservations.some((booking: any) => {
          // Создаем полные даты для бронирования
          const bookingStart = new Date(`${booking.reservation_date}T${booking.reservation_time}`);
          const bookingEndTime = addHoursToTime(booking.reservation_time, booking.duration_hours);
          const bookingEnd = new Date(`${booking.reservation_date}T${bookingEndTime}`);
          
          return (
            (startTime >= bookingStart && startTime < bookingEnd) ||
            (endTime > bookingStart && endTime <= bookingEnd) ||
            (startTime <= bookingStart && endTime >= bookingEnd)
          );
        });
        
        if (isAvailable) {
          slots.push({ start, end });
        }
      }
      
      setAvailableTimeSlots(slots);
      setSelectedTimeSlot(null);
    }
  }, [duration, availability, selectedDate, restaurant]);

    const handleCreateReservation = async () => {
    if (!selectedTable || !selectedTimeSlot || !selectedDate || !restaurantId) {
      return;
    }

    // Валидируем номер телефона
    const phoneValidationError = validatePhone(contactPhone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }

    try {
      await createReservationMutation.mutateAsync({
        restaurant_id: Number(restaurantId),
        table_id: selectedTable,
        reservation_date: selectedDate,
        reservation_time: selectedTimeSlot.start,
        duration_hours: duration,
        guests_count: guestsCount,
        contact_phone: contactPhone.trim()
      });

      router.push('/reservations/success');
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Вход в систему
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Для создания бронирования необходимо войти в систему
        </Typography>
        <Button variant="contained" onClick={() => router.push('/auth/login')}>
          Войти
        </Button>
      </Container>
    );
  }

  // Генерируем минимальную и максимальную дату для input
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Создание бронирования
      </Typography>

      <Paper sx={{ p: 3 }}>
        {/* Информация о ресторане */}
        {restaurant && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Ресторан: {restaurant.restaurant_name}
            </Typography>
            
            {/* Показываем информацию о рабочих часах на выбранную дату */}
            {selectedDate && (() => {
              const workingHours = getRestaurantWorkingHours(selectedDate);
              const now = new Date();
              const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
              const currentDate = moscowTime.toISOString().split('T')[0];
              const currentTime = `${moscowTime.getHours().toString().padStart(2, '0')}:${moscowTime.getMinutes().toString().padStart(2, '0')}`;
              
              return (
                <Typography variant="body2" color="text.secondary">
                  Режим работы на выбранную дату: {workingHours.isOpen 
                    ? `${workingHours.openTime} - ${workingHours.closeTime}` 
                    : 'Закрыто'
                  }
                  {selectedDate === currentDate && (
                    <span style={{ marginLeft: 8 }}>
                      (Текущее время: {currentTime} МСК)
                    </span>
                  )}
                </Typography>
              );
            })()}
          </Box>
        )}

        {/* Выбор даты */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Выберите дату и количество гостей
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <TextField
              type="date"
              label="Дата бронирования"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              inputProps={{ min: today, max: maxDateStr }}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ minWidth: 200 }}
            />
            
            <FormControl required sx={{ minWidth: 150 }}>
              <InputLabel>Количество гостей</InputLabel>
              <Select
                value={guestsCount}
                label="Количество гостей"
                onChange={(e) => {
                  const newGuestsCount = Number(e.target.value);
                  setGuestsCount(newGuestsCount);
                  
                  // Проверяем, нужно ли сбросить выбранный столик
                  if (selectedTable && tables.length > 0) {
                    const selectedTableData = tables.find((table: any) => table.table_id === selectedTable);
                    if (selectedTableData && selectedTableData.seats_count < newGuestsCount) {
                      setSelectedTable(null);
                      setSelectedTimeSlot(null);
                    }
                  }
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Выбор столика */}
        {selectedDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <TableRestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Выберите столик
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              {tables
                .filter((table: any) => table.seats_count >= guestsCount)
                .map((table: any) => (
                <Card 
                  key={table.table_id}
                  variant={selectedTable === table.table_id ? "outlined" : "elevation"}
                  sx={{ 
                    cursor: 'pointer',
                    minWidth: 200,
                    border: selectedTable === table.table_id ? 2 : 0,
                    borderColor: selectedTable === table.table_id ? 'primary.main' : 'transparent',
                  }}
                  onClick={() => setSelectedTable(table.table_id)}
                >
                  <CardContent>
                    <Typography variant="h6">
                      Столик №{table.table_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Вместимость: {table.seats_count} человек
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {tables.filter((table: any) => table.seats_count >= guestsCount).length === 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Нет столиков, вмещающих {guestsCount} человек(а). Попробуйте изменить количество гостей.
              </Alert>
            )}
          </Box>
        )}

        {/* Выбор времени */}
        {selectedTable && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Выберите время и продолжительность
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <FormControl required sx={{ minWidth: 200 }}>
                <InputLabel>Продолжительность (часы)</InputLabel>
                <Select
                  value={duration}
                  label="Продолжительность (часы)"
                  onChange={(e) => {
                    setDuration(Number(e.target.value));
                    setSelectedTimeSlot(null);
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <MenuItem key={num} value={num}>{num} час(а)</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Доступные временные слоты:
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {availableTimeSlots.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedTimeSlot?.start === slot.start ? "contained" : "outlined"}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  {slot.start} - {slot.end}
                </Button>
              ))}
            </Box>

            {selectedDate && restaurant && (() => {
              const workingHours = getRestaurantWorkingHours(selectedDate);
              const now = new Date();
              const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
              const currentDate = moscowTime.toISOString().split('T')[0];
              const currentTime = `${moscowTime.getHours().toString().padStart(2, '0')}:${moscowTime.getMinutes().toString().padStart(2, '0')}`;
              
              if (!workingHours.isOpen) {
                return (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {workingHours.message}
                  </Alert>
                );
              }
              
              if (availableTimeSlots.length === 0 && workingHours.isOpen) {
                if (selectedDate === currentDate) {
                  return (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      На сегодня ({currentDate}) нет доступных временных слотов для столика №{tables.find((t: any) => t.table_id === selectedTable)?.table_number}.
                      Текущее время: {currentTime} (Москва). Попробуйте выбрать завтрашнюю дату или другой столик.
                    </Alert>
                  );
                } else {
                  return (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      На выбранную дату нет доступных временных слотов для столика №{tables.find((t: any) => t.table_id === selectedTable)?.table_number}.
                      Попробуйте выбрать другой столик или дату.
                    </Alert>
                  );
                }
              }
              return null;
            })()}
          </Box>
        )}

        {/* Подтверждение */}
        {selectedTimeSlot && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Подтверждение бронирования
            </Typography>

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" gutterBottom>
                <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ресторан: {restaurant?.restaurant_name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Дата: {selectedDate}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Время: {selectedTimeSlot?.start} - {selectedTimeSlot?.end}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Гостей: {guestsCount}
              </Typography>
              <Typography variant="body2">
                <TableRestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Столик: №{tables.find((t: any) => t.table_id === selectedTable)?.table_number}
              </Typography>
            </Paper>

            <TextField
              fullWidth
              label="Контактный телефон"
              type="tel"
              value={contactPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => {
                if (contactPhone.trim()) {
                  const error = validatePhone(contactPhone);
                  setPhoneError(error);
                }
              }}
              required
              error={!!phoneError}
              helperText={phoneError || 'Введите номер в международном формате, например +79161234567'}
              placeholder="+79161234567"
              sx={{ mb: 2 }}
            />

            {createReservationMutation.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {(createReservationMutation.error as any)?.message || 
                 'Произошла ошибка при создании бронирования'}
              </Alert>
            )}

            <Button
              variant="contained"
              size="large"
              onClick={handleCreateReservation}
              disabled={!contactPhone.trim() || !!phoneError || createReservationMutation.isPending}
              startIcon={createReservationMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {createReservationMutation.isPending ? 'Создание...' : 'Создать бронирование'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}