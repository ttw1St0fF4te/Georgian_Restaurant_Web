'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Chip,
  IconButton,
  Collapse,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MenuFilterDto, MenuCategoryResponseDto } from '@/lib/api/types';

interface MenuFiltersProps {
  filters: MenuFilterDto;
  categories: MenuCategoryResponseDto[];
  onFiltersChange: (filters: MenuFilterDto) => void;
  onClearFilters: () => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  filters,
  categories,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleFilterChange = (key: keyof MenuFilterDto, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value === '' ? undefined : value,
    };
    
    // Если изменяется порядок сортировки, но тип сортировки не задан, используем created_at по умолчанию
    if (key === 'sort_order' && !filters.sort_by) {
      newFilters.sort_by = 'created_at';
    }
    
    // При изменении типа сортировки устанавливаем правильный порядок по умолчанию
    if (key === 'sort_by') {
      if (value === 'created_at' && !filters.sort_order) {
        newFilters.sort_order = 'DESC'; // Для даты - сначала новые
      } else if (['price', 'cooking_time_minutes', 'calories'].includes(value) && !filters.sort_order) {
        newFilters.sort_order = 'ASC'; // Для остальных - по возрастанию
      }
    }
    
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category_id) count++;
    if (filters.is_vegetarian) count++;
    if (filters.is_spicy) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
    if (filters.max_cooking_time) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          <Typography variant="h6">Фильтры</Typography>
          {activeFiltersCount > 0 && (
            <Chip 
              label={`${activeFiltersCount} активных`} 
              size="small" 
              color="primary" 
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {activeFiltersCount > 0 && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearFilters}
            >
              Очистить
            </Button>
          )}
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Поиск всегда виден */}
      <TextField
        fullWidth
        label="Поиск по названию или описанию"
        value={filters.search || ''}
        onChange={(e) => handleFilterChange('search', e.target.value)}
        sx={{ mb: 2 }}
      />

      <Collapse in={isExpanded}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
          {/* Категория */}
          <FormControl fullWidth>
            <InputLabel>Категория</InputLabel>
            <Select
              value={filters.category_id || ''}
              label="Категория"
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
            >
              <MenuItem value="">Все категории</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Цена от */}
          <TextField
            type="number"
            label="Цена от (₾)"
            value={filters.min_price || ''}
            onChange={(e) => handleFilterChange('min_price', Number(e.target.value) || undefined)}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Цена до */}
          <TextField
            type="number"
            label="Цена до (₾)"
            value={filters.max_price || ''}
            onChange={(e) => handleFilterChange('max_price', Number(e.target.value) || undefined)}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Время приготовления */}
          <TextField
            type="number"
            label="Время приготовления (макс. мин)"
            value={filters.max_cooking_time || ''}
            onChange={(e) => handleFilterChange('max_cooking_time', Number(e.target.value) || undefined)}
            inputProps={{ min: 0 }}
          />

          {/* Сортировка */}
          <FormControl fullWidth>
            <InputLabel>Сортировать по</InputLabel>
            <Select
              value={filters.sort_by || 'created_at'}
              label="Сортировать по"
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              <MenuItem value="created_at">По дате добавления (по умолчанию)</MenuItem>
              <MenuItem value="price">По цене</MenuItem>
              <MenuItem value="cooking_time_minutes">По времени приготовления</MenuItem>
              <MenuItem value="calories">По калориям</MenuItem>
            </Select>
          </FormControl>

          {/* Порядок сортировки */}
          <FormControl fullWidth>
            <InputLabel>Порядок</InputLabel>
            <Select
              value={filters.sort_order || 'DESC'}
              label="Порядок"
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
            >
              <MenuItem value="ASC">По возрастанию</MenuItem>
              <MenuItem value="DESC">По убыванию</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Чекбоксы */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_vegetarian || false}
                onChange={(e) => handleFilterChange('is_vegetarian', e.target.checked || undefined)}
              />
            }
            label="Только вегетарианские"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.is_spicy || false}
                onChange={(e) => handleFilterChange('is_spicy', e.target.checked || undefined)}
              />
            }
            label="Только острые"
          />
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MenuFilters;