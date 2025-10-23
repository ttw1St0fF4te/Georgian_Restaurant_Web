'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Person as PersonIcon, Event as EventIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/lib/auth';
import { getCountries, getCountriesWithOther, getCitiesByCountry, getCountryByName, type Country } from '@/lib/countries';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    country: '',
    city: '',
    street_address: '',
  });
  
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  // Редирект если не авторизован (только после завершения загрузки)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Загружаем данные пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        street_address: user.street_address || '',
      });
      
      // Устанавливаем выбранную страну и доступные города
      if (user.country) {
        const country = getCountryByName(user.country);
        if (country) {
          setSelectedCountry(country);
          setAvailableCities(getCitiesByCountry(country.code));
          setIsCustomCountry(false);
        } else {
          // Страна не найдена в списке - значит это пользовательская страна
          setSelectedCountry({ code: 'OTHER', name: 'Другая страна', cities: [] });
          setAvailableCities([]);
          setIsCustomCountry(true);
        }
      } else {
        setSelectedCountry(null);
        setAvailableCities([]);
        setIsCustomCountry(false);
      }
    }
  }, [user]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCountryChange = (event: any, newValue: Country | null) => {
    setSelectedCountry(newValue);
    
    if (newValue) {
      if (newValue.code === 'OTHER') {
        // Если выбрана "Другая страна"
        setIsCustomCountry(true);
        setFormData(prev => ({
          ...prev,
          country: '',
          city: '', // Сбрасываем город при смене страны
        }));
        setAvailableCities([]);
      } else {
        // Обычная страна из списка
        setIsCustomCountry(false);
        setFormData(prev => ({
          ...prev,
          country: newValue.name,
          city: '', // Сбрасываем город при смене страны
        }));
        setAvailableCities(getCitiesByCountry(newValue.code));
      }
    } else {
      setIsCustomCountry(false);
      setFormData(prev => ({
        ...prev,
        country: '',
        city: '',
      }));
      setAvailableCities([]);
    }
    
    // Очищаем ошибки при изменении
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCityChange = (event: any, newValue: string | null) => {
    setFormData(prev => ({
      ...prev,
      city: newValue || '',
    }));
    
    // Очищаем ошибки при изменении
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (field: keyof PasswordChangeData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (passwordErrors.length > 0) {
      setPasswordErrors([]);
    }
  };

  const validateProfileForm = (): string[] => {
    console.log('Валидация профиля, данные формы:', formData);
    const newErrors: string[] = [];

    if (!formData.first_name.trim()) {
      newErrors.push('Введите имя');
    } else if (formData.first_name.length < 2) {
      newErrors.push('Имя должно содержать минимум 2 символа');
    } else if (formData.first_name.length > 50) {
      newErrors.push('Имя должно содержать максимум 50 символов');
    }

    if (!formData.last_name.trim()) {
      newErrors.push('Введите фамилию');
    } else if (formData.last_name.length < 2) {
      newErrors.push('Фамилия должна содержать минимум 2 символа');
    } else if (formData.last_name.length > 50) {
      newErrors.push('Фамилия должна содержать максимум 50 символов');
    }

    // Валидация телефона - только если поле заполнено
    if (formData.phone && formData.phone.trim()) {
      const phoneValue = formData.phone.trim();
      const phoneRegex = /^\+?[1-9]\d{8,14}$/;
      console.log('Валидация телефона:', phoneValue, 'Соответствует регексу:', phoneRegex.test(phoneValue));
      
      if (!phoneRegex.test(phoneValue)) {
        newErrors.push('Телефон должен быть в международном формате, например +79161234567');
      }
    }

    // Валидация адресных полей (необязательные, но если заполнены, то должны быть корректными)
    if (formData.country && formData.country.length < 2) {
      newErrors.push('Название страны должно содержать минимум 2 символа');
    }

    if (formData.city && formData.city.length < 2) {
      newErrors.push('Название города должно содержать минимум 2 символа');
    }

    if (formData.street_address && formData.street_address.length < 5) {
      newErrors.push('Адрес должен содержать минимум 5 символов');
    }

    console.log('Результат валидации профиля:', newErrors);
    return newErrors;
  };

  const validatePasswordForm = (): string[] => {
    const newErrors: string[] = [];

    if (!passwordData.currentPassword) {
      newErrors.push('Введите текущий пароль');
    }

    if (!passwordData.newPassword) {
      newErrors.push('Введите новый пароль');
    } else if (passwordData.newPassword.length < 8) {
      newErrors.push('Новый пароль должен содержать минимум 8 символов');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwordData.newPassword)) {
      newErrors.push('Новый пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол');
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.push('Пароли не совпадают');
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.push('Новый пароль должен отличаться от текущего');
    }

    return newErrors;
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validateProfileForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsUpdating(true);
    setErrors([]);

    try {
      // Формируем объект только с заполненными полями
      const updateData: any = {};
      
      // Обязательные поля
      if (formData.first_name.trim()) {
        updateData.first_name = formData.first_name.trim();
      }
      if (formData.last_name.trim()) {
        updateData.last_name = formData.last_name.trim();
      }
      
      // Опциональные поля - добавляем только если заполнены
      if (formData.phone && formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }
      if (formData.country && formData.country.trim()) {
        updateData.country = formData.country.trim();
      }
      if (formData.city && formData.city.trim()) {
        updateData.city = formData.city.trim();
      }
      if (formData.street_address && formData.street_address.trim()) {
        updateData.street_address = formData.street_address.trim();
      }

      console.log('Отправляемые данные на сервер:', updateData);
      await authService.updateProfile(updateData);
      // Получаем обновленные данные пользователя
      const updatedUser = await authService.getProfile();
      updateUser(updatedUser);
      setSuccessMessage('Профиль успешно обновлен!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          setErrors(error.response.data.message);
        } else {
          setErrors([error.response.data.message]);
        }
      } else if (error.message) {
        setErrors([error.message]);
      } else {
        setErrors(['Произошла ошибка при обновлении профиля. Попробуйте снова.']);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validatePasswordForm();
    if (validationErrors.length > 0) {
      setPasswordErrors(validationErrors);
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors([]);

    try {
      await authService.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      
      // Показываем сообщение об успехе
      setSuccessMessage('Пароль успешно изменен! Из соображений безопасности вы будете автоматически разлогинены через несколько секунд.');
      setPasswordDialogOpen(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Ждем 2 секунды, чтобы пользователь увидел сообщение, затем разлогиниваем
      setTimeout(async () => {
        try {
          await logout();
          router.push('/auth/login');
        } catch (error) {
          console.error('Logout error after password change:', error);
          // Принудительный редирект даже если logout не удался
          router.push('/auth/login');
        }
      }, 2000);
    } catch (error: any) {
      console.error('Password change error:', error);
      
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          setPasswordErrors(error.response.data.message);
        } else {
          setPasswordErrors([error.response.data.message]);
        }
      } else if (error.message) {
        setPasswordErrors([error.message]);
      } else {
        setPasswordErrors(['Произошла ошибка при изменении пароля. Попробуйте снова.']);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrors([]);
    setSuccessMessage('');
    // Восстанавливаем данные из user
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        country: user.country || '',
        city: user.city || '',
        street_address: user.street_address || '',
      });
      
      // Восстанавливаем выбранную страну и города
      if (user.country) {
        const country = getCountryByName(user.country);
        if (country) {
          setSelectedCountry(country);
          setAvailableCities(getCitiesByCountry(country.code));
          setIsCustomCountry(false);
        } else {
          // Страна не найдена в списке - значит это пользовательская страна
          setSelectedCountry({ code: 'OTHER', name: 'Другая страна', cities: [] });
          setAvailableCities([]);
          setIsCustomCountry(true);
        }
      } else {
        setSelectedCountry(null);
        setAvailableCities([]);
        setIsCustomCountry(false);
      }
    }
  };

  // Показываем загрузку пока идет инициализация
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Если загрузка завершена но пользователя нет - редирект уже произошел
  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Профиль пользователя
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Карточка с основной информацией */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Typography variant="h6">
              {user.first_name} {user.last_name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ minWidth: 250 }}>
              <Typography variant="body2" color="text.secondary">
                Имя пользователя
              </Typography>
              <Typography variant="body1">
                {user.username}
              </Typography>
            </Box>
            <Box sx={{ minWidth: 250 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Box>
            
            {/* Отображение адреса */}
            {(user.country || user.city || user.street_address) && (
              <Box sx={{ minWidth: 250 }}>
                <Typography variant="body2" color="text.secondary">
                  Адрес
                </Typography>
                <Typography variant="body1">
                  {[user.country, user.city, user.street_address].filter(Boolean).join(', ') || 'Не указан'}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Форма редактирования профиля */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            Редактируемые данные
          </Typography>
          {!isEditing && (
            <IconButton 
              onClick={() => setIsEditing(true)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>

        {/* Отображение ошибок валидации */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <Typography key={index} variant="body2">
                {error}
              </Typography>
            ))}
          </Alert>
        )}

        <Box component="form" onSubmit={handleProfileSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                id="first_name"
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                disabled={!isEditing || isLoading}
                placeholder="Введите ваше имя"
              />
              <TextField
                required
                sx={{ flex: '1 1 300px' }}
                id="last_name"
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                disabled={!isEditing || isLoading}
                placeholder="Введите вашу фамилию"
              />
            </Box>
            <TextField
              fullWidth
              id="phone"
              label="Телефон"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              disabled={!isEditing || isLoading}
              placeholder="Введите номер телефона"
            />
            
            {/* Поля адреса */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Адрес
            </Typography>
            
            {/* Предупреждение о доставке */}
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Информация о доставке:</strong> Вы можете указать любую страну и город в своем профиле, 
                однако доставка еды осуществляется только в те города, где у нас есть рестораны. 
                Актуальный список городов с доставкой вы можете посмотреть на странице с ресторанами.
              </Typography>
            </Alert>
            <Autocomplete
              fullWidth
              id="country"
              options={getCountriesWithOther()}
              getOptionLabel={(option) => option.name}
              value={selectedCountry}
              onChange={handleCountryChange}
              disabled={!isEditing || isLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Страна"
                  placeholder="Выберите страну"
                />
              )}
              sx={{ mb: 2 }}
            />
            
            {/* Поле для ввода произвольной страны */}
            {isCustomCountry && (
              <TextField
                fullWidth
                id="custom-country"
                label="Введите название страны"
                value={formData.country}
                onChange={handleInputChange('country')}
                disabled={!isEditing || isLoading}
                placeholder="Введите название вашей страны"
                sx={{ mb: 2 }}
              />
            )}
            
            {/* Выбор города */}
            {!isCustomCountry && availableCities.length > 0 ? (
              <Autocomplete
                fullWidth
                id="city"
                options={availableCities}
                value={formData.city || null}
                onChange={handleCityChange}
                disabled={!isEditing || isLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Город"
                    placeholder="Выберите город"
                  />
                )}
                sx={{ mb: 2 }}
              />
            ) : (isCustomCountry || formData.country) ? (
              <TextField
                fullWidth
                id="city"
                label="Город"
                value={formData.city}
                onChange={handleInputChange('city')}
                disabled={!isEditing || isLoading}
                placeholder="Введите название города"
                sx={{ mb: 2 }}
              />
            ) : null}
            
            <TextField
              fullWidth
              id="street_address"
              label="Адрес"
              name="street_address"
              value={formData.street_address}
              onChange={handleInputChange('street_address')}
              disabled={!isEditing || isLoading}
              placeholder="Введите улицу и номер дома"
              multiline
              rows={2}
            />
          </Box>
          
          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isUpdating}
                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : undefined}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
              <Button
                variant="outlined"
                onClick={cancelEditing}
                disabled={isLoading}
              >
                Отмена
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Быстрые действия */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<EventIcon />}
            onClick={() => router.push('/profile/reservations')}
            sx={{ flex: '1 1 200px' }}
          >
            Мои бронирования
          </Button>
        </Box>

        {/* Кнопка смены пароля */}
        <Button
          variant="outlined"
          onClick={() => setPasswordDialogOpen(true)}
          fullWidth
        >
          Изменить пароль
        </Button>
      </Paper>

      {/* Диалог смены пароля */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Изменить пароль</DialogTitle>
        <DialogContent>
          {/* Предупреждение о logout после смены пароля */}
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Важно:</strong> После успешной смены пароля вы будете автоматически разлогинены 
              из соображений безопасности. Вам потребуется войти в систему заново с новым паролем.
            </Typography>
          </Alert>

          {passwordErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordErrors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          )}

          <Box component="form" onSubmit={handlePasswordSubmit}>
            <TextField
              required
              fullWidth
              margin="normal"
              name="currentPassword"
              label="Текущий пароль"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              disabled={passwordLoading}
            />
            <TextField
              required
              fullWidth
              margin="normal"
              name="newPassword"
              label="Новый пароль"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange('newPassword')}
              disabled={passwordLoading}
              placeholder="Минимум 8 символов"
            />
            <TextField
              required
              fullWidth
              margin="normal"
              name="confirmPassword"
              label="Подтвердите новый пароль"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              disabled={passwordLoading}
              placeholder="Повторите новый пароль"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialogOpen(false)}
            disabled={passwordLoading}
          >
            Отмена
          </Button>
          <Button 
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : undefined}
          >
            {passwordLoading ? 'Изменение...' : 'Изменить пароль'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;