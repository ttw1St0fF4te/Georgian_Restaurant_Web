'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Tooltip,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  ArrowBack as ArrowBackIcon,
  Restaurant as RestaurantIcon,
  Schedule as ScheduleIcon,
  LocalFireDepartment as SpicyIcon,
  Grass as VegetarianIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  useAllMenuItems,
  useMenuCategories,
  useCreateMenuItem,
  useUpdateMenuItem,
  useSoftDeleteMenuItem,
  useRestoreMenuItem,
} from '@/lib/api/hooks';
import {
  MenuItemResponseDto,
  CreateMenuItemDto,
  UpdateMenuItemDto,
} from '@/lib/api/services/menu';

const MenuManagementPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Состояние для модальных окон
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemResponseDto | null>(null);
  
  // Состояние для пагинации
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  });
  
  // Состояние для форм
  const [formData, setFormData] = useState<CreateMenuItemDto>({
    item_name: '',
    item_description: '',
    category_id: 0,
    price: 0,
    cooking_time_minutes: 0,
    calories: 0,
    is_vegetarian: false,
    is_spicy: false,
    image_url: '',
  });
  
  const [errors, setErrors] = useState<string[]>([]);

  // Запросы данных
  const { data: menuData, isLoading: menuLoading, error: menuError } = useAllMenuItems({
    page: filters.page,
    limit: filters.limit
  });
  const { data: categories, isLoading: categoriesLoading } = useMenuCategories();
  
  // Мутации
  const createMutation = useCreateMenuItem();
  const updateMutation = useUpdateMenuItem();
  const softDeleteMutation = useSoftDeleteMenuItem();
  const restoreMutation = useRestoreMenuItem();

  // Обработчик смены страницы
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Проверка доступа
  React.useEffect(() => {
    if (user && user.role !== 'manager' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleCreateOpen = () => {
    setFormData({
      item_name: '',
      item_description: '',
      category_id: 0,
      price: 0,
      cooking_time_minutes: 0,
      calories: 0,
      is_vegetarian: false,
      is_spicy: false,
      image_url: '',
    });
    setErrors([]);
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (item: MenuItemResponseDto) => {
    setSelectedItem(item);
    setFormData({
      item_name: item.item_name,
      item_description: item.item_description || '',
      category_id: Number(item.category_id),
      price: Number(item.price),
      cooking_time_minutes: Number(item.cooking_time_minutes),
      calories: Number(item.calories || 0),
      is_vegetarian: Boolean(item.is_vegetarian),
      is_spicy: Boolean(item.is_spicy),
      image_url: item.image_url || '',
    });
    setErrors([]);
    setEditDialogOpen(true);
  };

  const handleDeleteOpen = (item: MenuItemResponseDto) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    
    if (!formData.item_name.trim()) {
      newErrors.push('Введите название блюда');
    } else if (formData.item_name.length < 3) {
      newErrors.push('Название должно содержать минимум 3 символа');
    }
    
    if (!formData.category_id || formData.category_id === 0) {
      newErrors.push('Выберите категорию');
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.push('Введите корректную цену');
    }
    
    if (formData.cooking_time_minutes && formData.cooking_time_minutes < 0) {
      newErrors.push('Время приготовления не может быть отрицательным');
    }
    
    if (formData.calories && formData.calories < 0) {
      newErrors.push('Калории не могут быть отрицательными');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editDialogOpen && selectedItem) {
        // Преобразуем данные в правильные типы
        const updateData: UpdateMenuItemDto = {
          ...formData,
          price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
          cooking_time_minutes: typeof formData.cooking_time_minutes === 'string' 
            ? parseInt(formData.cooking_time_minutes) 
            : formData.cooking_time_minutes,
          calories: typeof formData.calories === 'string' 
            ? parseInt(formData.calories) 
            : formData.calories,
          category_id: typeof formData.category_id === 'string' 
            ? parseInt(formData.category_id) 
            : formData.category_id,
        };
        
        await updateMutation.mutateAsync({
          id: selectedItem.item_id,
          data: updateData,
        });
        setEditDialogOpen(false);
      } else {
        await createMutation.mutateAsync(formData);
        setCreateDialogOpen(false);
      }
      setSelectedItem(null);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      setErrors([error.response?.data?.message || 'Ошибка при сохранении блюда']);
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedItem) return;

    try {
      await softDeleteMutation.mutateAsync(selectedItem.item_id);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
    }
  };

  const handleRestore = async (item: MenuItemResponseDto) => {
    try {
      await restoreMutation.mutateAsync(item.item_id);
    } catch (error: any) {
      console.error('Error restoring menu item:', error);
    }
  };

  const closeDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    setErrors([]);
  };

  if (menuLoading || categoriesLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (menuError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Ошибка при загрузке меню. Попробуйте перезагрузить страницу.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => router.push('/manager')}
            sx={{ mr: 2 }}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Управление меню
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          size="large"
        >
          Добавить блюдо
        </Button>
      </Box>

      {/* Таблица блюд */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Время приготовления</TableCell>
                  <TableCell>Характеристики</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {menuData?.items?.map((item: MenuItemResponseDto) => (
                  <TableRow key={item.item_id} sx={{ opacity: item.is_deleted ? 0.6 : 1 }}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {item.item_name}
                        </Typography>
                        {item.item_description && (
                          <Typography variant="caption" color="text.secondary">
                            {item.item_description.length > 60
                              ? `${item.item_description.substring(0, 60)}...`
                              : item.item_description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{item.category?.category_name}</TableCell>
                    <TableCell>{Number(item.price || 0).toFixed(2)} ₾</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon fontSize="small" color="action" />
                        {Number(item.cooking_time_minutes || 0)} мин
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {item.is_vegetarian && (
                          <Tooltip title="Вегетарианское">
                            <VegetarianIcon fontSize="small" color="success" />
                          </Tooltip>
                        )}
                        {item.is_spicy && (
                          <Tooltip title="Острое">
                            <SpicyIcon fontSize="small" color="warning" />
                          </Tooltip>
                        )}
                        {item.calories && (
                          <Typography variant="caption" color="text.secondary">
                            {Number(item.calories)} ккал
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.is_deleted ? 'Удалено' : 'Активно'}
                        color={item.is_deleted ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!item.is_deleted ? (
                          <>
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={() => handleEditOpen(item)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteOpen(item)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Восстановить">
                            <IconButton
                              size="small"
                              onClick={() => handleRestore(item)}
                              color="success"
                            >
                              <RestoreIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!menuData?.items || menuData.items.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Блюда не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Начните с добавления первого блюда в меню
              </Typography>
            </Box>
          )}

          {/* Пагинация */}
          {menuData && menuData.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={menuData.pages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Диалог создания/редактирования */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={closeDialogs}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editDialogOpen ? 'Редактировать блюдо' : 'Добавить блюдо'}
        </DialogTitle>
        <DialogContent>
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Название блюда *"
              value={formData.item_name}
              onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Описание"
              value={formData.item_description}
              onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Категория *</InputLabel>
              <Select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                label="Категория *"
              >
                <MenuItem value={0}>Выберите категорию</MenuItem>
                {categories?.map((category: any) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Цена (₾) *"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />

              <TextField
                label="Время приготовления (мин)"
                type="number"
                value={formData.cooking_time_minutes}
                onChange={(e) => setFormData({ ...formData, cooking_time_minutes: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Калории"
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />

              <TextField
                label="URL изображения"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_vegetarian}
                    onChange={(e) => setFormData({ ...formData, is_vegetarian: e.target.checked })}
                  />
                }
                label="Вегетарианское"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_spicy}
                    onChange={(e) => setFormData({ ...formData, is_spicy: e.target.checked })}
                  />
                }
                label="Острое"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              editDialogOpen ? 'Сохранить' : 'Создать'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={closeDialogs}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить блюдо "{selectedItem?.item_name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Блюдо будет скрыто для клиентов, но останется в существующих заказах.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogs}>Отмена</Button>
          <Button
            onClick={handleSoftDelete}
            color="error"
            variant="contained"
            disabled={softDeleteMutation.isPending}
          >
            {softDeleteMutation.isPending ? <CircularProgress size={20} /> : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MenuManagementPage;