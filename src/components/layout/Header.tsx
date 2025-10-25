'use client';

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button,
  Container,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Badge, IconButton } from '@mui/material';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import ActiveReservationBadge from '@/components/reservations/ActiveReservationBadge';

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Навигационные элементы в зависимости от статуса авторизации
  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Меню', path: '/' },
      { label: 'Рестораны', path: '/restaurants' },
      { label: 'О нас', path: '/about' },
    ];

    if (!isAuthenticated) {
      return [
        ...baseItems,
        { label: 'Вход', path: '/auth/login' },
      ];
    }

    // Для менеджера - специальные пункты навигации
    if (user?.role === 'manager') {
      return [
        { label: 'Управление меню', path: '/manager/menu' },
        { label: 'Создание бронирований', path: '/manager/reservations' },
        { label: 'Отчетность', path: '/manager/reports' },
      ];
    }

    // Для админа - специальные пункты навигации
    if (user?.role === 'admin') {
      return [
        { label: 'Управление пользователями', path: '/admin/users' },
        { label: 'Журнал аудита', path: '/admin/audit' },
      ];
    }

    // Для авторизованных пользователей - добавляем пункты в зависимости от роли
    if (user?.role === 'user') {
      return baseItems; // Профиль будет в выпадающем меню
    }

    return baseItems; // Для admin тоже базовые пункты
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleProfileMenuClose();
    router.push('/profile');
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Все равно перенаправляем на главную
      router.push('/');
    }
  };

  const navigationItems = getNavigationItems();

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

            {/* Кнопка корзины для авторизованных пользователей-клиентов */}
            {isAuthenticated && user?.role === 'user' && (
              <IconButton
                color="inherit"
                onClick={() => handleNavigation('/cart')}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <Badge badgeContent={getTotalItems()} color="error">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            )}

            {/* Активное бронирование для авторизованных пользователей-клиентов */}
            {isAuthenticated && user?.role === 'user' && (
              <ActiveReservationBadge />
            )}

            {/* Меню профиля для авторизованных пользователей */}
            {isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  startIcon={<Avatar sx={{ width: 24, height: 24, bgcolor: '#1B5E20' }}>
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>}
                  sx={{
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {user?.first_name}
                </Button>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {user?.role === 'user' && (
                    <MenuItem onClick={handleProfileClick}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Профиль
                    </MenuItem>
                  )}
                  
                  {user?.role === 'manager' && (
                    <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/manager'); }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Панель менеджера
                    </MenuItem>
                  )}
                  
                  {user?.role === 'admin' && (
                    <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/admin'); }}>
                        <PersonIcon sx={{ mr: 1 }} />
                        Панель админа
                    </MenuItem>
                  )}
                  
                  <MenuItem onClick={handleLogout}>
                    <ExitToAppIcon sx={{ mr: 1 }} />
                    Выход
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;