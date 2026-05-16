import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    name: string;
    email: string;
    avatar: string;
    role: string;
    company: string;
    fitnessGoal: string;
    workoutStyle: string;
    preferredTime: string;
    fitnessLevel: string;
    lookingForSquad: boolean;
    onboardingCompleted: boolean;
    currentStreak: number;
    longestStreak: number;
    lastWeekdayCheckinDate: Date;
    weekendSessions: number;
    weekendBonuses: string[];
    totalCheckins: number;
    workoutFocus: string;
    checkinHours: number[];
    isOnline: boolean;
    currentGymId: Types.ObjectId;
    homeGymId: Types.ObjectId;
    streakCount: number;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
