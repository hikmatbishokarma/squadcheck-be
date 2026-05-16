import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GymDocument = Gym & Document;

@Schema({ timestamps: true })
export class Gym {
  @Prop({ required: true })
  gymName: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  address: string;

  @Prop({ default: 0 })
  activeUsersCount: number;

  // Tenant / branch identity (set via seed)
  @Prop()
  tenantId: string;

  @Prop()
  tenantName: string;

  // Unique URL-safe slug used for QR code routing: /join/:branchId
  @Prop({ unique: true, sparse: true })
  branchId: string;

  @Prop()
  branchName: string;
}

export const GymSchema = SchemaFactory.createForClass(Gym);
