import { Model } from 'mongoose';
import { UserDocument } from '../../database/schemas/user.schema';
import { LobbySessionDocument } from '../../database/schemas/lobby-session.schema';
import { AiService } from '../ai/ai.service';
export interface StreakResult {
    newStreak: number;
    isWeekend: boolean;
    isWeekendBonus: boolean;
    alreadyCheckedIn: boolean;
    milestoneHit: boolean;
}
export declare class LobbyService {
    private userModel;
    private sessionModel;
    private aiService;
    constructor(userModel: Model<UserDocument>, sessionModel: Model<LobbySessionDocument>, aiService: AiService);
    joinLobby(userId: string, gymId: string): Promise<{
        users: UserDocument[];
        streakResult: StreakResult;
        user: UserDocument;
    }>;
    leaveLobby(userId: string, gymId: string): Promise<void>;
    setWorkoutFocus(userId: string, focus: string): Promise<UserDocument>;
    getActiveUsers(gymId: string): Promise<UserDocument[]>;
    getFamiliarFaces(userId: string, gymId: string): Promise<Array<{
        user: UserDocument;
        overlapCount: number;
    }>>;
    handleDisconnect(userId: string): Promise<void>;
    getInsights(gymId: string): Promise<{
        energy: string;
        insights: string[];
    }>;
}
