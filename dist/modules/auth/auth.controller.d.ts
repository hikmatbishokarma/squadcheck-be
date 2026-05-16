import { AuthService } from './auth.service';
import { LinkedinAuthDto } from './dto/linkedin-auth.dto';
import { JwtPayload } from '../../types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    linkedinAuth(dto: LinkedinAuthDto): Promise<{
        token: string;
        user: import("../../database/schemas/user.schema").UserDocument;
    }>;
    getMe(user: JwtPayload): JwtPayload;
}
