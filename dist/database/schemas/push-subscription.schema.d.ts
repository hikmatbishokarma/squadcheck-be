import { Document, Types } from 'mongoose';
export type PushSubscriptionDocument = PushSubscription & Document;
export declare class PushSubscription {
    userId: Types.ObjectId;
    endpoint: string;
    p256dh: string;
    auth: string;
    preferredCheckinHour: number;
    enabled: boolean;
}
export declare const PushSubscriptionSchema: import("mongoose").Schema<PushSubscription, import("mongoose").Model<PushSubscription, any, any, any, Document<unknown, any, PushSubscription, any, {}> & PushSubscription & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PushSubscription, Document<unknown, {}, import("mongoose").FlatRecord<PushSubscription>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PushSubscription> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
