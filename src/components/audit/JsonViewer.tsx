'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';

interface JsonViewerProps {
  data: any;
  title?: string;
  variant?: 'button' | 'chip';
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ 
  data, 
  title = 'JSON Data',
  variant = 'button' 
}) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const formatJson = (obj: any): string => {
    if (obj === null || obj === undefined) {
      return 'null';
    }
    
    try {
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return String(obj);
    }
  };

  const hasData = data !== null && data !== undefined && Object.keys(data || {}).length > 0;

  if (!hasData) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  const trigger = variant === 'chip' ? (
    <Chip
      icon={<CodeIcon />}
      label="JSON"
      size="small"
      onClick={handleOpen}
      sx={{ cursor: 'pointer' }}
      color="primary"
      variant="outlined"
    />
  ) : (
    <Button
      startIcon={<CodeIcon />}
      size="small"
      onClick={handleOpen}
      variant="outlined"
    >
      JSON
    </Button>
  );

  return (
    <>
      {trigger}
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CodeIcon />
            <Typography variant="h6">{title}</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {formatJson(data)}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};