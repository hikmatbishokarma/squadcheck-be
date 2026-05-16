import { Document, Types } from 'mongoose';
export type SquadDocument = Squad & Document;
export declare class Squad {
    squadName: string;
    gymId: Types.ObjectId;
    members: Types.ObjectId[];
    vibe: string;
    challenge: string;
    icebreaker: string;
    isActive: boolean;
    expiresAt: Date;
    squadStreak: number;
    lastSessionDate: Date;
    totalSessionsTogether: number;
}
export declare const SquadSchema: import("mongoose").Schema<Squad, import("mongoose").Model<Squad, any, any, any, Document<unknown, any, Squad, any, {}> & Squad & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Squad, Document<unknown, {}, import("mongoose").FlatRecord<Squad>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Squad> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
