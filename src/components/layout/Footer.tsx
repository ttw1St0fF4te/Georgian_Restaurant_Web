'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Link,
  Divider 
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        backgroundColor: '#1B5E20',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 4 
          }}
        >
          {/* Информация о ресторане */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Грузинская Кухня
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              Аутентичные грузинские блюда, приготовленные по традиционным рецептам. 
              Окунитесь в мир настоящих вкусов Грузии!
            </Typography>
          </Box>

          {/* Контактная информация */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Контакты
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">+995 555 123 456</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" />
                <Typography variant="body2">info@georgian-cuisine.ge</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">Тбилиси, ул. Руставели, 15</Typography>
              </Box>
            </Box>
          </Box>

          {/* Навигация */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Навигация
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Link 
                href="/" 
                color="inherit" 
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                Меню
              </Link>
              <Link 
                href="/restaurants" 
                color="inherit" 
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                Рестораны
              </Link>
              <Link 
                href="/about" 
                color="inherit" 
                underline="hover"
                sx={{ fontSize: '0.875rem' }}
              >
                О нас
              </Link>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Копирайт */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Грузинская Кухня. Все права защищены.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;