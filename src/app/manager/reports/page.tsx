'use client';

import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Download, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { 
  useSalesReport, 
  useOccupancyReport, 
  useUserVisitsReport, 
  useExportSalesCsv,
  useExportOccupancyCsv,
  useExportUserVisitsCsv,
  useExportAllDataCsv,
  useRestaurants,
} from '@/lib/api/hooks';
import { format, subDays } from 'date-fns';

const ReportsPage = () => {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState<Date>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  // Format dates for API
  const fromStr = format(dateFrom, 'yyyy-MM-dd');
  const toStr = format(dateTo, 'yyyy-MM-dd');

  // Fetch data
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants();
  const { data: salesData, isLoading: salesLoading, error: salesError } = useSalesReport(selectedRestaurant, fromStr, toStr);
  const { data: occupancyData, isLoading: occupancyLoading, error: occupancyError } = useOccupancyReport(selectedRestaurant, fromStr, toStr);
  const { data: visitsData, isLoading: visitsLoading, error: visitsError } = useUserVisitsReport(fromStr, toStr);
  
  const exportSalesMutation = useExportSalesCsv();
  const exportOccupancyMutation = useExportOccupancyCsv();
  const exportVisitsMutation = useExportUserVisitsCsv();
  const exportAllMutation = useExportAllDataCsv();

  const handleExport = useCallback(async (type: 'sales' | 'occupancy' | 'visits' | 'all') => {
    try {
      let blob: any;
      let filename: string;
      
      switch (type) {
        case 'sales':
          blob = await exportSalesMutation.mutateAsync({ restaurantId: selectedRestaurant, from: fromStr, to: toStr });
          filename = `sales_report_${fromStr}_to_${toStr}.csv`;
          break;
        case 'occupancy':
          blob = await exportOccupancyMutation.mutateAsync({ restaurantId: selectedRestaurant, from: fromStr, to: toStr });
          filename = `occupancy_report_${fromStr}_to_${toStr}.csv`;
          break;
        case 'visits':
          blob = await exportVisitsMutation.mutateAsync({ from: fromStr, to: toStr });
          filename = `visits_report_${fromStr}_to_${toStr}.csv`;
          break;
        case 'all':
          blob = await exportAllMutation.mutateAsync({ restaurantId: selectedRestaurant, from: fromStr, to: toStr });
          filename = `full_report_${fromStr}_to_${toStr}.csv`;
          break;
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [exportSalesMutation, exportOccupancyMutation, exportVisitsMutation, exportAllMutation, selectedRestaurant, fromStr, toStr]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => router.push('/manager')}
            sx={{ mr: 2 }}
            color="primary"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Отчетность
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Параметры отчета
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <DatePicker
                label="Дата начала"
                value={dateFrom}
                onChange={(newValue) => newValue && setDateFrom(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
            
            <Box sx={{ minWidth: 200 }}>
              <DatePicker
                label="Дата окончания"
                value={dateTo}
                onChange={(newValue) => newValue && setDateTo(newValue)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Box>
            
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Ресторан</InputLabel>
                <Select
                  value={selectedRestaurant || ''}
                  onChange={(e) => setSelectedRestaurant(e.target.value ? Number(e.target.value) : null)}
                  label="Ресторан"
                >
                  <MenuItem value="">Все рестораны</MenuItem>
                  {Array.isArray(restaurants) && restaurants.map((restaurant) => (
                    <MenuItem key={restaurant.restaurant_id} value={restaurant.restaurant_id}>
                      {restaurant.restaurant_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ minWidth: 200 }}>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={() => handleExport('all')}
                disabled={exportAllMutation.isPending}
                fullWidth
                color="primary"
              >
                {exportAllMutation.isPending ? 'Экспорт...' : 'Экспорт всех данных'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Charts */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Top row with two charts */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* Sales Chart */}
            <Box sx={{ flex: 1, minWidth: 400 }}>
              <Card>
                <CardHeader 
                  title="Продажи по дням"
                  action={
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleExport('sales')}
                      disabled={exportSalesMutation.isPending}
                      variant="outlined"
                    >
                      {exportSalesMutation.isPending ? 'Экспорт...' : 'CSV'}
                    </Button>
                  }
                />
                <CardContent>
                  {salesLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : salesError ? (
                    <Alert severity="error">Ошибка загрузки данных о продажах</Alert>
                  ) : salesData && salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [`${Number(value).toFixed(2)} лари`, 'Продажи']}
                          labelFormatter={(label) => `Дата: ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#8884d8" 
                          name="Продажи (лари)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет данных для отображения
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Occupancy Chart */}
            <Box sx={{ flex: 1, minWidth: 400 }}>
              <Card>
                <CardHeader 
                  title="Популярность столиков"
                  action={
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleExport('occupancy')}
                      disabled={exportOccupancyMutation.isPending}
                      variant="outlined"
                    >
                      {exportOccupancyMutation.isPending ? 'Экспорт...' : 'CSV'}
                    </Button>
                  }
                />
                <CardContent>
                  {occupancyLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                      <CircularProgress />
                    </Box>
                  ) : occupancyError ? (
                    <Alert severity="error">Ошибка загрузки данных о занятости</Alert>
                  ) : occupancyData && occupancyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={occupancyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="table_number" 
                          tickFormatter={(value) => `Стол ${value}`}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [`${value} бронирований`, 'Количество']}
                          labelFormatter={(label) => `Столик №${label}`}
                        />
                        <Legend />
                        <Bar 
                          dataKey="reservations_count" 
                          fill="#82ca9d" 
                          name="Бронирований"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      Нет данных для отображения
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* User Visits Chart */}
          <Box>
            <Card>
              <CardHeader 
                title="Активность пользователей"
                action={
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleExport('visits')}
                    disabled={exportVisitsMutation.isPending}
                    variant="outlined"
                  >
                    {exportVisitsMutation.isPending ? 'Экспорт...' : 'CSV'}
                  </Button>
                }
              />
              <CardContent>
                {visitsLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : visitsError ? (
                  <Alert severity="error">Ошибка загрузки данных о посещениях</Alert>
                ) : visitsData && visitsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={visitsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`${value} заходов`, 'Посещения']}
                        labelFormatter={(label) => `Дата: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total_visits" 
                        stroke="#ff7300" 
                        name="Всего заходов"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="text.secondary" align="center">
                    Нет данных для отображения
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default ReportsPage;