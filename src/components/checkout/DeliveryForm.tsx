'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  LocalShipping as LocalShippingIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { getCountriesWithOther, getCitiesByCountry, getCountryByName, type Country } from '@/lib/countries';

interface DeliveryData {
  country: string;
  city: string;
  street_address: string;
  phone: string;
  saveAddress: boolean;
}

interface DeliveryFormProps {
  data: DeliveryData;
  onChange: (data: DeliveryData) => void;
  onNext: () => void;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ data, onChange, onNext }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isCustomCountry, setIsCustomCountry] = useState(false);

  // Инициализация выбранной страны и городов при загрузке или изменении данных
  useEffect(() => {
    if (data.country) {
      const country = getCountryByName(data.country);
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
  }, [data.country]);
  const handleCountryChange = (event: any, newValue: Country | null) => {
    setSelectedCountry(newValue);
    
    if (newValue) {
      if (newValue.code === 'OTHER') {
        // Если выбрана "Другая страна"
        setIsCustomCountry(true);
        onChange({
          ...data,
          country: '',
          city: '', // Сбрасываем город при смене страны
        });
        setAvailableCities([]);
      } else {
        // Обычная страна из списка
        setIsCustomCountry(false);
        onChange({
          ...data,
          country: newValue.name,
          city: '', // Сбрасываем город при смене страны
        });
        setAvailableCities(getCitiesByCountry(newValue.code));
      }
    } else {
      setIsCustomCountry(false);
      onChange({
        ...data,
        country: '',
        city: '',
      });
      setAvailableCities([]);
    }
  };

  const handleCityChange = (event: any, newValue: string | null) => {
    onChange({
      ...data,
      city: newValue || '',
    });
  };

  const handleInputChange = (field: keyof Omit<DeliveryData, 'saveAddress'>) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
    // Валидация и форматирование телефона
    if (field === 'phone') {
      // Разрешаем только цифры, плюс в начале и ограничиваем длину
      const cleanValue = value.replace(/[^\d+]/g, '');
      
      // Проверяем, что плюс только в начале
      let formattedValue = cleanValue;
      if (cleanValue.includes('+')) {
        const firstPlusIndex = cleanValue.indexOf('+');
        if (firstPlusIndex === 0) {
          // Убираем все остальные плюсы кроме первого
          formattedValue = '+' + cleanValue.slice(1).replace(/\+/g, '');
        } else {
          // Убираем все плюсы если они не в начале
          formattedValue = cleanValue.replace(/\+/g, '');
        }
      }
      
      // Ограничиваем длину (максимум 15 символов: + и 14 цифр)
      if (formattedValue.length <= 15) {
        value = formattedValue;
      } else {
        return; // Не обновляем состояние если превышена длина
      }
    }

    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...data,
      saveAddress: event.target.checked,
    });
  };

  const isFormValid = () => {
    return (
      data.country.trim() &&
      data.city.trim() &&
      data.street_address.trim() &&
      data.phone.trim() &&
      /^\+?[1-9]\d{8,14}$/.test(data.phone.trim())
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Адрес доставки
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Важно:</strong> Доставка возможна только в города, где есть наши рестораны. 
          Стоимость доставки составляет 5% от суммы заказа.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {/* Выбор страны */}
        <Autocomplete
          fullWidth
          id="country"
          options={getCountriesWithOther()}
          getOptionLabel={(option) => option.name}
          value={selectedCountry}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Страна *"
              required
              placeholder="Выберите страну"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        
        {/* Поле для ввода произвольной страны */}
        {isCustomCountry && (
          <TextField
            fullWidth
            id="custom-country"
            label="Введите название страны *"
            value={data.country}
            onChange={handleInputChange('country')}
            required
            placeholder="Введите название вашей страны"
            InputProps={{
              startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        )}
        
        {/* Выбор города */}
        {!isCustomCountry && availableCities.length > 0 ? (
          <Autocomplete
            fullWidth
            id="city"
            options={availableCities}
            value={data.city || null}
            onChange={handleCityChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Город *"
                required
                placeholder="Выберите город"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        ) : (isCustomCountry || data.country) ? (
          <TextField
            fullWidth
            id="city"
            label="Город *"
            value={data.city}
            onChange={handleInputChange('city')}
            required
            placeholder="Введите название города"
            InputProps={{
              startAdornment: <LocationOnIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        ) : null}

        <TextField
          label="Адрес доставки *"
          value={data.street_address}
          onChange={handleInputChange('street_address')}
          required
          fullWidth
          multiline
          rows={2}
          InputProps={{
            startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
          }}
          placeholder="Введите улицу, номер дома, квартиру"
        />

        <TextField
          label="Контактный телефон *"
          value={data.phone}
          onChange={handleInputChange('phone')}
          required
          fullWidth
          type="tel"
          InputProps={{
            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          placeholder="+995555123456"
          helperText="Введите номер в международном формате"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={data.saveAddress}
              onChange={handleCheckboxChange}
            />
          }
          label="Сохранить этот адрес в моём профиле"
        />
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        disabled={!isFormValid()}
        fullWidth
      >
        Продолжить
      </Button>
    </Paper>
  );
};

export default DeliveryForm;