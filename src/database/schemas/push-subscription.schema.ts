import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PushSubscriptionDocument = PushSubscription & Document;

@Schema({ timestamps: true })
export class PushSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ required: true })
  p256dh: string;

  @Prop({ required: true })
  auth: string;

  // Computed preferred check-in hour (0-23) for smart notification scheduling
  @Prop()
  preferredCheckinHour: number;

  @Prop({ default: true })
  enabled: boolean;
}

export const PushSubscriptionSchema = SchemaFactory.createForClass(PushSubscription);
