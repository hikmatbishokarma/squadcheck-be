import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  avatar: string;

  @Prop()
  role: string;

  @Prop()
  company: string;

  @Prop({ enum: ['Consistency', 'Weight Loss', 'Muscle Gain', 'General Fitness'] })
  fitnessGoal: string;

  @Prop({ enum: ['Cardio', 'Strength', 'HIIT', 'Yoga', 'Mixed'] })
  workoutStyle: string;

  @Prop({ enum: ['Morning', 'Evening', 'Night'] })
  preferredTime: string;

  @Prop({ enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' })
  fitnessLevel: string;

  @Prop({ default: false })
  lookingForSquad: boolean;

  @Prop({ default: false })
  onboardingCompleted: boolean;

  // Streak system
  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop()
  lastWeekdayCheckinDate: Date;

  @Prop({ default: 0 })
  weekendSessions: number;

  @Prop({ type: [String], default: [] })
  weekendBonuses: string[];

  @Prop({ default: 0 })
  totalCheckins: number;

  // Today's workout focus (reset each session)
  @Prop({ enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Full Body', 'Recovery'] })
  workoutFocus: string;

  // Last 20 check-in hours (0-23) for smart notification timing
  @Prop({ type: [Number], default: [] })
  checkinHours: number[];

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Gym' })
  currentGymId: Types.ObjectId;

  // Home gym — set once via QR scan during onboarding
  @Prop({ type: Types.ObjectId, ref: 'Gym' })
  homeGymId: Types.ObjectId;

  // Keep for backward compat — mirrors currentStreak
  @Prop({ default: 0 })
  streakCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
