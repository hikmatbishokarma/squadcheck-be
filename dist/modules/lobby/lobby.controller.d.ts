import { LobbyService } from './lobby.service';
import { JwtPayload } from '../../types';
export declare class LobbyController {
    private readonly lobbyService;
    constructor(lobbyService: LobbyService);
    join(user: JwtPayload, gymId: string): Promise<{
        users: import("../../database/schemas/user.schema").UserDocument[];
        streakResult: import("./lobby.service").StreakResult;
        user: import("../../database/schemas/user.schema").UserDocument;
    }>;
    leave(user: JwtPayload, gymId: string): Promise<void>;
    setWorkoutFocus(user: JwtPayload, focus: string): Promise<import("../../database/schemas/user.schema").UserDocument>;
    getActiveUsers(gymId: string): Promise<import("../../database/schemas/user.schema").UserDocument[]>;
    getFamiliarFaces(user: JwtPayload, gymId: string): Promise<{
        user: import("../../database/schemas/user.schema").UserDocument;
        overlapCount: number;
    }[]>;
    getInsights(gymId: string): Promise<{
        energy: string;
        insights: string[];
    }>;
}
