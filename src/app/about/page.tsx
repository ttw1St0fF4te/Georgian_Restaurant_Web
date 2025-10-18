'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function AboutPage() {
  const stats = [
    { icon: <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />, value: '15+', label: 'Лет опыта' },
    { icon: <GroupIcon sx={{ fontSize: 40, color: 'primary.main' }} />, value: '50K+', label: 'Довольных гостей' },
    { icon: <FavoriteIcon sx={{ fontSize: 40, color: 'primary.main' }} />, value: '200+', label: 'Традиционных блюд' },
    { icon: <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />, value: '5', label: 'Ресторанов' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
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
          О нас
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
        >
          Мы сохраняем и передаем аутентичные традиции грузинской кухни, 
          создавая уютную атмосферу гостеприимства для каждого гостя
        </Typography>
      </Box>

      {/* Основной контент */}
      <Box sx={{ mb: 6 }}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Наша история
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            В 2008 году мы открыли первый ресторан грузинской кухни с простой миссией - 
            познакомить людей с богатой кулинарной традицией Грузии. Начав с небольшого 
            семейного ресторана в центре Тбилиси, мы постепенно расширили нашу сеть, 
            всегда сохраняя приверженность качеству и аутентичности.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Каждое блюдо в наших ресторанах готовится по рецептам, передающимся из 
            поколения в поколение. Мы используем только свежие, натуральные ингредиенты 
            и традиционные методы приготовления, чтобы каждый посетитель мог почувствовать 
            настоящий вкус Грузии.
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            Грузинская кухня - это не просто еда, это культура гостеприимства, где каждый 
            гость считается подарком от Бога. Мы стремимся создать атмосферу, где люди 
            могут насладиться не только вкусной едой, но и теплым общением в компании 
            друзей и семьи.
          </Typography>
        </Paper>

        {/* Статистика */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Наши достижения
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
            gap: 3 
          }}>
            {stats.map((stat, index) => (
              <Card key={index} sx={{ textAlign: 'center', p: 3 }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Наши ценности */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
            Наши ценности
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 4 
          }}>
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🌟 Аутентичность
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Мы сохраняем традиционные рецепты и методы приготовления, 
                передавая истинный вкус грузинской кухни.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🤝 Гостеприимство
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Каждый гость для нас особенный. Мы создаем теплую атмосферу, 
                где каждый чувствует себя как дома.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                🌱 Качество
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Мы используем только свежие, натуральные продукты от проверенных 
                поставщиков для создания блюд высочайшего качества.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                👨‍👩‍👧‍👦 Семейные традиции
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                Наш ресторан - это продолжение семейных традиций, где рецепты 
                передаются от бабушек и дедушек.
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Команда */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ color: 'primary.main', mb: 4, textAlign: 'center' }}>
            Наша команда
          </Typography>
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, textAlign: 'center', mb: 4 }}>
            За каждым блюдом стоят талантливые повара и заботливый персонал, 
            которые вкладывают душу в свою работу, чтобы подарить вам незабываемые впечатления.
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, 
            gap: 3,
            justifyItems: 'center'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                ГМ
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Георгий Микеладзе
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Шеф-повар, основатель
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'secondary.main',
                  fontSize: '2rem'
                }}
              >
                НЧ
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Нино Чавчавадзе
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Су-шеф, специалист по выпечке
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'success.main',
                  fontSize: '2rem'
                }}
              >
                ДК
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Давид Квирикашвили
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Управляющий сети ресторанов
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}