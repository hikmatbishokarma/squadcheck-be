import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LobbyService } from '../modules/lobby/lobby.service';
export declare class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private lobbyService;
    private jwtService;
    private configService;
    server: Server;
    private connectedUsers;
    constructor(lobbyService: LobbyService, jwtService: JwtService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinLobby(client: Socket, data: {
        gymId: string;
    }): Promise<void>;
    handleLeaveLobby(client: Socket, data: {
        gymId: string;
    }): Promise<void>;
    handleWorkoutFocus(client: Socket, data: {
        gymId: string;
        focus: string;
    }): Promise<void>;
    emitSquadFormed(gymId: string, squad: any): void;
    emitSquadUpdated(gymId: string, squad: any): void;
    emitSquadStreakUpdate(gymId: string, squadName: string, newStreak: number): void;
}
