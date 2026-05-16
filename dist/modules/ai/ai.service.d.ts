import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private model;
    private readonly logger;
    constructor(configService: ConfigService);
    generateGymInsights(users: Array<{
        fitnessLevel?: string;
        workoutFocus?: string;
        currentStreak?: number;
        preferredTime?: string;
    }>): Promise<{
        energy: string;
        insights: string[];
    }>;
    private computeFallbackInsights;
}
