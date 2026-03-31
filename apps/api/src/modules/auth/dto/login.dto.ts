import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '12345' })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
