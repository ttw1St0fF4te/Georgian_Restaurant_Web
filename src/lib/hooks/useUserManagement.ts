import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/auth';

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role_id: number;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: number;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserData) => {
      const response = await authService.createUser(userData);
      return response;
    },
    onSuccess: () => {
      // Обновляем список пользователей после создания
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UpdateUserData }) => {
      const response = await authService.updateUser(userId, userData);
      return response;
    },
    onSuccess: () => {
      // Обновляем список пользователей после обновления
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await authService.deleteUser(userId);
      return response;
    },
    onSuccess: () => {
      // Обновляем список пользователей после удаления
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};