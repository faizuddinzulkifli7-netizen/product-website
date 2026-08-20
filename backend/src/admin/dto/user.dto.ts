import { IsEmail, IsString, IsBoolean, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateAdminUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
