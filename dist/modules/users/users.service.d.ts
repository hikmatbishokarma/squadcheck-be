import { Model } from 'mongoose';
import { UserDocument } from '../../database/schemas/user.schema';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    findById(id: string): Promise<UserDocument>;
    completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<UserDocument>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<UserDocument>;
    setHomeGym(userId: string, gymId: string): Promise<UserDocument>;
}
