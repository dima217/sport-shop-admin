export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  uuid: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  isOAuthUser: boolean;
  profile: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateUserDto {
  role?: UserRole;
  isBanned?: boolean;
}

export interface UsersResponse {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

