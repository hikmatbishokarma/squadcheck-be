import { SquadsService } from './squads.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { JwtPayload } from '../../types';
export declare class SquadsController {
    private readonly squadsService;
    constructor(squadsService: SquadsService);
    getSuggested(gymId: string): Promise<any[]>;
    getActive(gymId: string): Promise<import("../../database/schemas/squad.schema").SquadDocument[]>;
    formSquad(dto: CreateSquadDto): Promise<import("../../database/schemas/squad.schema").SquadDocument>;
    joinSquad(squadId: string, user: JwtPayload): Promise<import("../../database/schemas/squad.schema").SquadDocument>;
    leaveSquad(squadId: string, user: JwtPayload): Promise<import("../../database/schemas/squad.schema").SquadDocument>;
}
