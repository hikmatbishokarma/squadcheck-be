import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { JwtPayload } from '../../types';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    subscribe(user: JwtPayload, dto: SubscribeDto): Promise<{
        ok: boolean;
    }>;
    unsubscribe(user: JwtPayload): Promise<{
        ok: boolean;
    }>;
    getSubscription(user: JwtPayload): Promise<import("../../database/schemas/push-subscription.schema").PushSubscriptionDocument>;
}
