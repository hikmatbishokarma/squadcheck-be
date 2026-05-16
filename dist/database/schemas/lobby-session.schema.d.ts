import { Document, Types } from 'mongoose';
export type LobbySessionDocument = LobbySession & Document;
export declare class LobbySession {
    userId: Types.ObjectId;
    gymId: Types.ObjectId;
    joinedAt: Date;
    leftAt: Date;
    durationMinutes: number;
    workoutFocus: string;
    dayOfWeek: number;
    isWeekend: boolean;
    coTrainees: Types.ObjectId[];
}
export declare const LobbySessionSchema: import("mongoose").Schema<LobbySession, import("mongoose").Model<LobbySession, any, any, any, Document<unknown, any, LobbySession, any, {}> & LobbySession & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, LobbySession, Document<unknown, {}, import("mongoose").FlatRecord<LobbySession>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<LobbySession> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
