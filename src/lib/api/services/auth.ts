import { apiClient } from '../client';

export interface UserResponseDto {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  role_id: number;
  created_at: Date;
  last_login?: Date;
}

export class AuthService {
  // Получить всех пользователей (для менеджеров и админов)
  static async getAllUsers(): Promise<UserResponseDto[]> {
    const response = await apiClient.get('/auth/users');
    return response.data;
  }
}