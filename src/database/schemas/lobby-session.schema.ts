import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LobbySessionDocument = LobbySession & Document;

@Schema({ timestamps: true })
export class LobbySession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Gym', required: true })
  gymId: Types.ObjectId;

  @Prop({ default: Date.now })
  joinedAt: Date;

  @Prop()
  leftAt: Date;

  @Prop()
  durationMinutes: number;

  @Prop({ enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Full Body', 'Recovery'] })
  workoutFocus: string;

  // 0=Sun, 1=Mon...6=Sat
  @Prop()
  dayOfWeek: number;

  @Prop({ default: false })
  isWeekend: boolean;

  // Other users who were in the same gym during this session (populated on leave)
  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  coTrainees: Types.ObjectId[];
}

export const LobbySessionSchema = SchemaFactory.createForClass(LobbySession);
