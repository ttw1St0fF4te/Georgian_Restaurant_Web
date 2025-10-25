export interface AuditLog {
  log_id: string;
  table_name: string;
  record_id: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: any;
  new_values?: any;
  timestamp: string;
}

export interface AuditStatistics {
  operationStats: Array<{
    table_name: string;
    operation: string;
    count: string;
  }>;
  tableStats: Array<{
    table_name: string;
    total_operations: string;
    inserts: string;
    updates: string;
    deletes: string;
  }>;
}