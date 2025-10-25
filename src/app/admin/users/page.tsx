'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAllUsers } from '@/lib/api/hooks';
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/lib/hooks/useUserManagement';

// Импортируем типы пользователя
import { User } from '@/lib/auth';
import { UserResponseDto } from '@/lib/api/services/auth';

interface UserRole {
  role_id: number;
  role_name: string;
  role_description?: string;
}

const UsersManagementPage: React.FC = () => {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserResponseDto | null>(null);

  // Хуки для данных
  const { data: users, isLoading: usersLoading, error: usersError } = useAllUsers();

  // Хуки для мутаций
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Состояние для отображения ошибок
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Состояние формы
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: 3, // по умолчанию пользователь
    password: '',
  });

  // Моковые данные ролей (в реальном проекте загружались бы из API)
  const roles: UserRole[] = [
    { role_id: 1, role_name: 'admin', role_description: 'Администратор' },
    { role_id: 2, role_name: 'manager', role_description: 'Менеджер' },
    { role_id: 3, role_name: 'user', role_description: 'Пользователь' },
  ];

  const handleOpenDialog = (user?: UserResponseDto) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone || '',
        role_id: user.role_id,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        role_id: 3,
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      if (editingUser) {
        // Обновление пользователя
        const updateData: any = {};
        if (formData.username !== editingUser.username) updateData.username = formData.username;
        if (formData.email !== editingUser.email) updateData.email = formData.email;
        if (formData.first_name !== editingUser.first_name) updateData.first_name = formData.first_name;
        if (formData.last_name !== editingUser.last_name) updateData.last_name = formData.last_name;
        if (formData.phone !== (editingUser.phone || '')) updateData.phone = formData.phone;
        if (formData.password) updateData.password = formData.password;
        
        // Проверяем роль
        if (formData.role_id !== editingUser.role_id) updateData.role_id = formData.role_id;

        if (Object.keys(updateData).length > 0) {
          await updateUserMutation.mutateAsync({ userId: editingUser.user_id, userData: updateData });
        }
      } else {
        // Создание пользователя
        await createUserMutation.mutateAsync(formData);
      }
      
      handleCloseDialog();
    } catch (error: any) {
      setErrorMessage(error.message || 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: UserResponseDto) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync(userToDelete.user_id);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      // Можно добавить отображение ошибки в снекбаре
      console.error('Error deleting user:', error);
      alert(error.message || 'Ошибка при удалении пользователя');
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (roleName: string) => {
    const role = roles.find(r => r.role_name === roleName);
    return role?.role_description || roleName;
  };

  if (usersLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (usersError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Ошибка загрузки пользователей. Попробуйте обновить страницу.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/admin')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          Управление пользователями
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить пользователя
        </Button>
      </Box>

      {/* Таблица пользователей */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя пользователя</TableCell>
                <TableCell>Полное имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) && users.map((user) => (
                <TableRow key={user.user_id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.first_name} {user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(user)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог создания/редактирования пользователя */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <TextField
              label="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Имя"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Фамилия"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Телефон"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Роль</InputLabel>
              <Select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                label="Роль"
              >
                {roles.map((role) => (
                  <MenuItem key={role.role_id} value={role.role_id}>
                    {role.role_description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={editingUser ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!editingUser}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? 'Сохранение...' : (editingUser ? 'Сохранить' : 'Создать')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Подтвердите удаление</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить пользователя {userToDelete?.username}?
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersManagementPage;