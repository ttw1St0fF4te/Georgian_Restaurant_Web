'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, CheckCircle, Cancel, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '@/lib/auth-context';
import {
  useAllReservations,
  useConfirmReservationForManager,
  useCancelReservationForManager,
  useAllUsers,
} from '@/lib/api/hooks';
// import { ReservationResponseDto } from '@/lib/api/services/reservations';

const ReservationsManagementPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);

  // Запросы данных
  const { data: reservations, isLoading: reservationsLoading, error: reservationsError } = useAllReservations();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  
  // Мутации
  const confirmMutation = useConfirmReservationForManager();
  const cancelMutation = useCancelReservationForManager();

  // Проверка доступа
  React.useEffect(() => {
    if (user && user.role !== 'manager' && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const handleCreateReservation = () => {
    router.push('/manager/reservations/create');
  };

  const handleConfirmOpen = (reservation: any) => {
    setSelectedReservation(reservation);
    setConfirmDialogOpen(true);
  };

  const handleCancelOpen = (reservation: any) => {
    setSelectedReservation(reservation);
    setCancelDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedReservation) return;
    
    try {
      await confirmMutation.mutateAsync(selectedReservation.reservation_id);
      setConfirmDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error confirming reservation:', error);
    }
  };

  const handleCancel = async () => {
    if (!selectedReservation) return;
    
    try {
      await cancelMutation.mutateAsync(selectedReservation.reservation_id);
      setCancelDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error canceling reservation:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unconfirmed':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'started':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'unconfirmed':
        return 'Не подтверждена';
      case 'confirmed':
        return 'Подтверждена';
      case 'started':
        return 'Начата';
      case 'completed':
        return 'Завершена';
      case 'cancelled':
        return 'Отменена';
      default:
        return status;
    }
  };

  const getUserName = (userId: string) => {
    if (!users || !Array.isArray(users)) return userId;
    const foundUser = users.find((u: any) => u.user_id === userId);
    return foundUser ? `${foundUser.first_name} ${foundUser.last_name} (${foundUser.username})` : userId;
  };

  if (reservationsLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (reservationsError) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error">
          Ошибка при загрузке бронирований: {reservationsError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => router.push('/manager')}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Управление бронированиями
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateReservation}
          color="primary"
        >
          Создать новую бронь
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Все бронирования (от новых к старым)
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Пользователь</TableCell>
                  <TableCell>Ресторан</TableCell>
                  <TableCell>Столик</TableCell>
                  <TableCell>Дата и время</TableCell>
                  <TableCell>Гости</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations?.map((reservation: any) => (
                  <TableRow key={reservation.reservation_id}>
                    <TableCell>
                      {reservation.reservation_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {usersLoading ? 'Загрузка...' : getUserName(reservation.user_id)}
                    </TableCell>
                    <TableCell>{reservation.restaurant_name}</TableCell>
                    <TableCell>№{reservation.table_number} ({reservation.seats_count} мест)</TableCell>
                    <TableCell>
                      {reservation.reservation_date} в {reservation.reservation_time}
                      <br />
                      <small>({reservation.duration_hours}ч)</small>
                    </TableCell>
                    <TableCell>{reservation.guests_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(reservation.reservation_status)}
                        color={getStatusColor(reservation.reservation_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{reservation.contact_phone}</TableCell>
                    <TableCell>
                      {reservation.reservation_status === 'unconfirmed' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => handleConfirmOpen(reservation)}
                            disabled={confirmMutation.isPending}
                          >
                            Подтвердить
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => handleCancelOpen(reservation)}
                            disabled={cancelMutation.isPending}
                          >
                            Отменить
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {(!reservations || reservations.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        Бронирования не найдены
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Создайте первое бронирование
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Подтвердить бронирование</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите подтвердить бронирование?
          </Typography>
          {selectedReservation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Ресторан:</strong> {selectedReservation.restaurant_name}
              </Typography>
              <Typography variant="body2">
                <strong>Дата:</strong> {selectedReservation.reservation_date} в {selectedReservation.reservation_time}
              </Typography>
              <Typography variant="body2">
                <strong>Столик:</strong> №{selectedReservation.table_number}
              </Typography>
              <Typography variant="body2">
                <strong>Гости:</strong> {selectedReservation.guests_count}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="success"
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? 'Подтверждение...' : 'Подтвердить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог отмены */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Отменить бронирование</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить бронирование?
          </Typography>
          {selectedReservation && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Ресторан:</strong> {selectedReservation.restaurant_name}
              </Typography>
              <Typography variant="body2">
                <strong>Дата:</strong> {selectedReservation.reservation_date} в {selectedReservation.reservation_time}
              </Typography>
              <Typography variant="body2">
                <strong>Столик:</strong> №{selectedReservation.table_number}
              </Typography>
              <Typography variant="body2">
                <strong>Гости:</strong> {selectedReservation.guests_count}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleCancel}
            variant="contained"
            color="error"
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Отмена...' : 'Отменить бронирование'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationsManagementPage;