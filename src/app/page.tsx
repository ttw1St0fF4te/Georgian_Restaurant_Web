'use client';

import { Box, Typography, Card, CardContent, Chip, Grid, CircularProgress } from '@mui/material';
import { useHealth, useDatabaseHealth, useDatabaseInfo } from '../lib/hooks/useHealth';
import { useRecentAuditLogs } from '../lib/hooks/useAudit';

export default function ApiTestPage() {
  const { data: health, isLoading: healthLoading, error: healthError } = useHealth();
  const { data: dbHealth, isLoading: dbLoading, error: dbError } = useDatabaseHealth();
  const { data: dbInfo, isLoading: dbInfoLoading, error: dbInfoError } = useDatabaseInfo();
  const { data: auditLogs, isLoading: auditLoading, error: auditError } = useRecentAuditLogs(5);

  const StatusChip = ({ status, loading }: { status?: string; loading: boolean }) => {
    if (loading) return <CircularProgress size={20} />;
    if (status === 'OK') return <Chip label="OK" color="success" />;
    return <Chip label="ERROR" color="error" />;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        🇬🇪 Georgian Restaurant API Test
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Тестирование подключения к API грузинского ресторана
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* API Health Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 API Health Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography>Статус:</Typography>
                <StatusChip status={health?.status} loading={healthLoading} />
              </Box>
              {health && (
                <Box>
                  <Typography variant="body2">Service: {health.service}</Typography>
                  <Typography variant="body2">Time: {new Date(health.timestamp).toLocaleString()}</Typography>
                </Box>
              )}
              {healthError && (
                <Typography color="error" variant="body2">
                  Ошибка: {(healthError as any).message}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Database Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗄️ Database Health
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography>Подключение:</Typography>
                <StatusChip status={dbHealth?.status} loading={dbLoading} />
              </Box>
              {dbHealth && (
                <Box>
                  <Typography variant="body2">Database: {dbHealth.database}</Typography>
                  <Typography variant="body2">Connected: {dbHealth.connected ? 'Да' : 'Нет'}</Typography>
                </Box>
              )}
              {dbError && (
                <Typography color="error" variant="body2">
                  Ошибка: {(dbError as any).message}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Database Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Database Info
              </Typography>
              {dbInfoLoading && <CircularProgress />}
              {dbInfo && (
                <Box>
                  <Typography variant="body2">Version: {dbInfo.version?.split(' ').slice(0, 2).join(' ')}</Typography>
                  <Typography variant="body2">Database: {dbInfo.database}</Typography>
                  <Typography variant="body2">User: {dbInfo.user}</Typography>
                  <Typography variant="body2">Status: {dbInfo.connection_status}</Typography>
                </Box>
              )}
              {dbInfoError && (
                <Typography color="error" variant="body2">
                  Ошибка: {(dbInfoError as any).message}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Audit Logs */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Recent Audit Logs (5 latest)
              </Typography>
              {auditLoading && <CircularProgress />}
              {auditLogs && auditLogs.length > 0 ? (
                <Box>
                  {auditLogs.slice(0, 5).map((log) => (
                    <Box key={log.audit_id} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>{log.operation}</strong> в {log.table_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.changed_at).toLocaleString()} - {log.changed_by}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : auditLogs?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Нет записей аудита
                </Typography>
              ) : null}
              {auditError && (
                <Typography color="error" variant="body2">
                  Ошибка: {(auditError as any).message}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          ✅ Готово для разработки!
        </Typography>
        <Typography variant="body2">
          Веб-приложение успешно подключено к Georgian Restaurant API. 
          Теперь можно начинать параллельную разработку функционала.
        </Typography>
      </Box>
    </Box>
  );
}
