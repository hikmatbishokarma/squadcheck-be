import { UsersService } from './users.service';
import { JwtPayload } from '../../types';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SetHomeGymDto } from './dto/set-home-gym.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<import("../../database/schemas/user.schema").UserDocument>;
    completeOnboarding(user: JwtPayload, dto: CompleteOnboardingDto): Promise<import("../../database/schemas/user.schema").UserDocument>;
    updateProfile(user: JwtPayload, dto: UpdateUserDto): Promise<import("../../database/schemas/user.schema").UserDocument>;
    setHomeGym(user: JwtPayload, dto: SetHomeGymDto): Promise<import("../../database/schemas/user.schema").UserDocument>;
}
