import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PushSubscription, PushSubscriptionDocument } from '../../database/schemas/push-subscription.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(PushSubscription.name)
    private pushSubModel: Model<PushSubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async subscribe(userId: string, dto: SubscribeDto): Promise<{ ok: boolean }> {
    const user = await this.userModel.findById(userId).select('checkinHours');
    const preferredHour = this.computePreferredHour(user?.checkinHours ?? []);

    await this.pushSubModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        userId: new Types.ObjectId(userId),
        endpoint: dto.endpoint,
        p256dh: dto.p256dh,
        auth: dto.auth,
        preferredCheckinHour: preferredHour,
        enabled: true,
      },
      { upsert: true, new: true },
    );

    return { ok: true };
  }

  async unsubscribe(userId: string): Promise<{ ok: boolean }> {
    await this.pushSubModel.findOneAndDelete({ userId: new Types.ObjectId(userId) });
    return { ok: true };
  }

  async getSubscription(userId: string): Promise<PushSubscriptionDocument | null> {
    return this.pushSubModel.findOne({ userId: new Types.ObjectId(userId) });
  }

  // Returns users whose preferred check-in time is within the next 45 minutes
  async getUsersDueForReminder(): Promise<PushSubscriptionDocument[]> {
    const now = new Date();
    const targetHour = now.getHours();
    const targetMinute = now.getMinutes();

    // Notify users whose preferred hour is ~30-45 min away
    const reminderHour = targetMinute >= 15 ? targetHour + 1 : targetHour;

    return this.pushSubModel.find({
      enabled: true,
      preferredCheckinHour: reminderHour,
    });
  }

  private computePreferredHour(hours: number[]): number {
    if (hours.length === 0) return 18; // default 6pm
    const recent = hours.slice(-10);
    const sum = recent.reduce((a, b) => a + b, 0);
    return Math.round(sum / recent.length);
  }
}
