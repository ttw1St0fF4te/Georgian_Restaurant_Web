'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  Container 
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { label: 'Меню', path: '/' },
    { label: 'Рестораны', path: '/restaurants' },
    { label: 'О нас', path: '/about' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2E7D32' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Логотип и название */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RestaurantIcon sx={{ fontSize: 32 }} />
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => handleNavigation('/')}
            >
              Грузинская Кухня
            </Typography>
          </Box>

          {/* Навигационное меню */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                sx={{
                  fontWeight: pathname === item.path ? 'bold' : 'normal',
                  backgroundColor: pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  borderRadius: 1,
                  px: 3,
                  py: 1,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;