'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Chip,
  Divider,
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import { useRestaurants } from '@/lib/api/hooks';
import { RestaurantFilterDto, RestaurantResponseDto } from '@/lib/api/types';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import RestaurantReviews from '@/components/reviews/RestaurantReviews';

export default function RestaurantsPage() {
  const [filters, setFilters] = useState<RestaurantFilterDto>({});
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [localCity, setLocalCity] = useState('');

  const { data: allRestaurants = [], isLoading, error } = useRestaurants({});
  
  // Локальная фильтрация для более гибкого поиска
  const restaurants = React.useMemo(() => {
    return allRestaurants.filter((restaurant: RestaurantResponseDto) => {
      const nameMatch = !localSearch || 
        restaurant.restaurant_name.toLowerCase().includes(localSearch.toLowerCase());
      
      const cityMatch = !localCity || 
        restaurant.city.toLowerCase().includes(localCity.toLowerCase());
      
      const activeMatch = filters.is_active === undefined || 
        restaurant.is_active === filters.is_active;
      
      const ratingMatch = !filters.min_rating || 
        Number(restaurant.rating) >= filters.min_rating;
      
      return nameMatch && cityMatch && activeMatch && ratingMatch;
    });
  }, [allRestaurants, localSearch, localCity, filters]);

  const handleFilterChange = (key: keyof RestaurantFilterDto, value: any) => {
    if (key === 'search') {
      setLocalSearch(value);
    } else if (key === 'city') {
      setLocalCity(value);
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value === '' ? undefined : value,
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setLocalSearch('');
    setLocalCity('');
  };

  const handleViewDetails = (restaurant: RestaurantResponseDto) => {
    setSelectedRestaurant(restaurant);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRestaurant(null);
  };

  const formatWorkingHours = (workingHours?: Record<string, string>) => {
    if (!workingHours) return null;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    
    const translateHours = (hours: string) => {
      if (!hours || hours.toLowerCase() === 'closed') return 'Закрыт';
      return hours;
    };
    
    return days.map((day, index) => ({
      day: dayNames[index],
      hours: translateHours(workingHours[day])
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localSearch) count++;
    if (localCity) count++;
    if (filters.is_active !== undefined) count++;
    if (filters.min_rating) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          Наши рестораны
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Найдите ближайший ресторан грузинской кухни в вашем городе
        </Typography>
      </Box>

      {/* Фильтры */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Фильтры поиска
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} активных`} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gap: 3, 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          mb: 3
        }}>
          {/* Поиск */}
          <TextField
            label="Поиск по названию"
            value={localSearch}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            fullWidth
          />

          {/* Город */}
          <TextField
            label="Город"
            value={localCity}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            fullWidth
          />

          {/* Минимальный рейтинг */}
          <TextField
            type="number"
            label="Мин. рейтинг"
            value={filters.min_rating || ''}
            onChange={(e) => handleFilterChange('min_rating', Number(e.target.value) || undefined)}
            inputProps={{ min: 0, max: 5, step: 0.1 }}
            fullWidth
          />

          {/* Статус */}
          <FormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.is_active !== undefined ? filters.is_active.toString() : ''}
              label="Статус"
              onChange={(e) => {
                const value = e.target.value;
                handleFilterChange('is_active', value === '' ? undefined : value === 'true');
              }}
            >
              <MenuItem value="">Все</MenuItem>
              <MenuItem value="true">Только открытые</MenuItem>
              <MenuItem value="false">Только закрытые</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {activeFiltersCount > 0 && (
          <Button variant="outlined" onClick={handleClearFilters}>
            Очистить фильтры
          </Button>
        )}
      </Paper>

      {/* Загрузка */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Ошибка */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Произошла ошибка при загрузке списка ресторанов. Попробуйте обновить страницу.
        </Alert>
      )}

      {/* Результаты */}
      {!isLoading && !error && (
        <>
          {/* Информация о результатах */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Найдено ресторанов: {restaurants.length}
            </Typography>
          </Box>

          {/* Сетка с ресторанами */}
          {restaurants.length > 0 ? (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
              gap: 3 
            }}>
              {restaurants.map((restaurant: RestaurantResponseDto) => (
                <RestaurantCard
                  key={restaurant.restaurant_id}
                  restaurant={restaurant}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <StorefrontIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Рестораны не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Попробуйте изменить параметры поиска
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Диалог с деталями ресторана */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { 
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        {selectedRestaurant && (
          <>
            <DialogTitle>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  {selectedRestaurant.restaurant_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Rating 
                    value={Number(selectedRestaurant.rating) || 0} 
                    readOnly 
                    precision={0.1}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({Number(selectedRestaurant.rating).toFixed(1) || '0.0'})
                  </Typography>
                  <Chip 
                    label={selectedRestaurant.is_active ? "Открыт" : "Закрыт"} 
                    size="small" 
                    color={selectedRestaurant.is_active ? "success" : "error"}
                    sx={{ ml: 1 }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ 
              overflowY: 'auto',
              maxHeight: 'calc(90vh - 200px)', // Учитываем высоту заголовка и действий
            }}>
              {selectedRestaurant.restaurant_description && (
                <>
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                    {selectedRestaurant.restaurant_description}
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </>
              )}

              {/* Контактная информация */}
              <Typography variant="h6" gutterBottom>
                Контактная информация
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  <LocationOnIcon fontSize="small" sx={{ mt: 0.5, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      Адрес:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRestaurant.city}, {selectedRestaurant.street_address}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Часы работы */}
              {selectedRestaurant.working_hours && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Часы работы
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {formatWorkingHours(selectedRestaurant.working_hours)?.map(({ day, hours }) => (
                      <Box 
                        key={day} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          py: 0.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="body2">{day}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: hours !== 'Закрыто' ? 'medium' : 'normal' }}>
                          {hours}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {/* Отзывы */}
              <Divider sx={{ my: 3 }} />
              <RestaurantReviews 
                restaurantId={selectedRestaurant.restaurant_id}
                restaurantName={selectedRestaurant.restaurant_name}
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDetails}>
                Закрыть
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  // Переходим на страницу бронирования с выбранным рестораном
                  window.location.href = `/reservations/create?restaurant=${selectedRestaurant.restaurant_id}`;
                }}
              >
                Забронировать стол
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}