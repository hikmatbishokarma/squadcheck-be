import { Model } from 'mongoose';
import { SquadDocument } from '../../database/schemas/squad.schema';
import { UserDocument } from '../../database/schemas/user.schema';
import { CreateSquadDto } from './dto/create-squad.dto';
export declare class SquadsService {
    private squadModel;
    private userModel;
    constructor(squadModel: Model<SquadDocument>, userModel: Model<UserDocument>);
    getSuggestedSquads(gymId: string): Promise<any[]>;
    formSquad(dto: CreateSquadDto): Promise<SquadDocument>;
    getActiveSquads(gymId: string): Promise<SquadDocument[]>;
    joinSquad(squadId: string, userId: string): Promise<SquadDocument>;
    leaveSquad(squadId: string, userId: string): Promise<SquadDocument>;
    updateSquadStreak(squadId: string): Promise<{
        newStreak: number;
        milestoneHit: boolean;
    }>;
}
