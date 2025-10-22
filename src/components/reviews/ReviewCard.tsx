import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { ReviewResponseDto } from '@/lib/api/types';
import { useAuth } from '@/lib/auth-context';
import { useDeleteReview } from '@/lib/api/hooks';

interface ReviewCardProps {
  review: ReviewResponseDto;
  showRestaurantName?: boolean;
}

export default function ReviewCard({ review, showRestaurantName = false }: ReviewCardProps) {
  const { user } = useAuth();
  const deleteReviewMutation = useDeleteReview();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const isMyReview = user?.user_id === review.user_id;

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReviewMutation.mutateAsync(review.review_id);
      console.log('Отзыв успешно удален');
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error('Ошибка при удалении отзыва:', error.response?.data?.message || error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAuthorName = () => {
    if (review.user) {
      return `${review.user.first_name} ${review.user.last_name}`;
    }
    return 'Анонимный пользователь';
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2,
          position: 'relative',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent>
          {/* Заголовок с рейтингом и датой */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={review.rating} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {review.rating}/5
                </Typography>
                {isMyReview && (
                  <Chip 
                    label="Мой отзыв" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              
              {showRestaurantName && review.restaurant && (
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  {review.restaurant.restaurant_name}
                </Typography>
              )}
            </Box>

            {/* Кнопка удаления для своих отзывов */}
            {isMyReview && (
              <IconButton
                size="small"
                color="error"
                onClick={handleDeleteClick}
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Текст отзыва */}
          {review.review_text && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2,
                lineHeight: 1.6,
                fontSize: '0.95rem',
              }}
            >
              {review.review_text}
            </Typography>
          )}

          {/* Автор и дата */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {getAuthorName()}
              </Typography>
            </Box>
            
            <Typography variant="caption" color="text.secondary">
              {formatDate(review.created_at)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Удалить отзыв
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteReviewMutation.isPending}
          >
            {deleteReviewMutation.isPending ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}