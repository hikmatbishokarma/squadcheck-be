import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class CompleteOnboardingDto {
  @IsEnum(['Consistency', 'Weight Loss', 'Muscle Gain', 'General Fitness'])
  fitnessGoal: string;

  @IsEnum(['Morning', 'Evening', 'Night'])
  preferredTime: string;

  @IsBoolean()
  lookingForSquad: boolean;

  @IsEnum(['Cardio', 'Strength', 'HIIT', 'Yoga', 'Mixed'])
  @IsOptional()
  workoutStyle?: string;

  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  @IsOptional()
  fitnessLevel?: string;
}
