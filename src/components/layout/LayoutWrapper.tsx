'use client';

import React from 'react';
import { Box } from '@mui/material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HotkeysProvider from '@/components/HotkeysProvider';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <HotkeysProvider>
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </HotkeysProvider>
      <Footer />
    </Box>
  );
}