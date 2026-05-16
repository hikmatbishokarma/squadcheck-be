import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGymDto {
  @IsString()
  @MinLength(2)
  gymName: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  address?: string;
}
