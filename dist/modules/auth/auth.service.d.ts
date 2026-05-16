import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserDocument } from '../../database/schemas/user.schema';
import { LinkedinAuthDto } from './dto/linkedin-auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    private configService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService);
    linkedinAuth(dto: LinkedinAuthDto): Promise<{
        token: string;
        user: UserDocument;
    }>;
}
