'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AuditIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const AuditLogPage: React.FC = () => {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/admin')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary">
          <AuditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Журнал аудита
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              Раздел в разработке
            </Typography>
            <Typography variant="body2">
              Здесь будет отображаться журнал системных событий, включая:
            </Typography>
            <Box component="ul" sx={{ mt: 2, mb: 0 }}>
              <li>Вход и выход пользователей из системы</li>
              <li>Создание, изменение и удаление пользователей</li>
              <li>Изменения в меню и ценах</li>
              <li>Операции с заказами и бронированиями</li>
              <li>Изменения настроек системы</li>
              <li>Ошибки и предупреждения</li>
            </Box>
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AuditLogPage;