'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AuditIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuditLogs } from '@/lib/hooks/useAudit';
import { JsonViewer } from '@/components/audit/JsonViewer';
import { AuditOperation } from '@/lib/api/types';

const AuditLogPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    table: '',
    operation: '' as AuditOperation | '',
    limit: 50,
  });

  const { 
    data: auditLogs = [], 
    isLoading, 
    error, 
    refetch 
  } = useAuditLogs(filters.table || filters.operation || filters.limit !== 50 ? {
    ...(filters.table && { table: filters.table }),
    ...(filters.operation && { operation: filters.operation }),
    limit: filters.limit,
  } : undefined);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefresh = () => {
    refetch();
  };

  const getOperationChip = (operation: string) => {
    const colors: Record<string, 'success' | 'warning' | 'error'> = {
      INSERT: 'success',
      UPDATE: 'warning',
      DELETE: 'error',
    };
    
    return (
      <Chip
        label={operation}
        color={colors[operation] || 'default'}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => router.push('/admin')}
            sx={{ mr: 2 }}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            <AuditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Журнал аудита
          </Typography>
        </Box>
        
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
          disabled={isLoading}
        >
          Обновить
        </Button>
      </Box>

      {/* Фильтры */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Фильтры
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ minWidth: 200, flexGrow: 1 }}>
              <TextField
                fullWidth
                label="Таблица"
                value={filters.table}
                onChange={(e) => handleFilterChange('table', e.target.value)}
                size="small"
                placeholder="Например: users"
              />
            </Box>
            <Box sx={{ minWidth: 200, flexGrow: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Операция</InputLabel>
                <Select
                  value={filters.operation}
                  onChange={(e) => handleFilterChange('operation', e.target.value)}
                  label="Операция"
                >
                  <MenuItem value="">Все</MenuItem>
                  <MenuItem value="INSERT">INSERT</MenuItem>
                  <MenuItem value="UPDATE">UPDATE</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ minWidth: 200, flexGrow: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Лимит записей</InputLabel>
                <Select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', e.target.value)}
                  label="Лимит записей"
                >
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Таблица аудита */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Записи аудита ({auditLogs.length})
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Ошибка при загрузке данных: {error.message}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Таблица</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID записи</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Операция</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Старые значения</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Новые значения</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Время</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Записи не найдены
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.audit_id} hover>
                        <TableCell>{log.audit_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.table_name}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {log.record_id || '—'}
                        </TableCell>
                        <TableCell>
                          {getOperationChip(log.operation)}
                        </TableCell>
                        <TableCell>
                          <JsonViewer 
                            data={log.old_values}
                            title="Старые значения"
                            variant="chip"
                          />
                        </TableCell>
                        <TableCell>
                          <JsonViewer 
                            data={log.new_values}
                            title="Новые значения"
                            variant="chip"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatDateTime(log.changed_at)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AuditLogPage;