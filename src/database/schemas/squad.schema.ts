import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SquadDocument = Squad & Document;

@Schema({ timestamps: true })
export class Squad {
  @Prop({ required: true })
  squadName: string;

  @Prop({ type: Types.ObjectId, ref: 'Gym', required: true })
  gymId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  members: Types.ObjectId[];

  @Prop()
  vibe: string;

  @Prop()
  challenge: string;

  @Prop()
  icebreaker: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: () => new Date(Date.now() + 4 * 60 * 60 * 1000) })
  expiresAt: Date;

  // Squad streak system
  @Prop({ default: 0 })
  squadStreak: number;

  @Prop()
  lastSessionDate: Date;

  @Prop({ default: 0 })
  totalSessionsTogether: number;
}

export const SquadSchema = SchemaFactory.createForClass(Squad);
