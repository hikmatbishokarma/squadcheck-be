import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  role?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  company?: string;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  fitnessLevel?: string;
}
