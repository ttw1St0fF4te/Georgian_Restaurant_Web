'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CardActions,
  Rating,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { RestaurantResponseDto } from '@/lib/api/types';

interface RestaurantCardProps {
  restaurant: RestaurantResponseDto;
  onViewDetails?: (restaurant: RestaurantResponseDto) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewDetails }) => {
  const formatWorkingHours = (workingHours?: Record<string, string>) => {
    if (!workingHours) return 'Часы работы не указаны';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = workingHours[today];
    
    const translateHours = (hours: string) => {
      return hours.toLowerCase() === 'closed' ? 'Закрыт' : hours;
    };
    
    if (todayHours) {
      return `Сегодня: ${translateHours(todayHours)}`;
    }
    
    // Показываем первый доступный день
    const firstDay = Object.keys(workingHours)[0];
    return `${firstDay}: ${translateHours(workingHours[firstDay])}`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              lineHeight: 1.3
            }}
          >
            {restaurant.restaurant_name}
          </Typography>
          
          {restaurant.restaurant_description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4
              }}
            >
              {restaurant.restaurant_description}
            </Typography>
          )}
        </Box>

        {/* Рейтинг */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating 
            value={Number(restaurant.rating) || 0} 
            readOnly 
            precision={0.1}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            ({Number(restaurant.rating).toFixed(1) || '0.0'})
          </Typography>
        </Box>

        {/* Адрес */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <LocationOnIcon fontSize="small" sx={{ mt: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {restaurant.city}, {restaurant.street_address}
          </Typography>
        </Box>

        {/* Часы работы */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <AccessTimeIcon fontSize="small" sx={{ mt: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {formatWorkingHours(restaurant.working_hours)}
          </Typography>
        </Box>

        {/* Статус */}
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={restaurant.is_active ? "Открыт" : "Закрыт"} 
            size="small" 
            color={restaurant.is_active ? "success" : "error"}
            variant="outlined"
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => onViewDetails?.(restaurant)}
          fullWidth
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
};

export default RestaurantCard;