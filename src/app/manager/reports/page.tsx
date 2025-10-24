'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const ReportsPage: React.FC = () => {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/manager')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary">
          <ReportsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Отчетность
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              Раздел в разработке
            </Typography>
            <Typography variant="body2">
              Здесь будут отчеты по продажам, популярным блюдам, бронированиям и другой аналитике.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReportsPage;