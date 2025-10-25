'use client';

import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const AdminDashboard: React.FC = () => {
  const router = useRouter();

  const adminPages = [
    {
      title: 'Управление пользователями',
      description: 'Просмотр, добавление, редактирование и удаление пользователей',
      icon: PeopleIcon,
      path: '/admin/users',
      color: '#2196f3',
    },
    {
      title: 'Журнал аудита',
      description: 'Просмотр системных событий и действий пользователей',
      icon: HistoryIcon,
      path: '/admin/audit',
      color: '#ff9800',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary">
        Панель администратора
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Добро пожаловать в административную панель. Выберите нужный раздел для управления системой.
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mt: 2 }}>
        {adminPages.map((page) => {
          const IconComponent = page.icon;
          
          return (
            <Box key={page.path} sx={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleNavigation(page.path)}
                  sx={{ height: '100%', p: 3 }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: page.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                      }}
                    >
                      <IconComponent sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {page.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {page.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Container>
  );
};

export default AdminDashboard;