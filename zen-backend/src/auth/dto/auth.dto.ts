import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, MaxLength, MinLength, IsNumberString, Length } from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
} 

export class SendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumberString()
  @Length(4, 4)
  code: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumberString()
  @Length(4, 4)
  code: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}