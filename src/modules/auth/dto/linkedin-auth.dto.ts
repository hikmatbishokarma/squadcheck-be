import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkedinAuthDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
