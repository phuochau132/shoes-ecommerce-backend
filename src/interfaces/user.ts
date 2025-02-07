import { UserRole } from '@/models/user.model';

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface UserRegisterDto {
  full_name: string;
  telephone: string;
  address: string;
  email: string;
  role: UserRole;
  password: string;
  image?: string;
}

export interface UserUpdateDto {
  id: string;
  full_name: string;
  telephone: string;
  address: string;
  role: UserRole;
  image: string;
}

export interface UserResetPassDto {
  email: string;
}

export interface UserType {
  id: string;
  full_name: string;
  telephone: string;
  address: string;
  role: UserRole;
  image: string;
}
