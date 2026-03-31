import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345', minLength: 4 })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty({ example: 'محمد أحمد' })
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiProperty({ example: 'Mohammed Ahmed' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiPropertyOptional({ enum: Role, default: Role.LEARNER })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'uuid-of-department' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: '+966501234567' })
  @IsOptional()
  @IsString()
  phone?: string;
}
