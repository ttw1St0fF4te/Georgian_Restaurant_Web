'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CardActions,
} from '@mui/material';
import { MenuItemResponseDto } from '@/lib/api/types';

interface MenuItemCardProps {
  item: MenuItemResponseDto;
  onViewDetails?: (item: MenuItemResponseDto) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onViewDetails }) => {
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

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button 
          size="small" 
          variant="outlined" 
          onClick={() => onViewDetails?.(item)}
          fullWidth
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
};

export default MenuItemCard;