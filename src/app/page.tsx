'use client';

import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useMenuCategories, useMenu, useMenuItem } from '@/lib/api/hooks';
import { MenuFilterDto, MenuItemResponseDto } from '@/lib/api/types';
import MenuFilters from '@/components/menu/MenuFilters';
import MenuItemCard from '@/components/menu/MenuItemCard';

const ITEMS_PER_PAGE = 12;

export default function MenuPage() {
  const [filters, setFilters] = useState<MenuFilterDto>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  const [selectedItem, setSelectedItem] = useState<MenuItemResponseDto | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useMenuCategories();
  const { data: menuData, isLoading: menuLoading, error: menuError } = useMenu(filters);

  const handleFiltersChange = (newFilters: MenuFilterDto) => {
    setFilters({
      ...newFilters,
      page: 1, // Сбрасываем на первую страницу при изменении фильтров
      limit: ITEMS_PER_PAGE,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: ITEMS_PER_PAGE,
      sort_by: 'created_at',
      sort_order: 'DESC',
    });
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewDetails = (item: MenuItemResponseDto) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedItem(null);
  };

  const isLoading = categoriesLoading || menuLoading;
  const menuItems = menuData?.items || [];
  const totalPages = menuData?.pages || 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
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
          Меню грузинской кухни
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Аутентичные блюда, приготовленные по традиционным рецептам наших предков
        </Typography>
      </Box>

      {/* Фильтры */}
      <MenuFilters
        filters={filters}
        categories={categories}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Загрузка */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Ошибка */}
      {menuError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Произошла ошибка при загрузке меню. Попробуйте обновить страницу.
        </Alert>
      )}

      {/* Результаты */}
      {!isLoading && !menuError && (
        <>
          {/* Информация о результатах */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Найдено: {menuData?.total || 0} блюд
            </Typography>
            {menuData && menuData.total > 0 && (
              <Typography variant="body2" color="text.secondary">
                Страница {menuData.page} из {menuData.pages}
              </Typography>
            )}
          </Box>

          {/* Сетка с блюдами */}
          {menuItems.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
              {menuItems.map((item: MenuItemResponseDto) => (
                <MenuItemCard
                  key={item.item_id}
                  item={item}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Блюда не найдены
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Попробуйте изменить параметры поиска или фильтры
              </Typography>
            </Box>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={filters.page || 1}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Диалог с деталями блюда */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                {selectedItem.item_name}
              </Typography>
              <Typography variant="subtitle1" component="span" color="primary" sx={{ fontWeight: 'bold', mt: 1, fontSize: '1.25rem' }}>
                {selectedItem.price} ₾
              </Typography>
            </DialogTitle>
            
            <DialogContent>
              {selectedItem.image_url && (
                <Box sx={{ mb: 3 }}>
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.item_name}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                </Box>
              )}

              {selectedItem.item_description && (
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {selectedItem.item_description}
                </Typography>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Информация о блюде
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">
                    Время приготовления: {selectedItem.cooking_time_minutes} мин
                  </Typography>
                </Box>

                {selectedItem.calories !== null && selectedItem.calories !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalFireDepartmentIcon fontSize="small" />
                    <Typography variant="body2">
                      Калории: {selectedItem.calories} ккал
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                  {selectedItem.is_vegetarian && (
                    <Chip label="Вегетарианское" size="small" color="success" />
                  )}
                  {selectedItem.is_spicy && (
                    <Chip label="Острое" size="small" color="error" />
                  )}
                  {selectedItem.category && (
                    <Chip label={selectedItem.category.category_name} size="small" />
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseDetails}>
                Закрыть
              </Button>
              <Button variant="contained" color="primary">
                Добавить в заказ
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}
