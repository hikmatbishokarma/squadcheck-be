import { GymsService } from './gyms.service';
import { CreateGymDto } from './dto/create-gym.dto';
export declare class GymsController {
    private readonly gymsService;
    constructor(gymsService: GymsService);
    findAll(): Promise<import("../../database/schemas/gym.schema").GymDocument[]>;
    findByBranch(branchId: string): Promise<import("../../database/schemas/gym.schema").GymDocument>;
    findOne(id: string): Promise<import("../../database/schemas/gym.schema").GymDocument>;
    getActiveUsers(id: string): Promise<import("../../database/schemas/user.schema").UserDocument[]>;
    create(dto: CreateGymDto): Promise<import("../../database/schemas/gym.schema").GymDocument>;
}
