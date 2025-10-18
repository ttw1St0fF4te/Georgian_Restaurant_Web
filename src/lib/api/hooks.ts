import { useQuery } from '@tanstack/react-query';
import { MenuService, RestaurantService } from './services';
import { MenuFilterParams } from './services/menu';
import { RestaurantFilterParams } from './services/restaurant';

// Menu hooks
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: MenuService.getCategories,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useMenuCategory = (id: number) => {
  return useQuery({
    queryKey: ['menu', 'categories', id],
    queryFn: () => MenuService.getCategoryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMenu = (filters?: MenuFilterParams) => {
  return useQuery({
    queryKey: ['menu', 'items', filters],
    queryFn: () => MenuService.getMenu(filters),
    staleTime: 2 * 60 * 1000, // 2 минуты для меню
  });
};

export const useMenuByCategory = (categoryId: number, filters?: MenuFilterParams) => {
  return useQuery({
    queryKey: ['menu', 'items', 'category', categoryId, filters],
    queryFn: () => MenuService.getMenuByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useMenuItem = (id: number) => {
  return useQuery({
    queryKey: ['menu', 'items', id],
    queryFn: () => MenuService.getMenuItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Restaurant hooks
export const useRestaurants = (filters?: RestaurantFilterParams) => {
  return useQuery({
    queryKey: ['restaurants', filters],
    queryFn: () => RestaurantService.getRestaurants(filters),
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

export const useRestaurant = (id: number) => {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => RestaurantService.getRestaurantById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};