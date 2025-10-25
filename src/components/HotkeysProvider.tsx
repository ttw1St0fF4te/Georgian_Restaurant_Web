'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth';

// Компонент, который слушает глобальные горячие клавиши (Cmd + 1..8) на macOS
export default function HotkeysProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Игнорируем ввода в полях и контент редактируемых областях
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isEditable = target.getAttribute && target.getAttribute('contenteditable') === 'true';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return;
      }

      // Только для macOS — используем metaKey (Cmd). Также допускаем ctrlKey (для несущих Mac клавиш)
      const isModifier = e.metaKey || e.ctrlKey;
      if (!isModifier) return;

      // Проверяем цифру от 1 до 8
      const key = e.key;
      if (!/^[1-8]$/.test(key)) return;

      e.preventDefault();

      switch (key) {
        case '1':
          router.push('/');
          break;
        case '2':
          router.push('/restaurants');
          break;
        case '3':
          router.push('/about');
          break;
        case '4':
          router.push('/cart');
          break;
        case '5':
          // профиль — если пользователь не авторизован, редирект на /auth/login
          if (authService.isAuthenticated()) router.push('/profile');
          else router.push('/auth/login');
          break;
        case '6':
          if (authService.isAuthenticated()) router.push('/profile/reservations');
          else router.push('/auth/login');
          break;
        case '7':
          if (authService.isAuthenticated()) router.push('/profile/orders');
          else router.push('/auth/login');
          break;
        case '8':
          // Logout
          authService.logout();
          router.push('/auth/login');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);

  return <>{children}</>;
}
