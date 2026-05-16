export interface JwtPayload {
    sub: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface UserProfile {
    name: string;
    fitnessGoal: string;
    preferredTime: string;
    fitnessLevel: string;
}
export interface SquadContent {
    squadName: string;
    vibe: string;
    challenge: string;
    icebreaker: string;
}
