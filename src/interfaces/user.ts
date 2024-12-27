import { UserRole } from '@/models/user.model';

export class UserLoginDto {
  email: string;
  password: string;
}

export class UserRegisterDto {
  full_name: string;
  telephone: string;
  address: string;
  email: string;
  role: UserRole;
  password: string;
  image?: string;
}

export class UserUpdateDto {
  id: string;
  full_name: string;
  telephone: string;
  address: string;
  role: UserRole;
  image: string;
}

export class UserResetPassDto {
  email: string;
}

export class UserType {
  id: string;
  full_name: string;
  telephone: string;
  address: string;
  role: UserRole;
  image: string;
}
