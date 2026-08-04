import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleType } from '../../database/entities/role.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '+94771234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: RoleType, example: RoleType.CUSTOMER, required: false })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
}