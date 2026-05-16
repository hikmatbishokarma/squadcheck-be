import { Model } from 'mongoose';
import { GymDocument } from '../../database/schemas/gym.schema';
import { UserDocument } from '../../database/schemas/user.schema';
import { CreateGymDto } from './dto/create-gym.dto';
export declare class GymsService {
    private gymModel;
    private userModel;
    constructor(gymModel: Model<GymDocument>, userModel: Model<UserDocument>);
    findAll(): Promise<GymDocument[]>;
    findById(id: string): Promise<GymDocument>;
    findByBranchId(branchId: string): Promise<GymDocument>;
    create(dto: CreateGymDto): Promise<GymDocument>;
    getActiveUsers(gymId: string): Promise<UserDocument[]>;
}
