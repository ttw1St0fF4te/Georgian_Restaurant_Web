import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { CreateReviewDto } from '@/lib/api/types';
import { useCreateReview } from '@/lib/api/hooks';

interface CreateReviewDialogProps {
  open: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
}

export default function CreateReviewDialog({ 
  open, 
  onClose, 
  restaurantId, 
  restaurantName 
}: CreateReviewDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const createReviewMutation = useCreateReview();

  const handleRatingChange = (event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue || 0);
    setError(null);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReviewText(event.target.value);
  };

  const handleSubmit = async () => {
    // Валидация
    if (rating === 0) {
      setError('Пожалуйста, выберите оценку от 1 до 5 звезд');
      return;
    }

    if (reviewText.trim().length > 0 && reviewText.trim().length < 10) {
      setError('Текст отзыва должен содержать минимум 10 символов');
      return;
    }

    const reviewData: CreateReviewDto = {
      restaurant_id: restaurantId,
      rating,
      review_text: reviewText.trim() || undefined,
    };

    try {
      await createReviewMutation.mutateAsync(reviewData);
      handleClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Ошибка при создании отзыва');
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Оставить отзыв
        <Typography variant="body2" color="text.secondary">
          {restaurantName}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Рейтинг */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Ваша оценка *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={rating}
              onChange={handleRatingChange}
              size="large"
              precision={1}
            />
            <Typography variant="body2" color="text.secondary">
              {rating > 0 ? `${rating}/5` : 'Выберите оценку'}
            </Typography>
          </Box>
        </Box>

        {/* Текст отзыва */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Ваш отзыв"
            placeholder="Расскажите о своем опыте посещения ресторана..."
            multiline
            rows={4}
            value={reviewText}
            onChange={handleTextChange}
            fullWidth
            helperText="Минимум 10 символов (необязательно)"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={rating === 0 || createReviewMutation.isPending}
        >
          {createReviewMutation.isPending ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}