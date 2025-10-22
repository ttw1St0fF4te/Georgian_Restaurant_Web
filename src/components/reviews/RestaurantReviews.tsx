import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  RateReview as ReviewIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { useRestaurantReviews } from '@/lib/api/hooks';
import { useAuth } from '@/lib/auth-context';
import { ReviewFilterDto } from '@/lib/api/types';
import ReviewCard from './ReviewCard';
import CreateReviewDialog from './CreateReviewDialog';

interface RestaurantReviewsProps {
  restaurantId: number;
  restaurantName: string;
}

export default function RestaurantReviews({ restaurantId, restaurantName }: RestaurantReviewsProps) {
  const { user, isAuthenticated } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ReviewFilterDto>({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const { 
    data: reviewsData, 
    isLoading, 
    error 
  } = useRestaurantReviews(restaurantId, filters);

  const userHasReview = reviewsData?.reviews.some(
    review => review.user_id === user?.user_id
  );

  const handleCreateReview = () => {
    setCreateDialogOpen(true);
  };

  const handleFilterChange = (key: keyof ReviewFilterDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Сбрасываем на первую страницу при изменении фильтров
    }));
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    handleFilterChange('page', value);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Ошибка при загрузке отзывов. Попробуйте обновить страницу.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Заголовок и кнопка создания отзыва */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Отзывы ({reviewsData?.total || 0})
          </Typography>
          {reviewsData && reviewsData.total > 0 && (
            <Typography variant="body2" color="text.secondary">
              Страница {reviewsData.page} из {reviewsData.totalPages}
            </Typography>
          )}
        </Box>

        {isAuthenticated && !userHasReview && (
          <Button
            variant="contained"
            startIcon={<ReviewIcon />}
            onClick={handleCreateReview}
            size="small"
          >
            Оставить отзыв
          </Button>
        )}

        {isAuthenticated && userHasReview && (
          <Chip 
            label="Вы уже оставили отзыв" 
            color="success" 
            variant="outlined"
          />
        )}
      </Box>

      {/* Фильтры */}
      {reviewsData && reviewsData.total > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Сортировка</InputLabel>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              label="Сортировка"
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <MenuItem value="created_at-DESC">Сначала новые</MenuItem>
              <MenuItem value="created_at-ASC">Сначала старые</MenuItem>
              <MenuItem value="rating-DESC">Лучшие оценки</MenuItem>
              <MenuItem value="rating-ASC">Худшие оценки</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>На странице</InputLabel>
            <Select
              value={filters.limit}
              label="На странице"
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Список отзывов */}
      {reviewsData && reviewsData.reviews.length > 0 ? (
        <Box>
          {reviewsData.reviews.map((review, index) => (
            <Box key={review.review_id}>
              <ReviewCard review={review} />
              {index < reviewsData.reviews.length - 1 && (
                <Divider sx={{ my: 2 }} />
              )}
            </Box>
          ))}

          {/* Пагинация */}
          {reviewsData.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={reviewsData.totalPages}
                page={reviewsData.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <ReviewIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Пока нет отзывов
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Будьте первым, кто оставит отзыв об этом ресторане
          </Typography>
          
          {isAuthenticated && !userHasReview && (
            <Button
              variant="contained"
              startIcon={<ReviewIcon />}
              onClick={handleCreateReview}
            >
              Оставить первый отзыв
            </Button>
          )}
        </Box>
      )}

      {/* Диалог создания отзыва */}
      {isAuthenticated && (
        <CreateReviewDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
        />
      )}
    </Box>
  );
}