import { Document } from 'mongoose';
export type GymDocument = Gym & Document;
export declare class Gym {
    gymName: string;
    city: string;
    address: string;
    activeUsersCount: number;
    tenantId: string;
    tenantName: string;
    branchId: string;
    branchName: string;
}
export declare const GymSchema: import("mongoose").Schema<Gym, import("mongoose").Model<Gym, any, any, any, Document<unknown, any, Gym, any, {}> & Gym & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Gym, Document<unknown, {}, import("mongoose").FlatRecord<Gym>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Gym> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
