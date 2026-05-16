import { Model } from 'mongoose';
import { PushSubscriptionDocument } from '../../database/schemas/push-subscription.schema';
import { UserDocument } from '../../database/schemas/user.schema';
import { SubscribeDto } from './dto/subscribe.dto';
export declare class NotificationsService {
    private pushSubModel;
    private userModel;
    constructor(pushSubModel: Model<PushSubscriptionDocument>, userModel: Model<UserDocument>);
    subscribe(userId: string, dto: SubscribeDto): Promise<{
        ok: boolean;
    }>;
    unsubscribe(userId: string): Promise<{
        ok: boolean;
    }>;
    getSubscription(userId: string): Promise<PushSubscriptionDocument | null>;
    getUsersDueForReminder(): Promise<PushSubscriptionDocument[]>;
    private computePreferredHour;
}
