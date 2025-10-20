'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Cart, CartItem, cartService } from '@/lib/api/cart';
import { useAuth } from './auth-context';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Функция для обработки ошибок
  const handleError = (error: any, defaultMessage: string) => {
    const errorMessage = error?.message || defaultMessage;
    setError(errorMessage);
    console.error(errorMessage, error);
  };

  // Загрузка корзины
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'user') {
      setCart(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error: any) {
      // Если корзина пуста (404), это нормально
      if (error.message?.includes('404') || error.message?.includes('не найдена') || error.status === 404) {
        setCart(null);
        setError(null);
      } else {
        handleError(error, 'Ошибка загрузки корзины');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Добавить товар в корзину
  const addToCart = useCallback(async (itemId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      setError('Необходимо войти в систему для добавления товаров в корзину');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.addToCart(itemId, quantity);
      setCart(updatedCart);
    } catch (error: any) {
      handleError(error, 'Ошибка добавления товара в корзину');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Обновить количество товара
  const updateCartItem = useCallback(async (itemId: number, quantity: number) => {
    const previousCart = cart;
    
    try {
      setError(null);
      
      // Оптимистичное обновление: обновляем UI сразу
      if (cart) {
        const updatedItems = cart.items.map(item => 
          item.item_id === itemId 
            ? { ...item, quantity, total_price: item.unit_price * quantity }
            : item
        );
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
        
        setCart({
          ...cart,
          items: updatedItems,
          total_items: totalItems,
          total_amount: totalAmount
        });
      }
      
      // Отправляем запрос на сервер
      const updatedCart = await cartService.updateCartItem(itemId, quantity);
      setCart(updatedCart);
    } catch (error: any) {
      // Откатываем изменения в случае ошибки
      setCart(previousCart);
      handleError(error, 'Ошибка обновления количества товара');
      throw error;
    }
  }, [cart]);

  // Удалить товар из корзины
  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error: any) {
      handleError(error, 'Ошибка удаления товара из корзины');
      // В случае ошибки показываем ошибку, но не перезагружаем всю корзину
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Очистить корзину
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await cartService.clearCart();
      setCart(null);
    } catch (error: any) {
      handleError(error, 'Ошибка очистки корзины');
    } finally {
      setLoading(false);
    }
  }, []);

  // Получить общее количество товаров
  const getTotalItems = useCallback(() => {
    return cart?.total_items || 0;
  }, [cart]);

  // Получить общую сумму
  const getTotalAmount = useCallback(() => {
    return cart?.total_amount || 0;
  }, [cart]);

  // Загружаем корзину только когда пользователь авторизован
  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      refreshCart();
    } else {
      setCart(null);
      setError(null);
    }
  }, [isAuthenticated, user, refreshCart]);

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getTotalItems,
    getTotalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};